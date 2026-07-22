(function () {
  "use strict";

  function initHeader() {
    const header = document.querySelector("[data-site-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    const backdrop = document.querySelector("[data-nav-backdrop]");
    if (!header || !toggle || !nav || !backdrop) return;

    let returnFocus = null;

    function setSticky() {
      header.classList.toggle("is-sticky", window.scrollY > 70);
    }

    function closeDropdowns(except) {
      document.querySelectorAll("[data-nav-dropdown]").forEach(function (dropdown) {
        if (dropdown === except) return;
        dropdown.classList.remove("is-open");
        const button = dropdown.querySelector("button");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    }

    function closeMenu() {
      nav.classList.remove("is-open");
      backdrop.classList.remove("is-visible");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", window.SiteConfig ? window.SiteConfig.value("accessibility.openMenu") : "Open navigation menu");
      document.body.classList.remove("menu-open");
      closeDropdowns();
      if (returnFocus) returnFocus.focus();
      returnFocus = null;
    }

    function openMenu() {
      returnFocus = document.activeElement;
      nav.classList.add("is-open");
      backdrop.classList.add("is-visible");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", window.SiteConfig ? window.SiteConfig.value("accessibility.closeMenu") : "Close navigation menu");
      document.body.classList.add("menu-open");
      const firstLink = nav.querySelector("a, button");
      if (firstLink) firstLink.focus();
    }

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
      else openMenu();
    });

    backdrop.addEventListener("click", closeMenu);

    nav.addEventListener("click", function (event) {
      const button = event.target.closest("[data-dropdown-toggle]");
      if (button) {
        const dropdown = button.closest("[data-nav-dropdown]");
        const opening = !dropdown.classList.contains("is-open");
        closeDropdowns(dropdown);
        dropdown.classList.toggle("is-open", opening);
        button.setAttribute("aria-expanded", String(opening));
        return;
      }
      if (event.target.closest("a") && window.matchMedia("(max-width: 74.9rem)").matches) closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-nav-dropdown]")) closeDropdowns();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (nav.classList.contains("is-open")) closeMenu();
        else closeDropdowns();
      }
      if (event.key === "Tab" && nav.classList.contains("is-open")) {
        const focusable = Array.from(nav.querySelectorAll('a[href], button:not([disabled])')).filter(function (element) {
          return !element.closest("[hidden]") && element.offsetParent !== null;
        });
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("scroll", setSticky, { passive: true });
    setSticky();
  }

  function initReveal() {
    const elements = document.querySelectorAll("[data-reveal]");
    if (!elements.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    elements.forEach(function (element, index) {
      element.style.transitionDelay = Math.min(index % 4, 3) * 70 + "ms";
      observer.observe(element);
    });
  }

  function initTypewriter() {
    const element = document.querySelector("[data-typewriter]");
    if (!element) return;
    const phrases = (element.dataset.typewriter || "").split("|").map(function (item) { return item.trim(); }).filter(Boolean);
    if (!phrases.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      element.textContent = phrase.slice(0, charIndex);
      let delay = deleting ? 38 : 72;

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        delay = 1550;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 380;
      }
      window.setTimeout(tick, delay);
    }

    element.textContent = "";
    tick();
  }

  function initCookieNotice() {
    const banner = document.querySelector("[data-cookie-banner]");
    const accept = document.querySelector("[data-cookie-accept]");
    if (!banner || !accept || !window.SiteConfig) return;
    const key = window.SiteConfig.value("cookies.storageKey") || "site-cookie-notice";
    try {
      banner.hidden = window.localStorage.getItem(key) === "accepted";
    } catch (_) {
      banner.hidden = false;
    }
    accept.addEventListener("click", function () {
      try { window.localStorage.setItem(key, "accepted"); } catch (_) { /* storage may be disabled */ }
      banner.hidden = true;
    });
  }

  function setCurrentNavigation() {
    const filename = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav-path]").forEach(function (link) {
      if (link.dataset.navPath.split(" ").includes(filename)) link.setAttribute("aria-current", "page");
    });
  }

  function init() {
    initHeader();
    initReveal();
    initTypewriter();
    initCookieNotice();
    setCurrentNavigation();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
