# James Fox — Personal Website

My personal website at [james-fox.com](https://james-fox.com), covering my projects,
career and interests in software development, bioinformatics and applied AI.

Built with HTML, CSS and vanilla JavaScript, and hosted on Cloudflare Pages.

## Local development

Open the repository in VS Code and use **Live Server** to preview the site.
The static pages have no runtime dependencies.

The shared header and footer are maintained in `scripts/site-components.mjs`.
After changing these templates, regenerate the HTML with Node.js:

```sh
node scripts/build-site.mjs
```

The generated HTML is committed alongside the templates. Check that it is up to
date with:

```sh
node scripts/build-site.mjs --check
```

## Structure

- `index.html` — homepage
- `projects/` — project write-ups
- `experience/` — career history, education and CV download
- `contact/` — contact page with Turnstile verification
- `functions/api/contact.js` — server-side contact verification and reveal
- `assets/` — stylesheets, images and documents
- `scripts/` — shared templates and HTML generation
- `404.html` — custom error page
- `sitemap.xml`, `robots.txt` and `llms.txt` — search discovery and content index

## Deployment

Cloudflare Pages serves the repository root. No framework or deployment build
command is required. The contact API runs as a Pages Function; `_routes.json`
limits function execution to `/api/*`.

### Contact configuration

Create a **Managed** widget in Cloudflare Turnstile and allow `james-fox.com`
(plus any other hostname used to access the contact page). Set these variables
under the Pages project's **Settings → Variables and Secrets**, then redeploy:

| Variable | Value | Storage |
| --- | --- | --- |
| `TURNSTILE_SITE_KEY` | Widget's public site key | Variable |
| `TURNSTILE_SECRET_KEY` | Widget's secret key | Secret |
| `CONTACT_EMAIL` | Email address to reveal | Secret |
| `CONTACT_PHONE` | Optional phone number, preferably with country code | Secret |

The API verifies each token with Cloudflare, including its hostname and action,
before returning contact details. Responses are not cached. Cloudflare's general
site challenge does not replace this verification.

Deploy through Pages Git integration or Wrangler so the `functions/` directory
is compiled; dashboard drag-and-drop uploads do not deploy Pages Functions.

Live Server previews the page, but does not execute the contact API. For the full
flow locally with Node.js 22+, put development values in a gitignored `.dev.vars` file and run
`npx wrangler pages dev .`. Use a development Turnstile widget allowing `localhost`
and dummy contact details. Preview deployments need their own variable settings
and a hostname allowed by the widget.

Run the contact API tests with:

```sh
node --test tests/contact.test.mjs
```
