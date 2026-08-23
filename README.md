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

Headings are set in Newsreader, a serif. The research brief asked for one to
carry the 1856 building and the weight of the subject, and the church sets its
own headings in a serif too. It went missing when this was first drawn from a
tech reference and it is back, on display sizes only: labels, buttons and small
headings stay in Instrument Sans so the interface still reads crisply. IBM Plex
Mono carries the labels, numerals and section markers.

The homepage opens on a word from Pastor Felix over a blue duotone, which is
what their own site leads with and the warmest thing on it. The duotone is done
in the browser rather than baked into a file, so the source photograph stays
untouched: the shadows take the royal underneath and the highlights take the
cyan on top. If you swap the portrait, expect to retune the brightness on
.duo img, because the effect depends entirely on where the source photograph
sits tonally.

**The welcome copy is the church's own, transcribed from their site**, with two
changes: a typo fixed ("getting though life") and an en dash replaced with a
comma to match the house rule on dashes. Worth confirming with them.

Warm editorial layout on a cool near white ground, set in Instrument Sans with
IBM Plex Mono for labels, numerals, years and section markers. The mono is what
makes the page read as a drawing office rather than a brochure. Sections are
divided by plain hairlines.

An earlier version put every photograph through a two colour error diffusion so
that nothing on the page was a photograph, and ran a dashed drafting grid down
the full height of every page. Both came from the reference this was drawn from
and both were removed at the client's request: the grid read as ruled notebook
paper, and the dithering flattened the one thing a church website is actually
for, which is faces. `tools/make-ink.sh` still exists and will regenerate the
whole plate set if that treatment is ever wanted again.

Two images are still drawings, and they are the only two that still multiply
into the paper: the congregation illustration and the crop of five people taken
from it. Put a photograph through multiply and it simply goes dark, so the
`.is-drawing` class marks the two that should.

### Colour

The palette is the church's own, read off the banner on victorychurch.ca: cyan,
royal blue, orange and crimson over paper and ink.

Colour is used as a signal rather than a surface. Each section takes one brand
colour for its number, its labels and its small marks, so the colour tells you
where you are in the page. The one place colour becomes a surface is the giving
band, which carries a halftone dot wash in cyan and orange, echoing the dot
fields their brand already uses. That motif is the one thing their brand and
this design genuinely had in common.

**Cyan and orange cannot be used for text at full strength.** They measure about
2.4:1 against the paper, well under the 4.5:1 small text needs. Every brand
colour therefore has a `-t` variant deepened until it clears that bar, and the
label styles use the `-t`. The measured ratios are in the comment beside the
tokens. If you add a new brand colour, do the same.

The one exception to all of this is the leadership grid, which is full colour
photography. That is deliberate: everything around it is restrained, so thirteen
faces in colour are the thing your eye goes to.

### The history section

Four milestones, four different pictures: five people cut out of the drawing,
the first worship centre, the red brick church the Anglicans raised in 1856, and
the whole congregation today.

Desktop puts the text on the left and the picture on the right, both holding
still in one frame while the eras change inside it. An earlier version bled the
picture across the bottom of the viewport, which worked for the three
photographs and fell apart on 2006: five people at full height is a squarish
shape, so it had to be contained while the others were bled, and two treatments
at wildly different scales left a hole in the middle of the section. One frame
fixes it. The photographs cover it, the drawing sits inside it, every beat is
the same size.

Before that it was one drawing with a mask animated on every scroll frame,
growing a
window outward from Pastor Felix. That was clever and wrong. It repainted a full
bleed image continuously to show a change most people never noticed, so scrolling
felt heavy and the picture looked the same at every year. Four actual photographs
say the thing the mask was trying to imply, and the only work left on scroll is
deciding which plate is lit. The plates cross fade on opacity alone, which the
compositor handles without repainting.

The beats are 128vh against a 100vh caption wrapper, and that 28vh of slack is
the only reason the caption sticks at all: a sticky element takes its travel
from its containing block, so a wrapper exactly as tall as its beat can never
stick and just drifts up the viewport. Which beat is on is read from where the
beats actually are rather than by dividing the rail into equal parts, so the
heights can change without breaking the sync.

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

### The leadership section

The only place on the site that uses photographs rather than ink plates, and the
only place with colour in it. That is the point rather than an inconsistency:
everything else on the page is ink on paper, so thirteen faces in colour are the
thing your eye goes to. Clicking one opens a panel with their role, their
profession, what their ministry does, and a way to get in touch.

**Nobody's biography has been written.** Everything in those panels comes from the
church's own Leadership page or from `docs/RESEARCH.md`. Where the research records
what a ministry actually does, that description is used. Where it does not, the
panel shows only the facts we have and reads perfectly well without it. Do not let
anyone fill these gaps by guessing: these are real people at a real church.

**Contact goes through the office, deliberately.** The church has never published
contact details for its ministry leaders, and the live site still reads
"For more information contact: ???" where they should be. Publishing thirteen
people's personal addresses would not be the right fix even if we had them, so every
message is addressed to the office with the leader's name already in the subject
line. The address is `OFFICE` at the top of the leader panel module in
`assets/js/main.js`. If a leader does want their own address published, that needs
to be their decision, in writing, not an editorial one.

The panel is a native `<dialog>`, so focus trapping, Escape and the backdrop are the
browser's job rather than ours. Where `showModal` is missing the cards quietly stop
being buttons instead of becoming a half working modal.

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

The site no longer uses the dithered plates. The script is kept because it still
produces the two files that are in use, and because it will regenerate the whole
set if the ink treatment is ever wanted back.

If you do bring it back: the church's photographs were taken in a dim hall over
about fifteen years and their exposures are all over the place, so each plate is
levelled to a common mean before it is dithered. Gamma alone cannot lift a black
point, which is why an early version needed a gamma violent enough to destroy the
midtones it was there to rescue. Levels first, then a gentle gamma.

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
6. **Three ministries have no description.** Business Growth and Fellowship, Program
   Coordinator and Events Coordinator. Their panels currently show only role and
   profession. A sentence or two each from the church would finish them.
7. **Photo consent.** Thirteen named people now appear as full colour portraits that
   open on click. Confirm every one of them is content with that.
8. **Where should leader enquiries land?** They currently go to info@victorychurch.ca
   with the leader's name in the subject. If the office would rather they went
   somewhere else, change OFFICE in assets/js/main.js.
