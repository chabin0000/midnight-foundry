# Midnight Foundry

A growing collection of small, useful, privacy-friendly software. The repository includes **20 standalone browser tools**, **5 independent project starters**, and **3 interactive experiments**. The browser apps need no build step, and process their input locally.

## Try it

Open [`index.html`](index.html) in a modern browser to browse and search the toolbox. For the full local server experience, use Node.js 22 or newer:

```sh
npm start
```

Then visit `http://localhost:4173`.

## Browser tools

| Category | Projects |
|---|---|
| Developer | JSON Studio, Slug Workshop, Base64 Desk, URL Desk, Line Diff, Unix Clock, Hash Desk |
| Writing and data | Text Lab, CSV Lens |
| Design | Contrast Meter, Gradient Forge, Palette Dice, Orbit Ink |
| Productivity | Focus Clock, Decision Dice |
| Electronics | Ohm Lab, PWM Sketch |
| Simulation and games | Life Garden, Reaction Sprint, Typing Track |

Each tool is a standalone page in [`apps/`](apps/). The searchable directory is [`catalog.json`](catalog.json), and shared utilities live in [`core.js`](core.js).

## Larger projects

- [`projects/pocket-workbench/`](projects/pocket-workbench/) — a polished browser toolbox
- [`projects/circuit-garden/`](projects/circuit-garden/) — eight interactive electronics experiments
- [`projects/algorithm-arcade/`](projects/algorithm-arcade/) — six visual algorithm and simulation toys
- [`projects/focus-orbit/`](projects/focus-orbit/) — a local focus timer, task list, and scratchpad
- [`projects/repo-lantern/`](projects/repo-lantern/) — a read-only repository inventory CLI

## Interactive experiments

- [`constellation/`](constellation/) — connect stars and find patterns
- [`tiny-garden/`](tiny-garden/) — grow a tiny garden with timed watering
- [`orbit-dodger/`](orbit-dodger/) — fly through an asteroid field

## Verify

```sh
npm run check
npm test
```

The collection is MIT licensed. Each standalone project includes its own license and package metadata. Contributions that add small, self-contained tools are welcome.
