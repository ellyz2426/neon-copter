# Neon Copter VR

A Flappy Bird-style helicopter altitude-control game built with [IWSDK](https://iwsdk.dev) for VR and browser.

**[Play Now](https://ellyz2426.github.io/neon-copter/)**

## Gameplay

Control a neon helicopter by tapping to thrust against gravity. Navigate through scrolling gate obstacles, collect orbs for combo multipliers, and survive as long as you can.

### Game Modes
1. **Classic** — Standard run, one life
2. **Speed** — Everything moves faster
3. **Zen** — Relaxed pace, no death
4. **Daily** — Date-seeded challenge
5. **Marathon** — Extended endurance run
6. **Gauntlet** — Tight gaps, rapid gates
7. **Tunnel** — Narrowing passages
8. **Practice** — Learn the mechanics

## Controls

### Browser
- **Space** — Thrust upward
- **Click** — Thrust upward
- **ESC/P** — Pause
- **R** — Rematch (game over)

### VR
- **Trigger** — Thrust
- **B** — Pause

## Features

- Gravity + thrust altitude mechanic
- Scrolling gate obstacles with adjustable gaps
- Orb collectibles with combo scoring (x1-x10 multiplier)
- 40 achievements
- 8 copter skins (gameplay-gated)
- 5 holodeck themes
- XP/Level progression (50 levels)
- Top 20 leaderboard
- Career stats dashboard
- Near-miss detection bonus
- Copter trail effect + gate ring glow
- 3 difficulty levels
- Procedural audio (15+ SFX + arpeggiator + ambient drone)
- 150-particle pool
- Holodeck environment with wireframe decorations
- localStorage persistence
- Dual runtime: VR + browser

## Tech

- IWSDK 0.4.1 (WebXR)
- 14 PanelUI spatial UI panels (zero HTML DOM)
- 1,191 lines TypeScript + 210 lines uikitml
- Dual VR + browser runtime
