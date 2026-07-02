# Neon Command VR

A Missile Command-style defense game built with [IWSDK](https://iwsdk.dev) for VR and browser.

**[Play Now](https://ellyz2426.github.io/neon-command/)**

## Gameplay

Defend 6 neon cities from incoming warheads. Aim your crosshair and fire counter-missiles that create expanding blast zones. Anything caught in the blast radius is destroyed.

### Threat Types
- **Normal Missile** (red) - Straight-line trajectory
- **MIRV** (orange) - Splits into 3 warheads at mid-flight
- **Smart Missile** (magenta) - Zigzags and dodges blast zones
- **Bomber** (red box) - Flies horizontally, drops bombs

### Game Modes
1. **Classic** - 20 waves, defend all cities
2. **Survival** - Endless waves, no mercy
3. **Blitz** - 60-second score attack
4. **Wave Defense** - 10 preset challenges
5. **Daily Challenge** - Date-seeded waves
6. **Practice** - Unlimited ammo, no damage
7. **Turret** - Single turret, fast fire
8. **Marathon** - Extended 50-wave campaign

## Controls

### Browser
- **Mouse** - Aim crosshair
- **Click** - Fire counter-missile
- **Space/F** - Fire counter-missile
- **ESC/P** - Pause
- **R** - Rematch (game over)

### VR
- **Laser pointer** - Aim
- **Trigger** - Fire
- **B** - Pause

## Features

- 40 achievements
- 8 crosshair skins (gameplay-gated)
- 5 holodeck themes
- XP/Level progression (50 levels)
- Top 20 leaderboard
- Career stats dashboard
- Chain blast system (multi-kills create secondary explosions)
- 3 missile bases with limited ammo
- 3 difficulty levels
- Procedural audio (15+ SFX + ambient drone)
- 150-particle pool for explosions
- Holodeck environment with floating decorations
- localStorage persistence
- Dual runtime: VR + browser

## Tech

- IWSDK 0.4.1 (WebXR)
- 15 PanelUI spatial UI panels (zero HTML DOM)
- 1,510 lines TypeScript + 218 lines uikitml
- Dual VR + browser runtime
