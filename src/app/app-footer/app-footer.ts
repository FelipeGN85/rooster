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
            <text
              x="50"
              y="56.5"
              text-anchor="middle"
              font-size="15"
              font-weight="800"
              fill="#ffffff"
            >
              in
            </text>
          </svg>
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      --stamp-size: clamp(4rem, 3.4rem + 2vw, 4.75rem);
      display: block;
      width: 100%;
      max-width: var(--content);
      margin: 0 auto;
      padding: var(--space-l) var(--space-l) var(--space-xl);
    }
    .ticket-shadow {
      max-width: var(--content-narrow);
      margin: 0 auto;
      filter: drop-shadow(0 1px 1px rgb(60 45 0 / 0.12)) drop-shadow(0 8px 18px rgb(60 45 0 / 0.18));
    }
    /* Notches are cut with a mask, not painted, so the wallpaper shows through. */
    .ticket {
      --notch: var(--space-s);
      --notch-left: radial-gradient(circle var(--notch) at 0 50%, transparent 98%, #000);
      --notch-right: radial-gradient(circle var(--notch) at 100% 50%, transparent 98%, #000);
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--space-m);
      padding: var(--space-m) var(--space-l);
      border-radius: var(--radius-m);
      background: linear-gradient(180deg, var(--white) 0%, var(--cream) 100%);
      -webkit-mask-image: var(--notch-left), var(--notch-right);
      -webkit-mask-composite: source-in;
      mask-image: var(--notch-left), var(--notch-right);
      mask-composite: intersect;
    }
    .mark {
      width: calc(var(--tap) * 0.8);
      aspect-ratio: 1;
    }
    /* As tall as the text beside it, whatever size that is. */
    .perforation {
      flex-shrink: 0;
      align-self: stretch;
      border-left: var(--border) dashed var(--line);
    }
    /* Right padding keeps the tagline from running under the stamp. */
    .copy {
      min-width: 0;
      padding-right: var(--stamp-size);
    }
    .kicker {
      margin: 0;
      font-size: var(--text-2xs);
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #5c5235;
    }
    .tagline {
      margin: var(--space-3xs) 0 0;
      font-size: var(--text-l);
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .stamp {
      position: absolute;
      top: 50%;
      right: var(--space-m);
      display: block;
      border-radius: var(--radius-pill);
      color: var(--stamp);
      transform: translateY(-50%);
    }
    /* Faint at rest, full strength on hover or focus: the hint that it goes somewhere. */
    .stamp svg {
      display: block;
      width: var(--stamp-size);
      aspect-ratio: 1;
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
