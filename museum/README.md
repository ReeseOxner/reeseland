# Slate Illustrated: a tiny 3D museum

Walk around a gallery of Slate illustrations. Like the paintings in Mario 64, you can **jump into** one, and you land inside the story it was drawn for, ready to read. Also: tomatoes.

## First time: get the art and stories (one step)

Open Terminal and run:

```bash
cd ~/Downloads/museum
bash get-slate-art.sh
```

This downloads the 14 illustrations, their articles, and the podcast feeds, packs them with the theater video in `media/`, and the museum works from a double-click. (Podcast audio and the crossword still need the internet.) Then double-click `index.html`.

(Before you run it, frames say "Image not downloaded yet," and jumping in shows a link to the story on Slate.com instead of the text.)

## The rooms

Press **E** on things to use them (or click them).

- **The gallery:** eight Slate illustrations. Doorways in the middle of each wall lead everywhere else.
- **The Long Hall (north):** five more illustrations, and at the end, sliding glass doors that open as you walk up to a **balcony** overlooking a golden-hour valley with a Hollywood-style SLATE sign on the hillside.
- **Theater (west):** take the bendy corridor. The Slow Burn Season 11 trailer starts playing as you walk in (you'll hear it leaking down the hall), so it's already rolling on the big screen when you round the corner. The house lights dim inside. Press E at the screen to sit in the best seat; Esc to stand up.
- **Listening room (east):** Slate podcasts as records on the walls. Put on the wired headphones, then use the station to play the latest episode of 10 shows. The record for the show that's playing spins. Walk too far and the cord yanks the headphones off (H takes them off).
- **Bonus round (balcony):** a **? block** floats in the balcony's back corner, tucked between the railing and the glass doors. Stand under it and jump into it to start a 60-second bonus round (see below).
- **The phone:** left on the gallery's east bench. Pick it up (E) and a Slate crossword (on Crosshare) appears right on its screen. Swap the puzzle by changing `CROSSHARE_MINI` in `gallery.js` to any Crosshare embed link.

To change the theater video, put an .mp4 in `media/` and set `THEATER_VIDEO` in `gallery.js`, then re-run the script. (It's packed so the theater can show it from a double-clicked file; a big video makes the page slower to open.)

## The bonus round

Head-butt the ? block and the clock starts: 60 seconds, with a health bar (5), time, coins, trolls and score across the top.

- **Comment trolls** pop up around whatever room you're in and waddle toward you ("First!", "Um, actually…"). Land on one to squash it (hold Space for a higher bounce). They're quick. Each one that bumps into you costs 1 health. At zero you get a "You died" screen and respawn on the balcony next to the block, round over.
- **Coins** appear around the room; some float high enough that you need to jump.
- **Double jump:** press Space again in mid-air.
- **T throws fireballs** instead of tomatoes. They bounce along the floor and burn trolls.
- **Star power:** hold **7** for five seconds. For 10 seconds you're invincible, a bit faster, and trolls pop on contact.
- **Run into a painting** to end the round early. Your final score (coins are worth 50) and the record for your browser show at the end. The block comes back a few seconds later.

## Controls

| | |
|---|---|
| **Space** | jump. Jump into a painting to go inside and read its story |
| **E** | dive straight into the painting you're looking at |
| **T** | throw a tomato (a fireball in the bonus round) |
| **7** (hold 5 s) | star power, in the bonus round |
| **C** | clean up the tomatoes |
| **H** | take the headphones off |
| **O** | open the story on Slate.com instead |
| W A S D | walk |
| ← → ↑ ↓ | look around (instead of the mouse) |
| Shift | run |
| Mouse | look (click once to enter; Esc to pause, or to leave a story, the phone, the station or your seat without pausing) |
| Click a painting | see it up close |
| Esc (while reading) | jump back out into the museum |

Paintings wobble when you get close and ripple when something hits them. You can hop over the benches.

On a phone or tablet: drag to look, use the on-screen arrows to walk, and use the Jump and Tomato buttons. Tap a painting, then "Jump in."

## The collection

| Piece | Illustrator | Story |
|---|---|---|
| Rewind | Tolga Akdoğan | Something good we left in the ’90s |
| Lost Boys of Bitcoin | Tolga Akdoğan | Crypto as an emotional tether |
| The Apple Quest | Logan Guo | Heirloom apples |
| Thirty Years of Lists | Robert Neubecker | Slate's 30th birthday time capsule |
| Inside His Head | Jason Seiler | Trump |
| Pizza + Bagel | Fangyu Ma | America's greatest snack |
| Ring of Watchers | Hua Ye | Women ditching Oura rings |
| Jackpot | Chris Whetzel | Trump's crypto scam |
| The Forever Trip | Fangyu Ma | Longevity tourism |
| Bowl Culture | Hua Ye | America's lunch bowls |
| Down the River | Natalie Matthews-Ramo | *James*, Percival Everett's Huck Finn retelling |
| Daughters Wanted | Anna Kim | Sex selection in IVF |
| Two Lines | Anna Kim | The cost of infertility |
| The Phone Call | Natalie Matthews-Ramo | A 1995 fertility scandal |

Illustrations and articles © their creators and Slate. This copy is for internal use like Hack Day; check with the art and editorial teams before showing it publicly.

## Change the art

Edit `gallery.js`. Each piece has a local image (`src`), an optional Slate image ID to download (`remote`), a short `title`, `artist`, `year`, a one-line `note`, and the story `url`. Re-run `bash get-slate-art.sh` and it fetches anything new. The first 14 pieces have set spots (gallery and Long Hall); four spare spots take drag-and-drop extras.

To refresh a story, delete its file in `articles/` and re-run the script.

## Files

- `index.html`: the page you open
- `gallery.js`: **the art list (edit this)**
- `get-slate-art.sh`: downloads art, stories and feeds; packs everything (including `media/`)
- `media/`: the theater video
- `art/`, `articles/`: downloaded images and story pages
- `engine/`: the museum code. `museum.source.js` is the readable version, and `museum.bundle.js` runs (Three.js bundled in).
