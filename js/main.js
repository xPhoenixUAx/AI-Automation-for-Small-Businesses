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
      toggle.focus();
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
        const navFocusable = Array.from(nav.querySelectorAll('a[href], button:not([disabled])')).filter(function (element) {
          return !element.closest("[hidden]") && element.offsetParent !== null;
        });
        const focusable = navFocusable.concat(toggle);
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

  function initFaqAccordions() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".faq-list details").forEach(function (details) {
      const summary = details.querySelector("summary");
      const answer = summary ? summary.nextElementSibling : null;
      if (!summary || !answer) return;

      let animation = null;

      summary.addEventListener("click", function (event) {
        event.preventDefault();
        if (animation) return;

        if (reduceMotion || typeof answer.animate !== "function") {
          details.open = !details.open;
          return;
        }

        const opening = !details.open;
        if (opening) details.open = true;

        answer.style.overflow = "hidden";
        const fullHeight = answer.scrollHeight + "px";
        const frames = opening
          ? [
              { height: "0px", opacity: 0, transform: "translateY(-0.45rem)" },
              { height: fullHeight, opacity: 1, transform: "translateY(0)" }
            ]
          : [
              { height: fullHeight, opacity: 1, transform: "translateY(0)" },
              { height: "0px", opacity: 0, transform: "translateY(-0.45rem)" }
            ];

        animation = answer.animate(frames, {
          duration: opening ? 360 : 280,
          easing: opening ? "cubic-bezier(0.2, 0.75, 0.2, 1)" : "cubic-bezier(0.4, 0, 1, 1)"
        });

        animation.addEventListener("finish", function () {
          if (!opening) details.open = false;
          answer.style.removeProperty("overflow");
          animation = null;
        }, { once: true });
      });
    });
  }

  function initProcessScroll() {
    const section = document.querySelector("[data-process-scroll]");
    if (!section) return;

    const intro = section.querySelector("[data-process-intro]");
    const stepList = section.querySelector("[data-process-steps]");
    const steps = stepList ? Array.from(stepList.children) : [];
    const sceneQuery = window.matchMedia("(min-width: 62rem) and (min-height: 40rem)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stepThresholds = [0.34, 0.55, 0.76];
    let active = false;
    let frame = 0;

    function clamp(value, minimum, maximum) {
      return Math.min(Math.max(value, minimum), maximum);
    }

    function updateScene() {
      frame = 0;
      if (!active || !intro) return;

      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollDistance, 0, 1);
      const introProgress = clamp(progress / 0.28, 0, 1);
      const easedIntro = introProgress * introProgress * (3 - 2 * introProgress);

      intro.style.setProperty("--process-intro-top", (50 - easedIntro * 50).toFixed(3) + "%");
      intro.style.setProperty("--process-intro-shift", (-50 + easedIntro * 50).toFixed(3) + "%");

      section.classList.toggle("is-process-revealing", progress >= 0.29);
      steps.forEach(function (step, index) {
        step.classList.toggle("is-visible", progress >= stepThresholds[index]);
      });
    }

    function requestSceneUpdate() {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(updateScene);
    }

    function configureScene() {
      active = sceneQuery.matches && !reduceMotionQuery.matches;
      section.classList.toggle("is-scroll-ready", active);
      section.classList.remove("is-process-revealing");
      intro?.style.removeProperty("--process-intro-top");
      intro?.style.removeProperty("--process-intro-shift");
      steps.forEach(function (step) { step.classList.toggle("is-visible", !active); });
      if (active) updateScene();
    }

    window.addEventListener("scroll", requestSceneUpdate, { passive: true });
    window.addEventListener("resize", requestSceneUpdate, { passive: true });

    [sceneQuery, reduceMotionQuery].forEach(function (query) {
      if (typeof query.addEventListener === "function") query.addEventListener("change", configureScene);
      else if (typeof query.addListener === "function") query.addListener(configureScene);
    });

    configureScene();
  }

  function initGuidesParallax() {
    const section = document.querySelector(".home-guides");
    if (!section) return;

    const viewportQuery = window.matchMedia("(min-width: 48rem)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let frame = 0;

    function clamp(value, minimum, maximum) {
      return Math.min(Math.max(value, minimum), maximum);
    }

    function updateParallax() {
      frame = 0;
      if (!active) return;

      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const travel = (sectionCenter - viewportCenter) / ((window.innerHeight + rect.height) / 2);
      const offset = clamp(-travel * 46, -46, 46);
      section.style.setProperty("--guides-parallax-y", offset.toFixed(2) + "px");
    }

    function requestParallaxUpdate() {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    }

    function configureParallax() {
      active = viewportQuery.matches && !reduceMotionQuery.matches;
      section.style.removeProperty("--guides-parallax-y");
      if (active) updateParallax();
    }

    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate, { passive: true });

    [viewportQuery, reduceMotionQuery].forEach(function (query) {
      if (typeof query.addEventListener === "function") query.addEventListener("change", configureParallax);
      else if (typeof query.addListener === "function") query.addListener(configureParallax);
    });

    configureParallax();
  }

  function init() {
    initHeader();
    initReveal();
    initProcessScroll();
    initGuidesParallax();
    initTypewriter();
    initCookieNotice();
    setCurrentNavigation();
    initFaqAccordions();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
