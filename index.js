const header = document.querySelector("header");
const primaryNav = document.querySelector(".primary-navigation");
const menuNavButton = document.getElementById("menu-nav-button");
const navigationHeight = document.querySelector("header").offsetHeight;

document.documentElement.style.setProperty(
  "--scroll-padding",
  navigationHeight + 1 + "px"
);

// Hide mobile nav menu when user clicks away from header
document.addEventListener("click", (e) => {
  if (menuNavButton.hasAttribute("open")) {
    if (!header.contains(e.target)) {
      mobileNavClick();
    }
  }
});

function mobileNavClick() {
  let open = menuNavButton.toggleAttribute("open");
  if (open) {
    menuNavButton.setAttribute("aria-expanded", "true");
    primaryNav.setAttribute("open", "true");
    primaryNav.setAttribute("aria-hidden", "false");
  } else {
    menuNavButton.setAttribute("aria-expanded", "false");
    primaryNav.removeAttribute("open");
    primaryNav.setAttribute("aria-hidden", "true");
  }
}

// Stop animations during resize - from: https://css-tricks.com/stop-animations-during-window-resizing/
let resizeTimer;
window.addEventListener("resize", () => {
  // Remove aria-hidden when nav bar switches from mobile view
  if (!menuNavButton.checkVisibility()) {
    primaryNav.removeAttribute("aria-hidden");
  }
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});
