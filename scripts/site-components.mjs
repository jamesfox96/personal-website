// Shared page chrome, rendered into the HTML by build-site.mjs.
// <header data-site-header></header>
// <footer id="contact" data-site-footer></footer>
export function renderHeader(pagePath) {
  const navigation = [
    { label: "Home", href: "/", current: pagePath === "/" },
    { label: "Experience", href: "/experience", current: pagePath === "/experience" || pagePath.startsWith("/experience/") },
    { label: "Projects", href: "/projects/", current: pagePath.startsWith("/projects") },
    { label: "Contact", href: "/contact", current: pagePath === "/contact" || pagePath.startsWith("/contact/") },
  ];

  return `
      <div class="flex header-wrapper">
        <a href="/" class="header-link">
          <img class="header__logo" src="/assets/images/logo_full_s.png" alt="James Fox — home">
        </a>
        <button id="menu-nav-button" class="mobile-nav-toggle" type="button"
          aria-controls="primary-navigation" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav aria-label="Primary">
          <ul id="primary-navigation" class="primary-navigation flex">
            ${navigation.map((item, index) => `
              <li${item.current ? ' class="active"' : ""}>
                <a class="link_header" href="${item.href}"${item.current ? ' aria-current="page"' : ""}>
                  <span aria-hidden="true" class="nav-number">0${index}</span>${item.label}
                </a>
              </li>
            `).join("")}
          </ul>
        </nav>
      </div>
    `;
}

export function renderFooter() {
  return `
      <div class="footer-wrapper">
        <div>
          <a class="footer-name" href="/">James Fox</a>
          <p>Software, science and a bit of tinkering.</p>
        </div>
        <nav aria-label="Contact and social links">
          <ul class="footer-links">
            <li>
              <a href="/contact">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <span>Contact</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/jamesfox96">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7a5.44 5.44 0 0 0-1.5-3.78A5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.55c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                <span>GitHub</span>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/jamesfox96/">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
                  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7.5 10.5v6M11.5 16.5v-6m0 2.5a2.5 2.5 0 0 1 5 0v3.5" />
                  <circle cx="7.5" cy="7.5" r=".8" fill="currentColor" stroke="none" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </li>
          </ul>
        </nav>
        <p class="footer-copyright">© ${new Date().getFullYear()} James Fox</p>
      </div>
    `;
}
