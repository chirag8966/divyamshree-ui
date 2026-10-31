#!/usr/bin/env node
/**
 * Deploy the built site to S3.
 *
 * End state: the bucket contains exactly what dist/ contains, stale objects
 * pruned. We use `s3 sync --delete` rather than `s3 rm --recursive` + upload
 * because that produces the same final state without a window where the bucket
 * is empty, and without leaving a half-uploaded site behind if a step fails.
 *
 * Three passes, because `s3 sync` cannot apply different Cache-Control values
 * by pattern and skips unchanged files (so a later pass would not re-tag them):
 *
 *   1. everything except assets/ and index.html -> 1 day cache, --delete prunes
 *   2. assets/                                 -> 1 year immutable, --delete prunes
 *   3. index.html                              -> no-cache, written last
 *
 * index.html must be revalidated on every visit or a returning browser keeps a
 * cached copy referencing hashed chunks that pass 2 just deleted.
 *
 * Config (env vars, falling back to a gitignored .env.deploy in the repo root):
 *   S3_BUCKET                    required, e.g. divyamshree.com
 *   AWS_REGION                   default us-east-1
 *   CLOUDFRONT_DISTRIBUTION_ID   optional; triggers an invalidation
 *   S3_PREFIX                    optional key prefix, e.g. "site/"
 *
 * Credentials come from the standard AWS chain (~/.aws/credentials, or
 * AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in the environment).
 *
 * Usage:
 *   node scripts/deploy_s3.mjs                 # verify, build, deploy
 *   node scripts/deploy_s3.mjs --skip-verify   # deploy the existing dist/
 *   node scripts/deploy_s3.mjs --dry-run       # show what would change
 *   node scripts/deploy_s3.mjs --allow-empty   # permit deploying an empty dist/
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';
const MEDIA_CACHE = 'public, max-age=86400';
const HTML_CACHE = 'no-cache, must-revalidate';

const argv = process.argv.slice(2);
const hasFlag = (flag) => argv.includes(flag);

const skipVerify = hasFlag('--skip-verify');
const dryRun = hasFlag('--dry-run');
const allowEmpty = hasFlag('--allow-empty');

/** Minimal KEY=VALUE reader for a gitignored .env.deploy; real env wins. */
function loadDeployEnv() {
  const file = path.join(rootDir, '.env.deploy');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/**
 * Resolve the aws CLI to an absolute path.
 *
 * The gateway runs this unattended as a launchd service with a minimal,
 * install-time PATH, so we cannot rely on a shell profile having exported
 * ~/.local/bin. Probe the usual locations and use the first that runs.
 */
function resolveAwsCli() {
  const candidates = [
    process.env.AWS_CLI_PATH,
    path.join(os.homedir(), '.local', 'bin', 'aws'),
    '/opt/homebrew/bin/aws',
    '/usr/local/bin/aws',
    '/usr/bin/aws',
  ].filter(Boolean);

  // Fall back to whatever PATH resolves to, for non-macOS / unusual layouts.
  try {
    const onPath = execFileSync('which', ['aws'], { encoding: 'utf8' }).trim();
    if (onPath) candidates.push(onPath);
  } catch {
    // `which` missing or aws not on PATH — the absolute candidates still apply.
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      const version = execFileSync(candidate, ['--version'], { encoding: 'utf8', timeout: 60000 }).trim();
      return { bin: candidate, version };
    } catch {
      // Exists but broken (e.g. a pyexpat ABI mismatch) — try the next one.
      console.warn(`  ⚠ ${candidate} exists but is not runnable, skipping`);
    }
  }

  return null;
}

let AWS; // resolved once, below

function run(command, args, label) {
  console.log(`\n▸ ${label}`);
  // Quote anything containing a space so the logged command is unambiguous
  // (argv is passed directly to execFile, so this is display only).
  const printable = [command, ...args].map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
  console.log(`  $ ${printable}\n`);
  try {
    execFileSync(command, args, { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    fail(`${label} failed (${err.status ?? 'error'}). Nothing further was attempted.`);
  }
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return total;
}

loadDeployEnv();

const bucket = (process.env.S3_BUCKET || '').trim();
const region = (process.env.AWS_REGION || 'us-east-1').trim();
const cloudfrontId = (process.env.CLOUDFRONT_DISTRIBUTION_ID || '').trim();
const rawPrefix = (process.env.S3_PREFIX || '').trim().replace(/^\/+|\/+$/g, '');
const prefix = rawPrefix ? `${rawPrefix}/` : '';

if (!bucket) {
  fail(`S3_BUCKET is not set.

Set it once in .env.deploy (gitignored) or export it:

  echo 'S3_BUCKET=your-bucket-name' >> .env.deploy
  echo 'AWS_REGION=ap-south-1'       >> .env.deploy

Credentials belong in ~/.aws/credentials, never in this repo.`);
}

// .DS_Store rides along from public/ into dist/ — never upload it.
const BASE_EXCLUDES = ['--exclude', '*.DS_Store', '--exclude', '.DS_Store'];

console.log('S3 deploy');
console.log(`  bucket : s3://${bucket}/${prefix}`);
console.log(`  region : ${region}`);
console.log(`  source : ${distDir}`);
if (cloudfrontId) console.log(`  cdn    : CloudFront ${cloudfrontId}`);
if (dryRun) console.log('  mode   : DRY RUN — nothing will be written');
if (prefix) console.log(`  note   : deploying under the "${rawPrefix}/" prefix`);

AWS = resolveAwsCli();
if (!AWS) {
  fail(`AWS CLI not found or not runnable.

Expected one of:
  ~/.local/bin/aws
  /opt/homebrew/bin/aws
  /usr/local/bin/aws

Install it user-locally (no sudo):
  curl -sS -o /tmp/AWSCLIV2.pkg https://awscli.amazonaws.com/AWSCLIV2.pkg
  pkgutil --expand-full /tmp/AWSCLIV2.pkg /tmp/awsexpanded
  mkdir -p ~/.local/aws-cli && cp -R /tmp/awsexpanded/aws-cli.pkg/Payload/aws-cli/. ~/.local/aws-cli/
  ln -sf ~/.local/aws-cli/aws ~/.local/bin/aws

Or point AWS_CLI_PATH at an existing binary.`);
}
console.log(`  aws    : ${AWS.bin} (${AWS.version})`);

// Fail before touching the bucket if credentials are absent or expired.
console.log('\n▸ Verify AWS credentials');
try {
  const identity = execFileSync(AWS.bin, ['sts', 'get-caller-identity', '--output', 'json'], {
    encoding: 'utf8',
    timeout: 60000,
  });
  const { Account, Arn } = JSON.parse(identity);
  console.log(`  ✓ account ${Account}`);
  console.log(`  ✓ identity ${Arn}`);
} catch {
  fail(`AWS credentials are missing, invalid, or expired.

Configure them once (they are never stored in this repo):

  aws configure --profile default
    AWS Access Key ID     : <access key>
    AWS Secret Access Key : <secret>
    Default region name   : ${region}

Or put them in ~/.aws/credentials:
  [default]
  aws_access_key_id = ...
  aws_secret_access_key = ...

Verify with:  ${AWS.bin} s3 ls s3://${bucket}/`);
}

/**
 * Report the git state the deploy is built from.
 *
 * The build reflects the WORKING TREE, not the last commit. This project is
 * routinely edited by more than one agent at once, so an uncommitted or
 * mid-edit tree can ship silently. Surface it loudly; --require-clean turns
 * the warning into a hard gate.
 */
function reportGitState() {
  const git = (args) => {
    try {
      return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', timeout: 30000 }).trim();
    } catch {
      return '';
    }
  };

  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const sha = git(['rev-parse', '--short', 'HEAD']);
  const dirty = git(['status', '--porcelain']);

  console.log('\n▸ Git state');
  if (branch || sha) {
    console.log(`  branch : ${branch || '(detached)'}`);
    console.log(`  commit : ${sha || '(no commits)'}`);
  } else {
    console.log('  (not a git repository or git unavailable)');
  }

  const requireClean = hasFlag('--require-clean');
  if (!dirty) {
    console.log('  ✓ working tree clean — deploying exactly this commit');
    return;
  }

  const files = dirty.split('\n').filter(Boolean);
  const message = `working tree has ${files.length} uncommitted change(s) — the deploy reflects
the WORKING TREE, not commit ${sha || '(none)'}. If another agent is mid-edit, this ships a torn state.`;

  if (requireClean) fail(`${message}\n\nCommit or stash first, or drop --require-clean.`);

  console.warn(`  ⚠ ${message}`);
  for (const line of files.slice(0, 20)) console.warn(`      ${line}`);
  if (files.length > 20) console.warn(`      … and ${files.length - 20} more`);
}

reportGitState();

if (!skipVerify) {
  run('npm', ['run', 'verify'], 'Verify (lint + test + build)');
} else {
  if (!existsSync(distDir)) fail('--skip-verify given but dist/ does not exist. Run `npm run build` first.');
  console.log('\n▸ Verify skipped (--skip-verify)');
}

if (!existsSync(distDir)) fail('dist/ does not exist after the build step.');

const fileCount = countFiles(distDir);
if (fileCount === 0) fail('dist/ is empty.');
if (fileCount <= 1 && !allowEmpty) {
  fail(`dist/ contains only ${fileCount} file, which almost certainly means the build did not run.
If this is genuinely intended, re-run with --allow-empty.`);
}
console.log(`\n  ${fileCount} files staged in dist/`);

const target = (suffix = '') => `s3://${bucket}/${prefix}${suffix}`;

// Pass 1 — public/, media, and root files. --delete prunes stale objects here.
// assets/ and index.html are excluded so --delete leaves them to passes 2 and 3.
run(
  AWS.bin,
  [
    's3', 'sync', `${distDir}/`, target(),
    '--delete',
    '--exclude', 'assets/*',
    '--exclude', 'index.html',
    ...BASE_EXCLUDES,
    '--cache-control', MEDIA_CACHE,
    '--region', region,
    ...(dryRun ? ['--dryrun'] : []),
  ],
  'Pass 1/3 — site files and media (1 day cache, pruning stale objects)'
);

// Pass 2 — content-hashed bundles. Safe to cache forever.
if (existsSync(path.join(distDir, 'assets'))) {
  run(
    AWS.bin,
    [
      's3', 'sync', `${path.join(distDir, 'assets')}/`, target('assets/'),
      '--delete',
      ...BASE_EXCLUDES,
      '--cache-control', IMMUTABLE_CACHE,
      '--region', region,
      ...(dryRun ? ['--dryrun'] : []),
    ],
    'Pass 2/3 — hashed assets (1 year immutable, pruning stale bundles)'
  );
}

// Pass 3 — the entry document, written last so it never points at missing chunks.
run(
  AWS.bin,
  [
    's3', 'cp', path.join(distDir, 'index.html'), target('index.html'),
    '--cache-control', HTML_CACHE,
    '--content-type', 'text/html; charset=utf-8',
    '--region', region,
    ...(dryRun ? ['--dryrun'] : []),
  ],
  'Pass 3/3 — index.html (always revalidated)'
);

if (cloudfrontId) {
  run(
    AWS.bin,
    [
      'cloudfront', 'create-invalidation',
      '--distribution-id', cloudfrontId,
      '--paths', '/*',
    ],
    'Invalidate CloudFront cache'
  );
} else if (!dryRun) {
  console.log('\n▸ No CLOUDFRONT_DISTRIBUTION_ID set — skipping CDN invalidation.');
}

if (dryRun) {
  console.log('\n✅ Dry run complete. No changes were made.\n');
} else {
  console.log(`\n✅ Deployed ${fileCount} files to s3://${bucket}/${prefix}`);
  console.log(`   index.html is revalidated on every visit; hashed assets are cached for a year.`);
  if (cloudfrontId) console.log('   CloudFront invalidation submitted — allow ~1 minute to propagate.');
  console.log('');
}
