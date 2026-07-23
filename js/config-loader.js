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
      websiteUrl: getValue("site.websiteUrl") || "",
      address: getValue("site.address") || "",
      companyId: getValue("site.companyId") || "",
      addressLine: getValue("site.address") ? " · " + getValue("site.address") : "",
      companyIdLine: getValue("site.companyId") ? " · " + getValue("site.companyId") : ""
    };
    return value.replace(/\{(siteName|companyName|corporateEmail|websiteUrl|address|companyId|addressLine|companyIdLine)\}/g, function (_, token) {
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
      const navs = footer.querySelectorAll(".footer-nav");
      if (headings[0]) headings[0].textContent = valueFor("footer.solutionsTitle");
      if (headings[1]) headings[1].textContent = valueFor("footer.resourcesTitle");
      if (headings[2]) headings[2].textContent = valueFor("footer.companyTitle");
      navs.forEach(function (nav, index) {
        const title = headings[index] ? headings[index].textContent : "";
        nav.setAttribute("aria-label", [title, valueFor("accessibility.footerNavigation")].filter(Boolean).join(" "));
      });
    });

    document.querySelectorAll("[data-menu-toggle]").forEach(function (toggle) {
      if (toggle.getAttribute("aria-expanded") !== "true") {
        toggle.setAttribute("aria-label", valueFor("accessibility.openMenu"));
      }
    });

    document.querySelectorAll(".brand").forEach(function (brand) {
      brand.setAttribute("aria-label", valueFor("accessibility.brandHomeLabel"));
    });

    document.querySelectorAll("[data-cookie-banner] a").forEach(function (link) {
      link.textContent = valueFor("cookies.policyLabel");
    });
  }

  function applyBranding() {
    const logoImage = valueFor("branding.logoImage");
    if (logoImage) {
      document.querySelectorAll(".brand img").forEach(function (image) {
        image.setAttribute("src", logoImage);
      });
      document.querySelectorAll('link[rel="icon"]').forEach(function (icon) {
        icon.setAttribute("href", logoImage);
        icon.setAttribute("type", "image/webp");
      });
    }

    const loadingText = valueFor("branding.loaderLoadingText");
    const openingText = valueFor("branding.loaderOpeningText");
    document.querySelectorAll("[data-loader-loading-text]").forEach(function (element) {
      element.textContent = loadingText;
    });
    document.querySelectorAll("[data-loader-opening-text]").forEach(function (element) {
      element.textContent = openingText;
    });
  }

  function applySharedLinks() {
    const routes = [
      { key: "home", fallback: "index.html", label: "navigation.home" },
      { key: "about", fallback: "about.html", label: "navigation.about" },
      { key: "contact", fallback: "contact.html", label: "navigation.contact" },
      { key: "audit", fallback: "automation-audit.html", label: "navigation.audit" },
      { key: "aiCustomerService", fallback: "ai-customer-service.html", label: "navigation.aiCustomerService" },
      { key: "marketingAutomation", fallback: "marketing-automation.html", label: "navigation.marketingAutomation" },
      { key: "leadFollowUp", fallback: "lead-follow-up-automation.html", label: "navigation.leadFollowUp" },
      { key: "emailAutomation", fallback: "email-automation.html", label: "navigation.emailAutomation" },
      { key: "aiChatAssistants", fallback: "ai-chat-assistants.html", label: "navigation.aiChatAssistants" },
      { key: "documentDataAutomation", fallback: "document-data-automation.html", label: "navigation.documentDataAutomation" },
      { key: "industrySolutions", fallback: "industry-solutions.html", label: "navigation.industrySolutions" },
      { key: "automationExamples", fallback: "automation-examples.html", label: "navigation.automationExamples" },
      { key: "aiToolsGuides", fallback: "ai-tools-guides.html", label: "navigation.aiToolsGuides" },
      { key: "privacy", fallback: "privacy-policy.html" },
      { key: "terms", fallback: "terms-and-conditions.html" },
      { key: "cookies", fallback: "cookie-policy.html" }
    ];

    routes.forEach(function (route) {
      const configured = valueFor("links." + route.key);
      if (!configured) return;
      document.querySelectorAll("a[href]").forEach(function (link) {
        const href = link.getAttribute("href");
        if (href !== route.fallback && href !== configured) return;
        link.setAttribute("href", configured);
        if (route.label && link.closest(".site-nav, .footer-nav") && !link.classList.contains("brand")) {
          link.textContent = valueFor(route.label);
        }
      });
    });
  }

  function applyFooterDetails() {
    const companyLine = valueFor("footer.companyLine");
    document.querySelectorAll(".footer-bottom").forEach(function (footer) {
      let element = footer.querySelector("[data-footer-company-line]");
      if (!companyLine) {
        if (element) element.remove();
        return;
      }
      if (!element) {
        element = document.createElement("p");
        element.className = "footer-company-line";
        element.setAttribute("data-footer-company-line", "");
        const email = footer.querySelector(".footer-email");
        footer.insertBefore(element, email || null);
      }
      element.textContent = companyLine;
    });
  }

  function applyFormContent() {
    document.querySelectorAll("[data-contact-form]").forEach(function (form) {
      const formType = form.querySelector('[name="formType"]');
      const isAudit = formType && formType.value === "audit";
      const bindings = {
        name: "forms.labels.name",
        email: "forms.labels.email",
        company: isAudit ? "forms.labels.auditCompany" : "forms.labels.company",
        inquiryType: "forms.labels.inquiryType",
        message: isAudit ? "forms.labels.auditMessage" : "forms.labels.message",
        budget: "forms.labels.budget",
        timeline: "forms.labels.timeline"
      };

      Object.keys(bindings).forEach(function (name) {
        const field = form.querySelector('[name="' + name + '"]');
        if (!field || !field.id) return;
        const label = form.querySelector('label[for="' + field.id + '"]');
        const value = valueFor(bindings[name]);
        if (!label || !value) return;
        const required = label.querySelector('[aria-hidden="true"]');
        if (required) {
          Array.from(label.childNodes).forEach(function (node) {
            if (node !== required) node.remove();
          });
          label.insertBefore(document.createTextNode(value + " "), required);
        } else {
          label.textContent = value;
        }
      });

      const message = form.querySelector('[name="message"]');
      const company = form.querySelector('[name="company"]');
      if (message) message.setAttribute("placeholder", valueFor(isAudit ? "forms.placeholders.auditMessage" : "forms.placeholders.message"));
      if (isAudit && company) company.setAttribute("placeholder", valueFor("forms.placeholders.auditCompany"));
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

    document.querySelectorAll("[data-config-hide-empty]").forEach(function (element) {
      const path = element.dataset.configHideEmpty || element.dataset.config;
      element.hidden = !valueFor(path);
    });

    applyBranding();
    applySharedLinks();
    applySharedLabels();
    applyFooterDetails();
    applyFormContent();

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
      const imageWidth = page.imageWidth || getValue("seo.defaultImageWidth") || "";
      const imageHeight = page.imageHeight || getValue("seo.defaultImageHeight") || "";
      const imageUrl = websiteUrl && imagePath ? websiteUrl + "/" + imagePath.replace(/^\//, "") : "";

      if (title) document.title = title;
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[name="robots"]', "content", valueFor("seo.robotsDirective"));
      setMeta('meta[property="og:type"]', "content", page.type || "website");
      setMeta('meta[property="og:locale"]', "content", valueFor("seo.locale"));
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
        setMeta('meta[property="og:image:width"]', "content", imageWidth);
        setMeta('meta[property="og:image:height"]', "content", imageHeight);
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
