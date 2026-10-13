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
        <!-- A round + on phones; from 640px up there is room to say what it does. -->
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
      max-width: 768px;
      margin: 0 auto;
      padding: 12px 16px 0;
    }
    .pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      height: 64px;
      padding: 8px 10px 8px 12px;
      border: 1px solid rgb(255 255 255 / 0.9);
      border-radius: 999px;
      background: rgb(255 255 255 / 0.85);
      box-shadow: var(--shadow-float);
      backdrop-filter: blur(12px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
    }
    .mark {
      width: 40px;
      height: 40px;
    }
    .wordmark {
      font-family: var(--font-display);
      font-size: 24px;
      line-height: 1;
    }
    .action {
      min-width: 44px;
      padding: 0 12px;
      font-size: 16px;
    }
    .label {
      display: none;
    }
    @media (min-width: 640px) {
      .action {
        padding: 0 16px;
      }
      .label {
        display: inline;
      }
    }
  `,
})
export class AppHeader {
  readonly newRound = output();
}
