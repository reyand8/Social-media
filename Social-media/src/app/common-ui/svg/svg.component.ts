import { Component, Input } from '@angular/core';


@Component({
  selector: 'svg[icon]',
  standalone: true,
  imports: [],
  template: '<svg:use [attr.href]="href"></svg:use>',
  styles: ['']
})
export class SvgComponent {
  @Input() icon: string = '';

  get href() {
    return `/assets/img/svg/${this.icon}.svg#${this.icon}`
  }
}
