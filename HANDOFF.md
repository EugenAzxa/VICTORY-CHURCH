# Handover

Read this first. `README.md` explains how the site is built and why; this is the
shorter thing: where everything lives, what state it is in, and the handful of
mistakes that are easy to repeat.

> **More than one session has worked in this repository.** Commits have arrived
> on `main` from elsewhere between one push and the next. **Always `git pull`
> before you start and before you push**, and expect the page to have moved since
> you last looked at it. Rebase onto what is there; never force.

---

## Where things are

| | |
|---|---|
| Working copy | `C:\Users\dj_la\OneDrive\Рабочий стол\VICTORY-CHURCH` |
| Repository | `github.com/EugenAzxa/VICTORY-CHURCH`, branch `main` |
| Live | **https://victory-church-kappa.vercel.app** |
| Vercel project | `victory-church` under `eugenazxas-projects` |
| The church's current site | victorychurch.ca, untouched, still theirs |

There is no build step. Static HTML, one stylesheet, one script. `npx serve .`
and open what it prints.

**Do not share the long Vercel URL.** The per-deployment one ending
`-eugenazxas-projects.vercel.app` sits behind Vercel Authentication and serves a
login page to anyone who is not signed in to the account. It looks like a working
link. `victory-church.vercel.app` without the suffix is a different project owned
by somebody else. The `kappa` alias above is the shareable one.

To deploy: `git push`, then `npx vercel --prod --yes` from the project directory.

---

## What the page is

Eleven numbered sections plus a scripture band, in order:

1. Welcome, a word from Pastor Felix over a blue duotone
   - Scripture, Matthew 22:37-39
2. What happens here, three tabs
3. Our history, nine scenes on a turntable you drag
4. What we believe
5. Leadership, thirteen portraits, each opens a panel
6. Outreach
7. TV Ministry, Victory Life, four real episodes that play in place
8. Free guide, lead capture
9. Visit
10. **The app concept**, a working prototype of an app that does not exist
11. **Saylavy**, a wall of remembrance, pitching a separate service

Plus a hero where all thirteen leaders are in one drawing, and clicking any of
them opens that person's profile.

`history.html` is the long-form history page.

---

## Unfinished, in the order it matters

1. **The lead form has no backend.** `LEAD_ENDPOINT` in `assets/js/main.js` is an
   empty string, so the form falls back to opening the visitor's mail client. It
   works, but nothing is captured. This is the single most important outstanding
   task and it is about twenty minutes with any form service.
2. **Nobody has produced the Seven Days of Prayer guide.** The success message
   promises it arrives by email.
3. **Sections 10 and 11 promise things that do not exist.** The app is a
   prototype; Saylavy is a separate service the church has not agreed to. Both
   say so on the page. Either build them, get agreement, or take them off before
   this is public.
4. **Three memorial photographs have unverified licensing.** See below.
5. **The address conflict has never been settled.** The church's own History page
   says 2125 Weston Road, their Contact page says 2400 Finch Ave West. This site
   uses Finch. It is question 1 in the README and it is still open.

Fourteen questions for the client are listed at the bottom of `README.md`.

---

## Things in this site that are deliberate, not accidents

A later session will be tempted to tidy these away. Please do not, without
asking.

- **Nothing in the app prototype sends anywhere, and it says so twice on screen.**
  The prayer box in particular. A request box that looked real and quietly
  swallowed what somebody typed would be the worst thing on this site.
- **The app is badged Concept.** A church site implying a downloadable app is a
  lie to whoever then goes looking for it in a store.
- **Nobody on the Saylavy wall is a real person**, the names are blank slots, and
  the notice above the wall says so. A wall of remembrance is the last place to
  invent anybody.
- **Leader contact goes to the church office, never to individuals.** The church
  has never published personal contact details and publishing them would not be
  our call. `OFFICE` at the top of the leader panel module.
- **The thirteen names on the hero drawing were verified figure by figure** against
  the leadership photographs before any name was attached. An earlier
  illustration was *not* a portrait of these people and the same feature
  deliberately named nobody. **If the illustration is ever replaced, redo that
  check.** Mapping is in `data-person`, positions in `--x`, both specific to the
  current picture.
- **The memory wall gesture is a prayer, not a candle.** Victory is non
  denominational charismatic; lighting candles for the dead is an Orthodox and
  Catholic practice and would be the wrong rite on their wall.

---

## The palette, as of now

Four colours read off a wax print: cyan `#22A8DE`, royal `#1F5FBF`, crimson
`#C4243C`, orchid `#8E4FB0`. **Orange was removed and orchid took its place.**
Every section carries one of the four, the rule opening each section takes that
section's colour, and the stats row runs all four at once.

Each colour has a `-t` variant deepened to clear 4.5:1 against the paper.
**Label and body text must use the `-t`.** At full strength cyan measures about
2.4:1 and is unreadable at label sizes; that is the whole reason the pairs exist.

---

## Mistakes already made here once

- **`overflow-x` on `html` or `body` silently disables `position: sticky`.** The
  turntable and several pinned sections depend on sticky. It is also not needed:
  the full bleed elements are already page width because they sit outside `.wrap`.
- **A sticky element takes its travel from its own margin box.** A `-100vh` bottom
  margin on the sticky element collapses that travel to nothing and it never
  sticks. Put the negative margin on the following content instead.
- **A custom property set on an element beats the one it would inherit.** Declaring
  `--l` or `--zoom` defaults below the section root silently shadows whatever the
  script writes. Keep defaults at the section root.
- **`String.replace` with a string pattern replaces only the first match.** A
  `srcset` meant for the hero landed on the intro image this way and went
  unnoticed for several commits, so every phone downloaded the full size hero.
  Check which occurrence you hit.
- **Bump `?v=` on `main.css` and `main.js` in BOTH HTML files whenever you edit
  either.** They are cached for a year on Vercel and the query is what busts it.
  Currently **v=53**.
  This has already gone wrong once. A session bumped `index.html` to v=53 and
  left `history.html` on v=50. The server ignores the query and serves the same
  file either way, so a new visitor saw nothing wrong, but anyone who had already
  opened the history page stayed pinned to the old stylesheet, on the old
  palette, for up to a year while the homepage moved on. Before pushing, run
  `grep -o "main\.\(css\|js\)?v=[0-9]*" index.html history.html | sort -u`
  and check it prints exactly two distinct versions, both the same number.
- **Git checks files out with CRLF here.** A multi-line search string written
  with `\n` will match nothing and a scripted `replace()` will silently do
  nothing while reporting success. Normalise line endings before editing files
  with a script, and verify the edit actually landed.
- **Test at 375 x 667, not just 390 wide.** Two real bugs only appeared at that
  height: the leader panel's contact button sat 96px below the panel and was
  unreachable, and the hero hotspots were switched off on phones entirely.

---

## Assets

`assets/img/` is about 9.6 MB. Roughly 3.6 MB of it is church photography that
nothing currently references, kept because it is the client's source material and
a future edit will want it.

- `assets/img/scenes/` the nine illustrated scenes and the hero, two sizes each
- `assets/img/team/` the thirteen leader photographs
- `assets/img/memory/` three stock portraits for the Saylavy wall,
  **licensing unverified, confirm or replace**
- `assets/img/ink/` two leftover generated plates, unreferenced, regenerable
- `tools/make-ink.sh` regenerates the two colour plates if that treatment is ever
  wanted back

Three of the six pictures supplied for the memory wall were **not** used, on
purpose: one carried a visible Alamy watermark, one was Tsutomu Yamaguchi, a real
and widely photographed man who survived Hiroshima and Nagasaki and died in 2010,
and one showed a frail elderly person in a novelty tie from a private snapshot.

---

## First things to do in a fresh session

```
cd "C:\Users\dj_la\OneDrive\Рабочий стол\VICTORY-CHURCH"
git pull
npx serve .
```

Then read `README.md` for the why, and the client questions at the end of it.
