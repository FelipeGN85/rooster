import { Component } from '@angular/core';

import { BrandMark } from '../brand-mark/brand-mark';

const PROFILE_URL = 'https://www.linkedin.com/in/felipe-nascimento-07b27013';

let nextStampId = 0;

/**
 * The torn-off end of a ticket: notched sides and a dashed perforation, with a
 * faint rubber stamp over the corner that links to the author. The wrapper
 * carries the shadow, since the ticket's own mask would clip one.
 */
@Component({
  selector: 'app-footer',
  imports: [BrandMark],
  template: `
    <div class="ticket-shadow">
      <div class="ticket">
        <app-brand-mark class="mark" />
        <span class="perforation" aria-hidden="true"></span>
        <div class="copy">
          <p class="kicker">Admit two · X &amp; O</p>
          <p class="tagline">Three in a row, and you crow.</p>
        </div>

        <a
          class="stamp"
          [href]="profileUrl"
          target="_blank"
          rel="noopener noreferrer"
          title="FelipeGN85 on LinkedIn"
          aria-label="FelipeGN85 on LinkedIn (opens in a new tab)"
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <path [attr.id]="bandId" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
            </defs>
            <g fill="none" stroke="currentColor">
              <circle cx="50" cy="50" r="47" stroke-width="2.4" />
              <circle cx="50" cy="50" r="27" stroke-width="1.4" />
            </g>
            <text fill="currentColor" font-size="9.5" font-weight="800">
              <!-- Stretched to the band's length, so it closes the circle whatever the font. -->
              <textPath [attr.href]="'#' + bandId" textLength="228" lengthAdjust="spacing">
                MADE BY FELIPEGN85 · EST. 2022 ·
              </textPath>
            </text>
            <rect x="38" y="38" width="24" height="24" rx="5" fill="currentColor" />
            <text x="50" y="56.5" text-anchor="middle" font-size="15" font-weight="800" fill="#ffffff">
              in
            </text>
          </svg>
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 768px;
      margin: 0 auto;
      padding: 16px 16px 40px;
    }
    .ticket-shadow {
      max-width: 576px;
      margin: 0 auto;
      filter: drop-shadow(0 1px 1px rgb(60 45 0 / 0.12)) drop-shadow(0 8px 18px rgb(60 45 0 / 0.18));
    }
    /* Notches are cut with a mask, not painted, so the wallpaper shows through. */
    .ticket {
      --notch-left: radial-gradient(circle 12px at 0 50%, transparent 98%, #000);
      --notch-right: radial-gradient(circle 12px at 100% 50%, transparent 98%, #000);
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-radius: 16px;
      background: linear-gradient(180deg, var(--white) 0%, var(--cream) 100%);
      -webkit-mask-image: var(--notch-left), var(--notch-right);
      -webkit-mask-composite: source-in;
      mask-image: var(--notch-left), var(--notch-right);
      mask-composite: intersect;
    }
    .mark {
      width: 36px;
      height: 36px;
    }
    .perforation {
      flex-shrink: 0;
      height: 56px;
      border-left: 2px dashed var(--line);
    }
    /* Right padding keeps the tagline from running under the stamp. */
    .copy {
      min-width: 0;
      padding-right: 72px;
    }
    .kicker {
      margin: 0;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #5c5235;
    }
    .tagline {
      margin: 2px 0 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .stamp {
      position: absolute;
      top: 50%;
      right: 16px;
      display: block;
      border-radius: 999px;
      color: var(--stamp);
      transform: translateY(-50%);
    }
    /* Faint at rest, full strength on hover or focus: the hint that it goes somewhere. */
    .stamp svg {
      display: block;
      width: 76px;
      height: 76px;
      opacity: 0.4;
      transform: rotate(-14deg);
      transition: opacity 200ms ease;
    }
    .stamp:hover svg,
    .stamp:focus-visible svg {
      opacity: 1;
    }
    text {
      font-family: var(--font-body);
    }
  `,
})
export class AppFooter {
  protected readonly profileUrl = PROFILE_URL;
  /** Scoped per instance, so two stamps on one page never share a path. */
  protected readonly bandId = `stamp-band-${nextStampId++}`;
}
