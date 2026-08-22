# Victory Church International

Website for Victory Church International, a non denominational multicultural church in
North York, Toronto. Founded 2006. Sundays 10:30 a.m.

## Running locally

    npx serve .

Then open the address it prints. No build step. Plain HTML, CSS and JavaScript.

## Structure

    index.html            Home: intro sequence, tabbed frame, heritage, beliefs, team, outreach, visit
    history.html          Full timeline from Pentecost to today, plus a note on reverse mission
    assets/css/main.css   Single stylesheet
    assets/js/main.js     Intro sequence, tabs, mobile nav, scroll reveal, ink reveal
    assets/img/           Source photographs, web optimised
    assets/img/ink/       Two colour ink plates, generated (see below)
    assets/img/congregation-skyline-src.jpg   The drawn congregation, source file
    assets/img/raw/       Originals pulled from victorychurch.ca (gitignored, 151 MB)
    tools/make-ink.sh     Regenerates every ink plate, the illustration and the logo
    docs/RESEARCH.md      Research brief this design was built from

## The design

Ink on paper. A cool near white ground, one weight of blue black, and a single
accent drawn from the church's own logo blue, deepened until it holds against the
paper at 6.8:1. Sections are divided by plain hairlines.

An earlier version ran a dashed drafting grid down the full height of every page,
which is the signature of the reference this was drawn from. It was removed at the
client's request: on a real page, behind real content, it read as ruled notebook
paper rather than as a technical drawing. If it ever comes back, note that
`overflow-x` and `position: sticky` do not coexist, and the history section
depends on sticky.

- **Nothing on the site is a photograph.** Every image is a two colour, error
  diffused plate that reads as an engraving printed on the sheet. The plates are
  composited with `mix-blend-mode: multiply`, so the paper shows through the light
  values instead of each picture sitting on a white rectangle.
- **Type** is Instrument Sans for prose and IBM Plex Mono for labels, numerals,
  years and section markers. The mono is what makes the page read as a technical
  drawing rather than a brochure.
- **One interaction, used everywhere.** Text links do not move on hover. A short
  dash slides into the margin beside them and the label underlines. Navigation,
  footer and inline links all behave identically.

### The history section

Four milestones, four different pictures: five people cut out of the drawing,
the first worship centre, the red brick church the Anglicans raised in 1856, and
the whole congregation today.

It began as one drawing with a mask animated on every scroll frame, growing a
window outward from Pastor Felix. That was clever and wrong. It repainted a full
bleed image continuously to show a change most people never noticed, so scrolling
felt heavy and the picture looked the same at every year. Four actual photographs
say the thing the mask was trying to imply, and the only work left on scroll is
deciding which plate is lit. The plates cross fade on opacity alone, which the
compositor handles without repainting.

The 2006 plate is the one exception to the full bleed treatment. Five people at
full height is a squarish shape that cannot sit in a wide band without either
cropping their heads off or showing nine of them, so it is shown contained: a
small drawing standing on the bottom edge of a large sheet. `make-ink.sh` cuts
it out of the illustration.

### The intro

The congregation assembling out of ink, and nothing else. It used to narrate
seven dates over fifteen seconds, which the page then went on to tell twice
more. Now it runs about four seconds and hands straight over to a hero already
holding that same picture, so there is no seam and nothing to re-read.

### Two things that will bite whoever edits this next

**Do not put `overflow-x` on `html` or `body`.** It silently disables
`position: sticky`, which the history section is built on, and it is not needed:
`.hero-art`, `.ftr-art` and the story stage are already the full width of the page
because they are siblings of `.wrap` inside full width sections.

**Do not declare `--l`, `--r`, `--cx` or `--zoom` below `.story`.** A custom
property set on an element beats the one it would inherit, so declaring a default
any lower silently shadows the per beat values the script writes, and the mask
quietly stops doing anything.

### Phones get a different mechanism, not a worse one

The research brief is clear that this congregation is overwhelmingly on phones, and
scroll scrubbed canvas on a mid range Android is how a site comes to feel broken. So
below 900px there is no pinning and no scrubbing. The same four beats become ordinary
blocks, and instead of masking the drawing they zoom into it: the sequence opens
close on five faces and pulls back to the whole congregation. Same idea, read the
other way round. A 390px screen showing thirty per cent of a 1900px drawing would
leave five people about a hundred pixels wide, which is not a picture of anybody.

The particle assemble is skipped entirely under `prefers-reduced-motion`, below
860px, and any time the canvas cannot be read. The plain `<img>` underneath is
always the fallback, and if the script never runs at all the history section
degrades to four captioned blocks that still say the right thing.

### Regenerating the ink plates

    bash tools/make-ink.sh

Needs `ffmpeg` on PATH and the `media-use` dither script (override its location with
`DITHER=/path/to/dither.mjs`). It reads `assets/img/*.webp` and `assets/img/team/*.webp` and
writes `assets/img/ink/`.

The church's photographs were taken in a dim hall over about fifteen years and their
exposures are all over the place. A fixed gamma turned half of them into black rectangles, so
each plate is levelled to the same mean brightness before it is dithered. That is what makes
the set look like one printer's run rather than twenty unrelated pictures. Wide scenes get a
coarser stipple than portraits, because a one pixel stipple does not compress and a
congregation on a phone should not cost 200 KB. The whole set is about 1.3 MB.

Two of the plates are not conversions of a photograph, and the script treats them
differently:

- `congregation-skyline.webp` is already an engraving, so it is not dithered. It only
  has its blacks lifted onto the site's blue black and its whites pushed to clean
  paper. Its source is `assets/img/congregation-skyline-src.jpg`.
- `logo-ink.png` is the church logo flattened to a single ink silhouette. It keys on
  luminance rather than alpha, which keeps the white gridlines inside the globe open.

### Notes for the build

- The intro sequence runs once per browser session and is stored in sessionStorage.
  It is skippable, replayable with `?intro`, and disabled entirely under
  `prefers-reduced-motion`.
- Copy uses short dashes only. No em dashes, no emoji. Icons are inline SVG.
- Bump the `?v=` query on the stylesheet and script whenever either changes, or returning
  visitors will keep the old one.

## Collecting visitor details

The homepage has a lead capture section at `#guide` offering a free "Seven Days of Prayer"
guide in exchange for a first name, an email address and an optional phone number. A slide in
prompt appears once the visitor is about a third of the way down the page, is dismissible,
and never returns once dismissed or once the form is submitted.

### Two things must be done before this collects anything

**1. Point the form at a backend.** Open `assets/js/main.js` and set:

    var LEAD_ENDPOINT = "https://formspree.io/f/YOUR_ID";

Any handler that accepts a JSON POST works: Formspree, Getform, Basin, a Google Apps Script,
Mailchimp or ConvertKit via their hosted endpoint, or the church's own script. The posted body is:

    { firstName, email, phone, consent, interest, page }

**While `LEAD_ENDPOINT` is an empty string the form falls back to opening the visitor's own
email client with the details filled in.** That still reaches the church, but nothing is
captured automatically and anyone without a configured mail client will drop off. Wiring a
real endpoint is the single most important outstanding task.

**2. Produce the actual guide.** The success message tells the visitor the guide is on its way
to their inbox. Somebody has to send it. Either attach the PDF to an autoresponder on the form
backend, or have the office send it manually. The book cover on the page is drawn in CSS, not
a photograph of a real printed book, so it can be replaced with the church's own artwork.

### Consent and Canadian anti spam law

CASL requires express, opt in consent before sending commercial electronic messages, and a
working unsubscribe in every message. The form reflects that:

- The consent checkbox is required and **unticked by default**. Do not pre tick it.
- The consent wording states what the church will send.
- The form promises a one click unsubscribe, so every email must actually carry one.
- Keep a record of when and how each person consented. Most form backends store this.

Registered charities have a narrower CASL exemption than people often assume, so treat the
consent checkbox as mandatory rather than decorative. Worth a check with whoever handles the
church's legal or privacy questions before the first send.

## Open questions for the client

1. **Address conflict.** The current site's History page says the church acquired
   2125 Weston Road in 2016. The Contact page says Unit 8, 2400 Finch Ave West.
   2125 Weston Road is still publicly listed as St. John's Anglican Church.
   The site currently uses the Finch Ave address. This needs confirming.
2. Ministry leader contacts. The live site shows "For more information contact: ???".
3. Real service and event dates for an events section.
4. Whether the donate flow should stay pointed at the existing site or be rebuilt.
5. The congregation illustration is the face of the site. It is a drawing, not a photograph
   of these particular people, and the church should be comfortable with that before launch.
