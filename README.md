# Midnight Foundry

A growing factory of tiny, useful software. This repository currently ships **20 standalone browser tools**, **5 independent project starters**, and **3 interactive experiments**. No dependencies are needed to use the browser apps; your input stays on your device.

## Open the collection

Open [`index.html`](index.html) directly in a modern browser to browse and search the tools. Some browser APIs work best over localhost; run `npm start` to serve the collection at `http://localhost:4173`.

## Browser tools

| Category | Projects |
|---|---|
| Developer | JSON Studio, Slug Workshop, Base64 Desk, URL Desk, Line Diff, Unix Clock, Hash Desk |
| Writing and data | Text Lab, CSV Lens |
| Design | Contrast Meter, Gradient Forge, Palette Dice, Orbit Ink |
| Productivity | Focus Clock, Decision Dice |
| Electronics | Ohm Lab, PWM Sketch |
| Simulation and games | Life Garden, Reaction Sprint, Typing Track |

Every tool is a self-contained page in [`apps/`](apps/), powered by shared utilities in [`core.js`](core.js). The searchable directory comes from [`catalog.json`](catalog.json).

## Larger projects

- [`projects/pocket-workbench/`](projects/pocket-workbench/) — a refined browser toolbox
- [`projects/circuit-garden/`](projects/circuit-garden/) — eight interactive electronics experiments
- [`projects/algorithm-arcade/`](projects/algorithm-arcade/) — six visual algorithm and simulation toys
- [`projects/focus-orbit/`](projects/focus-orbit/) — a local focus timer, tasks, and scratchpad
- [`projects/repo-lantern/`](projects/repo-lantern/) — a read-only repository inventory CLI

## Interactive experiments

- [`constellation/`](constellation/) — connect stars and find patterns
- [`tiny-garden/`](tiny-garden/) — grow a tiny garden with timed watering
- [`orbit-dodger/`](orbit-dodger/) — fly through an asteroid field

## Work on it

Requires Node.js 22 or newer.

```sh
npm start
npm run check
npm test
```

The root collection is MIT licensed. Each standalone project also includes its own license and package metadata. Contributions that add small, self-contained, privacy-friendly tools are welcome.
