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

## Open questions for the client

1. **Address conflict.** The current site's History page says the church acquired
   2125 Weston Road in 2016. The Contact page says Unit 8, 2400 Finch Ave West.
   2125 Weston Road is still publicly listed as St. John's Anglican Church.
   The site currently uses the Finch Ave address. This needs confirming.
2. Ministry leader contacts. The live site shows "For more information contact: ???".
3. Real service and event dates for an events section.
4. Whether the donate flow should stay pointed at the existing site or be rebuilt.
