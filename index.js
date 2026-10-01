const header = document.querySelector("header");
const primaryNav = document.querySelector(".primary-navigation");
const menuNavButton = document.getElementById("menu-nav-button");
const mobileViewport = window.matchMedia("(max-width: 40em)");

function updateNavigationHeight() {
  document.documentElement.style.setProperty(
    "--scroll-padding",
    header.offsetHeight + 16 + "px"
  );
}

function setMenuOpen(open) {
  const isMobile = mobileViewport.matches;
  const isOpen = isMobile && open;
  menuNavButton.toggleAttribute("open", isOpen);
  menuNavButton.setAttribute("aria-expanded", String(isOpen));
  primaryNav.toggleAttribute("open", isOpen);
  primaryNav.inert = isMobile && !isOpen;
  if (isMobile) {
    primaryNav.setAttribute("aria-hidden", String(!isOpen));
  } else {
    primaryNav.removeAttribute("aria-hidden");
  }
}

if (header && primaryNav && menuNavButton) {
  document.documentElement.classList.remove("no-js");
  setMenuOpen(false);
  updateNavigationHeight();
  new ResizeObserver(updateNavigationHeight).observe(header);

  menuNavButton.addEventListener("click", () => {
    setMenuOpen(!menuNavButton.hasAttribute("open"));
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuNavButton.hasAttribute("open")) {
      setMenuOpen(false);
      menuNavButton.focus();
    }
  });

  mobileViewport.addEventListener("change", () => setMenuOpen(false));

}

// Stop animations during resize - from: https://css-tricks.com/stop-animations-during-window-resizing/
let resizeTimer;
window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});
