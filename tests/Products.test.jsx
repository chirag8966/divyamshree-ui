import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Products from '../src/Products';

const PRODUCTS = [
  { name: 'Divyam Shree Premium Regular Tea, Hand-Picked Leaves, 1kg Pack, High Protein Content, Made in India', category: 'Tea', url: 'https://www.amazon.in/dp/B0FXM25FWZ', price: '₹349' },
  { name: 'Divyam Shree Cold Coffee Instant Mix', category: 'Coffee', url: 'https://www.amazon.in/dp/B0FXLWDMJD', price: '₹229' },
  { name: 'Divyam Shree Authentic Jeerawan Masala', category: 'Spices', url: 'https://www.amazon.in/dp/B0FXLV22SX', price: '₹59' },
];

const cards = () => screen.getAllByRole('article');

describe('Products', () => {
  it('renders every product in the pantry by default', () => {
    render(<Products />);
    expect(cards()).toHaveLength(3);
    for (const product of PRODUCTS) {
      expect(screen.getByRole('heading', { level: 3, name: product.name })).toBeInTheDocument();
    }
  });

  it('links each card to its Amazon listing in a new tab with a safe rel', () => {
    render(<Products />);
    for (const product of PRODUCTS) {
      const link = screen.getByRole('link', { name: `Buy ${product.name} on Amazon` });
      expect(link).toHaveAttribute('href', product.url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('shows the price pulled from the price-fetch script', () => {
    render(<Products />);
    const tea = screen.getByRole('heading', { level: 3, name: PRODUCTS[0].name }).closest('article');
    expect(within(tea).getByText(PRODUCTS[0].price)).toBeInTheDocument();
    expect(tea.querySelector('[itemprop="price"]')).toHaveAttribute('content', '349');
  });

  it('marks up each card as a schema.org Product offer', () => {
    render(<Products />);
    const tea = screen.getByRole('heading', { level: 3, name: PRODUCTS[0].name }).closest('article');
    expect(tea).toHaveAttribute('itemtype', 'https://schema.org/Product');
    expect(tea.querySelector('[itemprop="priceCurrency"]')).toHaveAttribute('content', 'INR');
    expect(tea.querySelector('[itemprop="availability"]')).toHaveAttribute('content', 'https://schema.org/InStock');
  });

  it('filters the grid to a single category tab', async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(screen.getByRole('tab', { name: 'Coffee' }));

    expect(cards()).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 3, name: PRODUCTS[1].name })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Coffee' })).toHaveAttribute('aria-selected', 'true');
  });

  it('returns to the full pantry from the All Products tab', async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(screen.getByRole('tab', { name: 'Spices & Masala' }));
    expect(cards()).toHaveLength(1);

    await user.click(screen.getByRole('tab', { name: 'All Products' }));
    expect(cards()).toHaveLength(3);
  });

  it('exposes all four category tabs', () => {
    render(<Products />);
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'All Products',
      'Tea',
      'Coffee',
      'Spices & Masala',
    ]);
  });
});
