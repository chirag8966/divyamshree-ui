import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';

@Component({
  selector: 'app-hero',
  imports: [ImageGalleryComponent, FooterComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
}

