const primaryNav = document.querySelector(".primary-navigation");
const menuNavButton = document.getElementById("menu-nav-button");

function mobileNavClick() {
  let open = menuNavButton.toggleAttribute("open");
  if (open) {
    menuNavButton.setAttribute("aria-expanded", "true");
    primaryNav.setAttribute("open", "true");
    primaryNav.setAttribute("aria-hidden", "false");
  } else {
    menuNavButton.setAttribute("aria-expanded", "false");
    primaryNav.removeAttribute("open", "true");
    primaryNav.setAttribute("aria-hidden", "true");
  }
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
