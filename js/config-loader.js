(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};

  function getValue(path) {
    if (!path) return undefined;
    return path.split(".").reduce(function (value, key) {
      return value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;
    }, config);
  }

  function resolveTokens(value) {
    if (typeof value !== "string") return value;
    const tokenMap = {
      siteName: getValue("site.name") || "",
      companyName: getValue("site.companyName") || getValue("site.name") || "",
      corporateEmail: getValue("site.corporateEmail") || "",
      websiteUrl: getValue("site.websiteUrl") || ""
    };
    return value.replace(/\{(siteName|companyName|corporateEmail|websiteUrl)\}/g, function (_, token) {
      return tokenMap[token];
    });
  }

  function valueFor(path) {
    return resolveTokens(getValue(path));
  }

  function setMeta(selector, attribute, value) {
    let element = document.querySelector(selector);
    if (!element && value) {
      if (selector === 'link[rel="canonical"]') {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
      } else {
        const match = selector.match(/^meta\[(name|property)="([^"]+)"\]$/);
        if (match) {
          element = document.createElement("meta");
          element.setAttribute(match[1], match[2]);
        }
      }
      if (element) document.head.appendChild(element);
    }
    if (element && value) element.setAttribute(attribute, value);
  }

  function applySharedLabels() {
    document.querySelectorAll("[data-site-nav]").forEach(function (nav) {
      const home = nav.querySelector(':scope > a[href="index.html"]');
      const about = nav.querySelector(':scope > a[href="about.html"]');
      const contact = nav.querySelector(':scope > a[href="contact.html"]');
      const audit = nav.querySelector(':scope > a[href="automation-audit.html"]');
      const dropdowns = nav.querySelectorAll(":scope > [data-nav-dropdown] > button");
      if (home) home.textContent = valueFor("navigation.home");
      if (about) about.textContent = valueFor("navigation.about");
      if (contact) contact.textContent = valueFor("navigation.contact");
      if (audit) audit.textContent = valueFor("navigation.audit");
      if (dropdowns[0]) dropdowns[0].textContent = valueFor("navigation.solutions");
      if (dropdowns[1]) dropdowns[1].textContent = valueFor("navigation.resources");
      nav.setAttribute("aria-label", valueFor("accessibility.primaryNavigation"));
    });

    document.querySelectorAll(".footer-top").forEach(function (footer) {
      const headings = footer.querySelectorAll(".footer-nav h2");
      if (headings[0]) headings[0].textContent = valueFor("footer.solutionsTitle");
      if (headings[1]) headings[1].textContent = valueFor("footer.resourcesTitle");
      if (headings[2]) headings[2].textContent = valueFor("footer.companyTitle");
    });
  }

  function applyConfig() {
    document.querySelectorAll("[data-config]").forEach(function (element) {
      const value = valueFor(element.dataset.config);
      if (value !== undefined && value !== null) element.textContent = value;
    });

    document.querySelectorAll("[data-config-email]").forEach(function (element) {
      const value = valueFor(element.dataset.configEmail);
      if (value) {
        element.setAttribute("href", "mailto:" + value);
        if (!element.hasAttribute("data-preserve-label")) element.textContent = value;
      } else {
        element.hidden = true;
      }
    });

    document.querySelectorAll("[data-config-link]").forEach(function (element) {
      const value = valueFor(element.dataset.configLink);
      if (value) element.setAttribute("href", value);
    });

    document.querySelectorAll("[data-config-aria-label]").forEach(function (element) {
      const value = valueFor(element.dataset.configAriaLabel);
      if (value) element.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[data-config-placeholder]").forEach(function (element) {
      const value = valueFor(element.dataset.configPlaceholder);
      if (value) element.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-config-value]").forEach(function (element) {
      const value = valueFor(element.dataset.configValue);
      if (value !== undefined) element.value = value;
    });

    document.querySelectorAll("[data-social]").forEach(function (element) {
      const value = valueFor("social." + element.dataset.social);
      if (value) element.setAttribute("href", value);
      else element.hidden = true;
    });

    applySharedLabels();

    const language = valueFor("seo.language");
    if (language) document.documentElement.lang = language;

    const filename = window.location.pathname.split("/").pop() || "index.html";
    const pages = getValue("seo.pages") || {};
    const page = pages[filename];
    if (page) {
      const title = resolveTokens(page.title);
      const description = resolveTokens(page.description);
      const websiteUrl = String(valueFor("site.websiteUrl") || "").replace(/\/$/, "");
      const path = page.path || (filename === "index.html" ? "/" : "/" + filename);
      const canonical = websiteUrl ? websiteUrl + path : "";
      const imagePath = page.image || getValue("seo.defaultImage") || "";
      const imageUrl = websiteUrl && imagePath ? websiteUrl + "/" + imagePath.replace(/^\//, "") : "";

      if (title) document.title = title;
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:title"]', "content", title);
      setMeta('meta[property="og:description"]', "content", description);
      setMeta('meta[name="twitter:title"]', "content", title);
      setMeta('meta[name="twitter:description"]', "content", description);
      if (canonical) {
        setMeta('link[rel="canonical"]', "href", canonical);
        setMeta('meta[property="og:url"]', "content", canonical);
      }
      if (imageUrl) {
        setMeta('meta[property="og:image"]', "content", imageUrl);
        setMeta('meta[name="twitter:image"]', "content", imageUrl);
      }
    }

    window.dispatchEvent(new CustomEvent("siteconfigready", { detail: config }));
  }

  window.SiteConfig = Object.freeze({
    get: getValue,
    value: valueFor,
    resolveTokens: resolveTokens,
    apply: applyConfig
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyConfig, { once: true });
  } else {
    applyConfig();
  }
})();
