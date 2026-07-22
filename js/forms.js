(function () {
  "use strict";

  function configValue(path, fallback) {
    return window.SiteConfig ? window.SiteConfig.value(path) || fallback : fallback;
  }

  function initForms() {
    const forms = document.querySelectorAll("[data-contact-form]");
    const modal = document.querySelector("[data-form-modal]");
    const modalCard = modal ? modal.querySelector("[data-modal-card]") : null;
    const modalTitle = modal ? modal.querySelector("[data-modal-title]") : null;
    const modalMessage = modal ? modal.querySelector("[data-modal-message]") : null;
    const modalClose = modal ? modal.querySelector("[data-modal-close]") : null;
    let modalReturnFocus = null;

    function closeModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      if (modalReturnFocus) modalReturnFocus.focus();
      modalReturnFocus = null;
    }

    function openModal(status, title, message, trigger) {
      if (!modal || !modalCard || !modalTitle || !modalMessage || !modalClose) return;
      modalReturnFocus = trigger;
      modalCard.dataset.status = status;
      modalTitle.textContent = title;
      modalMessage.textContent = message;
      modal.hidden = false;
      document.body.classList.add("modal-open");
      modalClose.focus();
    }

    if (modal && modalClose) {
      modalClose.addEventListener("click", closeModal);
      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) closeModal();
        if (event.key === "Tab" && !modal.hidden) {
          const focusable = Array.from(modal.querySelectorAll('button, a[href], input, select, textarea')).filter(function (item) {
            return !item.disabled && item.offsetParent !== null;
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
    }

    function setError(field, message) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
      const error = document.getElementById(field.getAttribute("aria-describedby") || "");
      if (error) error.textContent = message || "";
    }

    function validateField(field) {
      let message = "";
      const value = field.type === "checkbox" ? field.checked : field.value.trim();
      if (field.required && !value) {
        message = field.type === "checkbox"
          ? configValue("forms.validationConsent", "Please confirm your consent.")
          : configValue("forms.validationRequired", "Please complete this field.");
      } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = configValue("forms.validationEmail", "Enter a valid email address.");
      } else if (field.minLength > 0 && typeof value === "string" && value.length < field.minLength) {
        message = configValue("forms.validationMinimum", "Please provide a little more detail.");
      } else if (field.maxLength > 0 && typeof value === "string" && value.length > field.maxLength) {
        message = configValue("forms.validationLength", "Please shorten this response.");
      }
      setError(field, message);
      return !message;
    }

    forms.forEach(function (form) {
      form.noValidate = true;
      const started = form.querySelector('[name="formStarted"]');
      const source = form.querySelector('[name="sourcePage"]');
      if (started) started.value = String(Math.floor(Date.now() / 1000));
      if (source) source.value = window.location.pathname || "/";

      form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.addEventListener("blur", function () { validateField(field); });
        field.addEventListener("input", function () {
          if (field.getAttribute("aria-invalid") === "true") validateField(field);
        });
      });

      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter(function (field) {
          return field.type !== "hidden" && !field.classList.contains("honeypot");
        });
        const valid = fields.map(validateField).every(Boolean);
        if (!valid) {
          const firstInvalid = form.querySelector('[aria-invalid="true"]');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        const button = form.querySelector('button[type="submit"]');
        if (!button || button.disabled) return;
        const originalLabel = button.textContent;
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.textContent = configValue("forms.loadingMessage", "Sending...");

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "X-Requested-With": "XMLHttpRequest" }
          });
          const data = await response.json().catch(function () { return {}; });
          if (!response.ok || !data.success) throw new Error("Submission failed");
          form.reset();
          if (started) started.value = String(Math.floor(Date.now() / 1000));
          if (source) source.value = window.location.pathname || "/";
          openModal(
            "success",
            configValue("forms.successTitle", "Request received"),
            configValue("forms.successMessage", "Thank you. Your message has been sent."),
            button
          );
        } catch (_) {
          openModal(
            "error",
            configValue("forms.errorTitle", "Message not sent"),
            configValue("forms.errorMessage", "We could not send your message. Please try again."),
            button
          );
        } finally {
          button.disabled = false;
          button.removeAttribute("aria-busy");
          button.textContent = originalLabel;
        }
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initForms, { once: true });
  else initForms();
})();
