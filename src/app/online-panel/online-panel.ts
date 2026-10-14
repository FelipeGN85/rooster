import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';

import { OnlineService } from '../game/online.service';

/**
 * Starting an online game, handing out its link, and what the connection is
 * doing. On phones it stays out of the way until there is something to act on,
 * then rises as a sheet over the bottom of the screen.
 */
@Component({
  selector: 'app-online-panel',
  host: { '[class.sheet]': 'needsAttention()' },
  templateUrl: './online-panel.html',
  styleUrl: './online-panel.scss',
})
export class OnlinePanel {
  protected readonly online = inject(OnlineService);

  /** Idle and connected say all they need through the buttons under the board. */
  protected readonly needsAttention = computed(() => {
    const status = this.online.status();
    return status !== 'idle' && status !== 'connected';
  });

  protected readonly copied = signal(false);

  /** The share sheet exists on phones (and some desktops), and only over https. */
  protected readonly canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  private readonly linkField = viewChild<ElementRef<HTMLInputElement>>('linkField');
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  protected async copy(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // No clipboard access (plain http, or refused): select it for a manual copy.
      this.linkField()?.nativeElement.select();
    }
  }

  protected async share(url: string): Promise<void> {
    try {
      await navigator.share({ title: 'Rooster', text: 'Play tic-tac-toe with me!', url });
    } catch {
      // Closing the share sheet rejects too; there is nothing to do either way.
    }
  }

  protected rejoin(): void {
    const roomId = this.online.roomId();
    if (roomId) void this.online.join(roomId);
  }
}
