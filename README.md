# Victory Church International

Website for Victory Church International, a non denominational multicultural church in
North York, Toronto. Founded 2006. Sundays 10:30 a.m.

## Running locally

    python3 -m http.server 8080

Then open http://localhost:8080

No build step. Plain HTML, CSS and JavaScript.

## Structure

    index.html          Home: intro sequence, tabbed frame, heritage, beliefs, team, outreach, visit
    history.html        Full timeline from Pentecost to today, plus a note on reverse mission
    assets/css/main.css Single stylesheet
    assets/js/main.js   Intro sequence, tabs, mobile nav, scroll reveal
    assets/img/         Web optimised images
    assets/img/raw/     Originals pulled from victorychurch.ca (gitignored, 151 MB)
    docs/RESEARCH.md    Research brief this design was built from

## Notes for the build

- The intro sequence runs once per browser session and is stored in sessionStorage.
  It is skippable and is disabled entirely under prefers-reduced-motion.
- Copy uses short dashes only. No em dashes, no emoji. Icons are inline SVG.
- Palette blues are sampled from the church logo. The gold is drawn from the red brick
  of the 1856 sanctuary.

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
