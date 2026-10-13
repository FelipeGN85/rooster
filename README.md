# Rooster

Tic-tac-toe for two, built with Angular 22. Play on one screen, or send a friend a link and play from two phones or computers.

## Run it

Needs Node `^22.22.3` or `^24.15`.

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Vitest)
npm run build      # production build in dist/rooster/browser
```

To try online play with a phone on the same Wi-Fi, run `npm run start:lan` and open the app on the computer at `http://<your-computer's-LAN-IP>:4200`, not `localhost`, so the invite link points somewhere the phone can reach. (Over plain http the Copy button falls back to selecting the link, and the Share button is hidden; both work on an https deployment.)

## How online play works

There is no backend of ours. The two browsers talk directly over WebRTC using [PeerJS](https://peerjs.com/); the free public PeerJS server only introduces them, and its TURN relay steps in when a network blocks a direct connection.

- Whoever presses **Create invite link** hosts the game and plays **X**. The link carries a random room id (`?join=rooster-…`).
- The friend who opens it plays **O**. Their moves go to the host, and the host sends the whole game back, so the two screens never disagree.
- The host must keep the page open: closing it ends the game. A guest who reloads rejoins with the same link and keeps the score.
- Rounds alternate who opens.

## Layout

```
src/app/
  game/game-logic.ts     pure rules: wins, draws, moves, rounds (+ spec)
  game/game.store.ts     the game on this screen, as signals
  game/online.service.ts PeerJS connection, host/guest roles, routing moves
  board/                 the black handheld board
  scoreboard/            scores and whose turn it is
  online-panel/          invite link, copy/share, connection states
  app-header/            frosted header pill
  app-footer/            ticket-stub footer with the creator stamp
```
