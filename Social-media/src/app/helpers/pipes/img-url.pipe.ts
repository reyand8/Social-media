import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'imgUrl',
  standalone: true
})
export class ImgUrlPipe implements PipeTransform {
  /**
   * Transforms a relative image path into a full URL.
   * @param value - The relative image path or null.
   * @returns The full image URL or null if the input is invalid.
   */
  transform(value: string | null): string | null {
    if (!value) return null
    return `http://localhost:5001${value}`;
  }
}
