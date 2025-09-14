import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { LogoComponent } from "./components/logo/logo.component";

@Component({
  selector: 'app-root',
  imports: [HeroComponent, LogoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'divyamshree-ui';
}
