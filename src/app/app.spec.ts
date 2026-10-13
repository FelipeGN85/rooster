import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  const render = async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture;
  };

  const cells = (root: HTMLElement) =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('app-board .cell'));

  it('starts with an empty board and X to move', async () => {
    const root = (await render()).nativeElement as HTMLElement;
    expect(cells(root)).toHaveLength(9);
    expect(root.querySelector('.status')?.textContent).toContain('Bolt’s turn');
  });

  it('plays a local game through to a win and locks the board', async () => {
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;

    for (const index of [0, 3, 1, 4, 2]) {
      cells(root)[index].click();
      await fixture.whenStable();
    }

    expect(root.querySelector('.status')?.textContent).toContain('Bolt wins!');
    expect(cells(root).every((cell) => cell.disabled)).toBe(true);
    expect(root.querySelector('app-board .strike')).not.toBeNull();
  });
});
