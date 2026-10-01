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
- `assets/` — stylesheets, images and documents
- `scripts/` — shared templates and HTML generation
- `404.html` — custom error page
- `sitemap.xml`, `robots.txt` and `llms.txt` — search discovery and content index

## Deployment

Cloudflare Pages serves the repository root as a static site. No framework or
deployment build command is required.
