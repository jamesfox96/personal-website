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

const rotatingWords = document.querySelectorAll(".hero__words > span");

if (rotatingWords.length > 1) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const words = Array.from(rotatingWords, (word) => Array.from(word.textContent));
  const typedWord = document.createElement("span");
  typedWord.className = "hero__typed is-current";
  rotatingWords.forEach((word) => word.classList.remove("is-current"));
  rotatingWords[0].parentElement.append(typedWord);
  let wordIndex = 0;
  let characterCount = words[0].length;
  let deleting = true;
  let wordTimer;

  function renderWord() {
    typedWord.textContent = words[wordIndex].slice(0, characterCount).join("");
  }

  function typeNextCharacter() {
    let delay;
    if (deleting) {
      characterCount--;
      delay = 65;
      if (characterCount === 0) {
        wordIndex = (wordIndex + 1) % words.length;
        deleting = false;
        delay = 300;
      }
    } else {
      characterCount++;
      delay = 110;
      if (characterCount === words[wordIndex].length) {
        deleting = true;
        delay = 2200;
      }
    }
    renderWord();
    wordTimer = setTimeout(typeNextCharacter, delay);
  }

  function updateWordRotation() {
    clearTimeout(wordTimer);
    if (reducedMotion.matches) {
      wordIndex = 0;
      characterCount = words[0].length;
      deleting = true;
      renderWord();
      return;
    }
    if (!document.hidden) {
      wordTimer = setTimeout(typeNextCharacter, 2200);
    }
  }

  reducedMotion.addEventListener("change", updateWordRotation);
  document.addEventListener("visibilitychange", updateWordRotation);
  renderWord();
  updateWordRotation();
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
