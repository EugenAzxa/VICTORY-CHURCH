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

### Scripture, and the arch

There was not a single verse anywhere on this site, which is most of why it read
as a nonprofit rather than a church. Matthew 22:37-39 now sits between the
welcome and the Sunday section, in the King James Version. It is not an
arbitrary choice: it is where "Love God. Love People." comes from, so the hero
headline and the church's own motto both land on it. **Check the wording and the
translation with the church before launch.** They may prefer a different version,
and it is their book.

The other move is the pointed arch. Their 1856 building has pointed arch windows
and a rose window over the door, so the welcome portrait is cut to that shape and
a small arch sits above the verse. This is the one ecclesiastical gesture on the
site that is specific to this church rather than to churches in general, which is
the difference between it working and it being clip art.

Two notes if you touch the arch. It is an SVG mask rather than `border-radius`,
because a pointed arch is two circular arcs meeting at an angle and
`border-radius` cannot make a corner. And the geometry matters: a radius near the
chord's half length just draws a dome, which is what my first attempt did. The
arcs have to be struck from centres on the opposite springing side so each one
arrives at the apex steeply. The ornament above the verse is the equilateral
form, where the radius equals the span.

The ground moved a couple of points warm at the same time, from a cool near white
to something that still reads as white but no longer reads as clinical. That is
the `--paper` token and one line puts it back.

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

### The history, scene by scene

Nine illustrated scenes of this congregation at their own building, told in the
order it happened: the Anglicans raising the church in 1856, five people in a
living room in 2006, a worship centre of their own in 2007, walking up to the
1856 church in 2016, the door, the nations in the room, the thirteen leaders,
the city they serve, and today.

Desktop holds one full bleed scene behind the whole viewport while the captions
ride over the top in an ink card, because the illustrations are line drawings on
white and type cannot simply sit on them.

Scenes do not merely cross fade. The one you are leaving scales up and past the
camera while the next arrives from slightly small, which is what makes this read
as walking forward rather than paging through a slideshow. That is a dolly, the
way a documentary moves through stills, and it is the honest answer to wanting
this to feel three dimensional: these are flat illustrations with no depth data,
so a real fly through would mean rebuilding them as geometry, and a WebGL scene
is the wrong thing to hand a congregation that is mostly on mid range Androids.
Only opacity and transform change, so it stays on the compositor.

**Two pieces of geometry hold this together.** The beats are 50vh, and there is
a 100vh tail spacer at the end of the rail. Without the tail the beats span more
of the rail than the stage can stay pinned for, by exactly the stage height, so
the last scene sits below the point where the stage unsticks and can never
become current. And the current scene is picked at 4% down the viewport rather
than the middle: at the middle, the first scene was on screen for about seventy
pixels before the second took over.

The whole sequence is about 4000px of scroll. The first version was 7200, which
is roughly twenty seconds of scrolling to get through the history and out the
other side. The counter in the corner is part of that fix: not knowing how much
was left was most of what made it feel endless.

Phones get the same nine scenes as ordinary blocks with the caption underneath.
No pinning, no cross fade, nothing to stutter.

The scenes live in `assets/img/scenes/`, sliced from a single 3x3 sheet. Each
one ships at two sizes and is served through `srcset`: nine full bleed
illustrations at full size would be about 2.7 MB on a phone, and this
congregation is overwhelmingly on phones.

Every line of the copy comes from the church's own History page or from
`docs/RESEARCH.md`. As with the hero, no figure in any scene is identified by
name, because these are illustrations of a congregation rather than portraits of
particular people.

### The hero

The congregation standing in front of their own 1856 building with Toronto
behind it, which is the whole reverse mission story in one frame. The previous
illustration had the skyline but no church, so it could only carry half of it.

Hovering a figure says what this church is made of. See the note below on why it
names nobody. The thirteen hotspot positions are read off this specific
illustration and are in `--x` on each `.hero-spot`; replace the picture and
every one of them has to be measured again.

### The intro

The congregation assembling out of ink, and nothing else. It used to narrate
seven dates over fifteen seconds, which the page then went on to tell twice
more. Now it runs about four seconds and hands straight over to a hero already
holding that same picture, so there is no seam and nothing to re-read.

### Pointing at the drawing

Hovering a figure in the hero illustration brings up a line about what this
church is made of: a registered nurse, a community pharmacist, a college
professor. Every line is a profession somebody here actually holds.

**It deliberately names nobody.** The illustration is a picture of a
congregation, not a portrait of the thirteen leaders. Only the central figure is
a clear likeness of Pastor Felix, and the woman in the headwrap plausibly matches
Foluke Ogunro. After that it does not hold up: Okyere Baffour has a distinctive
white beard and no figure in the drawing has one, and the drawing runs roughly
seven men to six women where the roster is six to seven. Putting names on those
faces would mean inventing who is who, about real people, on their own church
site. If the drawing is ever redone from an actual leadership photograph, naming
them becomes straightforward and this is the place to do it.

The hotspots are positioned as a percentage of the current hero illustration's
width and height, which only holds while it is shown whole. Below 700px it is cropped so
the faces stay legible, so they are switched off there, along with any device
that has no hover. Faces sit at about 47% of the image height and figures run to about 94%; if the
illustration is replaced those numbers move, and so does every --x.

It is pure CSS with no script, and the whole block is `aria-hidden` with the
buttons out of the tab order. That is deliberate: the same professions are
written out in full in the leadership section and summarised in the note under
the drawing, so hiding it costs a screen reader nothing and saves a keyboard
user thirteen dead tab stops in front of the page.

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
9. **The scripture.** Matthew 22:37-39 is quoted in the King James Version. Confirm
   the church is happy with that passage and that translation. It is their book.
