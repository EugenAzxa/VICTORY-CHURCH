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
    assets/img/raw/       Originals pulled from victorychurch.ca (gitignored, 151 MB)
    tools/make-ink.sh     Regenerates every ink plate from the source photographs
    docs/RESEARCH.md      Research brief this design was built from

## The design

Ink on paper. One warm off white ground, one weight of near black, a single warm gold used
only for buttons and for the milestones that belong to this church, and a dashed drafting
grid that runs the full height of every page behind the content.

- **Nothing on the site is a photograph.** Every image is a two colour, error diffused plate
  that reads as an engraving printed on the sheet. The plates are composited with
  `mix-blend-mode: multiply`, so the paper shows through the light values instead of each
  picture sitting on a white rectangle.
- **Type** is Instrument Sans for everything that is prose, and IBM Plex Mono for labels,
  numerals, years and section markers. The mono is what makes the page read as a technical
  drawing rather than a brochure.
- **One interaction, used everywhere.** Text links do not move on hover. A short dash slides
  into the margin beside them and the label underlines. Navigation, footer and inline links
  all behave identically.
- **The congregation plate** anchors the bottom of the hero and the bottom of the footer.
  On first sight it assembles itself out of ink particles sweeping left to right, the way a
  press lays down a sheet. That is decoration and it degrades cleanly: it is skipped under
  `prefers-reduced-motion`, skipped below 860px, skipped if the canvas cannot be read, and
  it waits for the intro sequence to clear so it never plays to nobody. The plain image
  underneath is always the fallback.

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

Two plates are not generated and must not be overwritten:

- `assets/img/ink/congregation-skyline.webp` - the drawn congregation and Toronto skyline.
  This one really is an illustration, not a converted photograph.
- `assets/img/ink/logo-ink.png` - the church logo flattened to a single ink silhouette.

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
