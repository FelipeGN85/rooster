import { Component } from '@angular/core';

/** The logo: a tiny board with one X and one O. Size it from outside. */
@Component({
  selector: 'app-brand-mark',
  template: `
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#111111" />
      <path
        d="M15 9 V31 M25 9 V31 M9 15 H31 M9 25 H31"
        stroke="#FFFFFF"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <path
        d="M10.5 10.5 L13.5 13.5 M13.5 10.5 L10.5 13.5"
        stroke="#FF3B4E"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <circle cx="20" cy="20" r="2" stroke="#2F9BFF" stroke-width="1.6" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
      flex-shrink: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class BrandMark {}
