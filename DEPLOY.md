# Publishing

The site is static. No build step, no server, no environment variables. Whatever
is on `main` is the site.

## Where it is now

**https://victory-church-kappa.vercel.app**

Live, public, and safe to send round. Deployed from the CLI as the project
`victory-church` under `eugenazxas-projects`.

Two Vercel URLs for this project are traps:

- The per-deployment URL, the long one ending `-eugenazxas-projects.vercel.app`,
  sits behind Vercel Authentication and serves a **Vercel login page** to anyone
  who is not signed in to the account. It looks like a working link and is not.
  Always share the short alias above.
- `victory-church.vercel.app`, without the suffix, belongs to a different
  project owned by somebody else. Do not assume it.

## Vercel

Same arrangement as the Heritage project.

1. Push `main`.
2. At **vercel.com** choose **Add New, Project**, then **Import Git Repository**
   and pick `EugenAzxa/VICTORY-CHURCH`.
3. Vercel will offer to guess a framework. It should say **Other**. Leave the
   build command empty and the output directory as `.`. `vercel.json` already
   says all of this, so the defaults it reads should be correct.
4. **Deploy.**

You get a URL straight away, of the shape
`victory-church-<hash>.vercel.app`, plus a stable one at
`victory-church.vercel.app` if the name is free. That is the link to send round
for review.

Every later push to `main` redeploys on its own. Pushes to any other branch get
their own preview URL, which is the sane way to show the church a change before
it goes live.

## A custom domain, later

The church already owns **victorychurch.ca** and it is in use by the current
site. Do not point it here until they have decided to switch.

When they do, in **Vercel, Project, Settings, Domains** add the domain, and
Vercel will print the DNS records to set with whoever hosts their DNS. It is
usually an `A` record for the apex and a `CNAME` for `www`. Vercel issues the
certificate once DNS resolves, so leave HTTPS enforcement until last.

A gentler route is a subdomain first, `new.victorychurch.ca`, so the live site
stays untouched while the church looks at this one.

## Caching

`vercel.json` sets a year on `/assets/css` and `/assets/js`, which is safe
because both are requested with a `?v=` query and the query busts the cache. Any
time you edit either file, **bump that number in `index.html` and
`history.html`**, otherwise returning visitors keep the old one for a year.

Images get a week rather than a year, because their filenames never change. Swap
a photograph for a new one under the same name and a visitor could be looking at
the old one for up to seven days.

## Before it goes in front of the church

- The lead capture form at `#guide` has no backend. See the README. Until
  `LEAD_ENDPOINT` is set it opens the visitor's mail client instead, which works
  but captures nothing.
- Section 10 is a prototype of an app that does not exist. It is badged
  **Concept** and says so, and it should either be built or removed rather than
  left promising something.
- The README lists twelve open questions for the client, including the address
  conflict between their History and Contact pages, which should be settled
  before anyone reads this as fact.
