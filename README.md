# kushaa — 🐍 Snake Game

A Google Snake clone built with plain HTML, CSS, and JavaScript. No frameworks, no build tools — just open `index.html` in any modern browser and play!

---

## How to Play

1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. Press **Enter** or **Space** to start the game.
4. Eat the red food to grow longer and earn points.
5. Avoid hitting the walls or your own tail!

---

## Controls

| Action       | Keys                        |
|--------------|-----------------------------|
| Move Up      | `Arrow Up` / `W`            |
| Move Down    | `Arrow Down` / `S`          |
| Move Left    | `Arrow Left` / `A`          |
| Move Right   | `Arrow Right` / `D`         |
| Start/Restart| `Enter` / `Space`           |

On mobile, use the on-screen arrow buttons shown below the game board.

---

## Features

- **20×20 grid** on a 400×400 canvas
- **Score** increments by 10 per food eaten
- **High score** saved automatically with `localStorage`
- **Speed increases** as your score grows
- **Game Over overlay** with score and new-high-score celebration 🏆
- Mobile-friendly on-screen controls

---

## Files

| File        | Description                        |
|-------------|------------------------------------|
| `index.html`| Game page (canvas + score display) |
| `style.css` | Dark-theme styling                 |
| `game.js`   | Full game logic                    |
