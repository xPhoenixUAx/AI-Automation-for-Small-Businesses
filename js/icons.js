(function () {
  "use strict";

  function makeIcon(name, className) {
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", name);
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    if (className) icon.className = className;
    return icon;
  }

  function iconForLabel(label) {
    const value = String(label || "").trim().toLowerCase();
    const rules = [
      [/professional/, "briefcase-business"], [/home|field service/, "house"],
      [/retail|ecommerce/, "shopping-bag"], [/hospitality|experience/, "concierge-bell"],
      [/property|real estate/, "building-2"], [/health|wellness/, "heart-pulse"],
      [/inquiry|receive|capture|intake|inbox/, "inbox"], [/understand/, "brain-circuit"],
      [/classify|triage|qualify/, "list-filter"],
      [/draft|prepare|prototype/, "file-pen-line"], [/assist|ai |understand|retrieve/, "sparkles"],
      [/human|review|approve|confirm|validate/, "user-check"], [/follow|send|route|resolve|escalate/, "send"],
      [/document|extract|file|record/, "files"], [/email/, "mail"],
      [/chat|message|customer service/, "messages-square"], [/marketing|campaign/, "megaphone"],
      [/audit|screen|questions|checklist/, "clipboard-check"], [/schedule|appointment|remind/, "calendar-clock"],
      [/report|learn|measure|optimize/, "chart-no-axes-combined"], [/setup|connect|integration/, "plug-zap"],
      [/control|guardrail|privacy|safety/, "shield-check"], [/guide|knowledge/, "book-open-check"]
    ];
    const match = rules.find(function (rule) { return rule[0].test(value); });
    return match ? match[1] : "sparkles";
  }

  function replaceContent(element, name, className) {
    element.textContent = "";
    element.appendChild(makeIcon(name, className));
  }

  function prepareIcons() {
    if (!window.lucide || typeof window.lucide.createIcons !== "function") return;

    document.querySelectorAll("[data-marquee] .marquee-track").forEach(function (track) {
      const group = track.querySelector(".marquee-group");
      if (!group || track.querySelectorAll(".marquee-group").length > 1) return;
      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a").forEach(function (link) { link.setAttribute("tabindex", "-1"); });
      track.appendChild(clone);
    });

    document.querySelectorAll(".breadcrumbs span[aria-hidden='true']").forEach(function (element) {
      if (element.textContent.trim() === "→") replaceContent(element, "chevron-right", "breadcrumb-icon");
    });
    document.querySelectorAll(".icon-arrow").forEach(function (element) {
      replaceContent(element, "arrow-right", "");
    });
    document.querySelectorAll(".link-cluster span[aria-hidden='true'], .solution-directory b[aria-hidden='true'], .story-list b[aria-hidden='true'], .guide-manifest b[aria-hidden='true']").forEach(function (element) {
      replaceContent(element, "arrow-up-right", "link-direction-icon");
    });
    document.querySelectorAll(".check-list li").forEach(function (item) {
      item.prepend(makeIcon("check", "check-list-icon"));
    });
    document.querySelectorAll(".feature-card__icon").forEach(function (holder) {
      const heading = holder.closest("article")?.querySelector("h3");
      replaceContent(holder, iconForLabel(heading ? heading.textContent : holder.textContent), "feature-lucide-icon");
    });
    document.querySelectorAll(".workflow-node").forEach(function (node) {
      let holder = node.querySelector(".mini-icon");
      const label = node.querySelector("strong");
      if (!holder) {
        holder = document.createElement("span");
        holder.className = "mini-icon";
        holder.setAttribute("aria-hidden", "true");
        node.prepend(holder);
      }
      replaceContent(holder, iconForLabel(label ? label.textContent : holder.textContent), "workflow-lucide-icon");
    });
    document.querySelectorAll(".metric-card .step-number, .content-card .step-number, .contact-card .step-number").forEach(function (label) {
      label.prepend(makeIcon(iconForLabel(label.textContent), "label-lucide-icon"));
    });
    document.querySelectorAll("[data-dropdown-toggle]").forEach(function (button) {
      button.appendChild(makeIcon("chevron-down", "dropdown-lucide-icon"));
    });
    document.querySelectorAll(".faq-list summary").forEach(function (summary) {
      summary.appendChild(makeIcon("chevron-down", "faq-lucide-icon"));
    });
    document.querySelectorAll(".menu-toggle").forEach(function (button) {
      button.textContent = "";
      button.appendChild(makeIcon("menu", "menu-icon menu-icon--open"));
      button.appendChild(makeIcon("x", "menu-icon menu-icon--close"));
    });
    document.querySelectorAll("a.button").forEach(function (button) {
      if (!button.querySelector("[data-lucide]")) button.appendChild(makeIcon("arrow-up-right", "button-lucide-icon"));
    });
    document.querySelectorAll(".footer-email").forEach(function (link) {
      link.prepend(makeIcon("mail", "footer-lucide-icon"));
    });

    document.documentElement.classList.add("lucide-ready");
    window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  }

  window.SiteIcons = Object.freeze({ refresh: prepareIcons });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", prepareIcons, { once: true });
  else prepareIcons();
})();
