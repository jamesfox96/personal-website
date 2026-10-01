# MyWebsite
Repo for my personal website

## Editing shared components

The header and footer are defined in `scripts/site-components.mjs`. After editing
them, run:

```sh
node scripts/build-site.mjs
```

Commit the updated HTML along with the component changes. The pages can be served
directly with VS Code Live Server or static hosting; no build is needed to view
them. To check that generated components are current:

```sh
node scripts/build-site.mjs --check
```

## Search and sharing

- `sitemap.xml` lists published canonical pages. Add new pages when they go live;
  don't include the 404 page, unfinished routes or fragment URLs.
- `robots.txt` permits public crawling and advertises the sitemap.
- Each published page has its own title, description, canonical URL, Open Graph /
  Twitter metadata and JSON-LD. Keep structured data consistent with visible text.
- `llms.txt` provides a concise guide to public content. Update it when the
  biography or available pages change.
- `assets/images/social-preview.jpg` is the 1200 × 630 sharing image.

After deployment, verify `https://james-fox.com/` in Google Search Console and Bing
Webmaster Tools, then submit `https://james-fox.com/sitemap.xml`. Confirm that the
host serves missing routes with HTTP 404 and allows search crawlers to access
public pages through any Cloudflare settings.

The email address must stay out of public HTML, metadata and `llms.txt`. The future
contact endpoint should return it only after server-side Turnstile verification.
