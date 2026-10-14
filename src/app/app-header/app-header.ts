import { Component, output } from '@angular/core';

import { BrandMark } from '../brand-mark/brand-mark';

/** A frosted pill that floats over the wallpaper and stays pinned on scroll. */
@Component({
  selector: 'app-header',
  imports: [BrandMark],
  template: `
    <div class="pill">
      <div class="brand">
        <app-brand-mark class="mark" />
        <span class="wordmark">Rooster</span>
      </div>

      <button
        type="button"
        class="btn btn-dark action"
        aria-label="Start a new round"
        (click)="newRound.emit()"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5 V19 M5 12 H19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
        </svg>
        <span class="label">New round</span>
      </button>
    </div>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 30;
      display: block;
      width: 100%;
      max-width: var(--content);
      margin: 0 auto;
      padding: var(--space-s) var(--space-l) 0;
    }
    /* No set height: the button and padding decide it (that sum is --header-height). */
    .pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-s);
      padding: var(--space-2xs) var(--space-2xs) var(--space-2xs) var(--space-s);
      border: 1px solid rgb(255 255 255 / 0.9);
      border-radius: var(--radius-pill);
      background: rgb(255 255 255 / 0.85);
      box-shadow: var(--shadow-float);
      backdrop-filter: blur(12px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      white-space: nowrap;
    }
    .mark {
      width: calc(var(--tap) * 0.85);
      aspect-ratio: 1;
    }
    .wordmark {
      font-family: var(--font-display);
      font-size: calc(var(--text-l) * 1.2);
      line-height: 1;
    }
    .action {
      min-width: var(--tap);
      padding: 0 var(--space-s);
    }
    /* A round + on the narrowest phones; the words wherever they fit. */
    .label {
      display: none;
    }
    @media (min-width: 22.5em) {
      .label {
        display: inline;
      }
    }
  `,
})
export class AppHeader {
  readonly newRound = output();
}
