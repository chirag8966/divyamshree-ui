import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common'

@Component({
  selector: 'app-image-gallery',
  imports: [NgOptimizedImage],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
})
export class ImageGalleryComponent {
  images = [
    {
      src: 'images/coffee-product-1.jpeg',
      alt: 'Divyam Shree Cold Coffee Product',
      title: 'Premium Cold Coffee Mix'
    },
    {
      src: 'images/coffee-product-2.jpeg',
      alt: 'Divyam Shree Coffee Packaging',
      title: 'Rich & Creamy Blend'
    },
    {
      src: 'images/coffee-lifestyle-1.jpeg',
      alt: 'Coffee Lifestyle Image',
      title: 'Perfect Morning Brew'
    },
    {
      src: 'images/coffee-lifestyle-2.jpeg',
      alt: 'Coffee Experience',
      title: 'Indulgent Coffee Moment'
    }
  ];
}
