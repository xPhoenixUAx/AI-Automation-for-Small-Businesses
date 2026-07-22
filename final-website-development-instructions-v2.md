# GLOBAL WEBSITE DEVELOPMENT INSTRUCTIONS

## 1. PURPOSE OF THIS FILE

This file contains only the global technical, structural, content-quality, configuration, form-handling, accessibility, performance, and final-review rules for website development.

This file does **not** define:

- the website niche;
- the website topic;
- the business type;
- the visual style;
- the design direction;
- the required pages for a specific project;
- the required categories or services;
- the final website content;
- the reference website or reference design.

The user will provide the design reference and the project-specific website requirements separately.

---

## 2. STRICT START RULE

After reading this file, do not begin development.

Before receiving the explicit command `START`, you must not:

- create files;
- edit files;
- generate code;
- generate images;
- build page layouts;
- define the website structure;
- invent missing project information;
- choose a niche;
- choose a visual style;
- assume which pages are required;
- install libraries;
- initialize the project;
- perform implementation work.

The user may provide information in several separate messages, including:

1. one or more design references;
2. animation and interaction references;
3. the website niche;
4. business information;
5. required pages;
6. categories, services, products, or content directions;
7. company details;
8. additional technical or content requirements.

Before the `START` command, your task is only to:

- carefully read the supplied information;
- analyze it;
- remember it;
- identify relationships between the requirements;
- answer questions when the user asks them;
- wait for the explicit start command.

Do not start development after receiving only the design reference.

Do not start development after receiving only the niche or page list.

Do not start development after receiving all project information unless the user explicitly sends:

```text
START
```

Only after receiving `START`, combine:

- this global instruction;
- all supplied design references;
- all project-specific requirements;
- the website niche;
- the required business information;
- all later corrections and additions;

and begin implementation.

If the user writes new requirements before `START`, treat them as additional project requirements and continue waiting.

If the user writes new requirements after `START`, incorporate them without discarding valid completed work or manual edits.

---

## 3. PRIORITY OF INSTRUCTIONS

Use the following priority order:

1. the user's latest explicit corrections;
2. project-specific requirements provided after this file;
3. the functional and technical rules in this file;
4. the supplied design reference;
5. reasonable implementation decisions.

The design reference is used only to understand:

- visual direction;
- composition;
- hierarchy;
- spacing;
- typography approach;
- animations;
- effects;
- interactions;
- transitions;
- responsive behavior;
- general atmosphere.

Never copy a reference website one-to-one.

Do not copy its text, company identity, imagery, branding, proprietary assets, or exact composition.

Create a unique implementation that follows the same general design language while remaining original.

If a design reference conflicts with a functional, legal, accessibility, performance, or technical requirement, prioritize the functional and technical requirement.

---

## 4. WEBSITE TYPE

These websites are not aggregators unless the project-specific requirements explicitly state otherwise.

Do not automatically add aggregator language, contractor-disclaimer language, lead-generation language, or wording about connecting users with third-party providers.

Write content according to the actual business model supplied for the specific project.

Do not claim that the company performs, provides, owns, guarantees, manufactures, delivers, or manages anything unless the project-specific information supports that claim.

---

## 5. PROJECT STRUCTURE

Use a clean, understandable, deployment-ready project structure.

The website should normally be built with:

- HTML;
- CSS;
- JavaScript;
- PHP only for form processing.

Do not use PHP for page rendering.

Do not use PHP templates for headers, footers, navigation, or content.

Do not use:

- Node.js;
- Express;
- React;
- Next.js;
- Vue;
- Angular;
- server-side rendering;
- databases;
- WordPress;
- CMS platforms;
- serverless functions;
- external form-processing services;

unless the user explicitly requests them for a specific project.

All regular website pages must remain static HTML files.

A recommended root structure is:

```text
project-root/
├── config/
│   └── config.js
├── css/
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   ├── responsive.css
│   └── pages/
├── js/
│   ├── main.js
│   ├── config-loader.js
│   ├── forms.js
│   └── page-specific/
├── images/
│   ├── home/
│   ├── about/
│   ├── contact/
│   └── other-page-folders/
├── index.html
├── about.html
├── contact.html
├── form-handler.php
└── other-project-pages.html
```

The exact number of CSS and JavaScript files may vary, but the structure must remain logical and easy to maintain.

Avoid:

- unnecessary files;
- duplicate stylesheets;
- duplicate scripts;
- dead code;
- unused libraries;
- copied placeholder sections;
- empty folders;
- generated files that are not used by the website.

Do not create `sitemap.xml` or `robots.txt` unless the user specifically asks for them.

---

## 6. REQUIRED CONFIG LOCATION

The main website configuration must be stored exactly at:

```text
/config/config.js
```

The `config` folder must be located directly in the website root.

Do not:

- move `config.js` into `/js`;
- rename the `config` folder;
- create a different main configuration location;
- create independent configuration files for individual pages;
- hardcode repeated company data across HTML files;
- replace the main JavaScript config with a PHP config;
- duplicate the same editable value in many files.

The main configuration must remain the single editable source for repeated website and company data.

---

## 7. CONFIG.JS FORMAT

The configuration must be easy for a non-developer to edit.

Use a predictable structure similar to:

```js
window.SITE_CONFIG = Object.freeze({
  site: {
    name: "Website Name",
    companyName: "Company Name",
    corporateEmail: "contact@example.com",
    websiteUrl: "https://example.com",
    address: "Company Address"
  },

  branding: {
    logoText: "Website Name",
    shortName: "Brand"
  },

  navigation: {
    home: "Home",
    about: "About Us",
    contact: "Contact Us"
  },

  footer: {
    companyLine: "Company Name · Company Address · Company ID",
    text: "Footer description",
    copyright: "© 2026 Company Name. All rights reserved."
  },

  forms: {
    recipientEmail: "contact@example.com",
    defaultSubject: "New website inquiry",
    submitLabel: "Send Message",
    loadingMessage: "Sending...",
    successTitle: "Message sent",
    successMessage: "Thank you. Your message has been sent successfully.",
    errorTitle: "Message not sent",
    errorMessage: "We could not send your message. Please try again.",
    privacyConsent: "I agree to the processing of my information for the purpose of responding to my request."
  },

  advertiseCollaborate: {
    title: "Advertise & Collaborate",
    text: "We are always open to new opportunities, high-impact collaborations, and tailored business partnerships. Whether you want to advertise your brand to our audience, launch a joint project, or book our professional services, we are ready to bring your ideas to life. Every business is unique, and we don't believe in one-size-fits-all solutions. Please reach out to us using the contact form below, tell us a bit about your goals, and our team will get back to you with an exclusive, custom-tailored proposal designed strictly for your budget and objectives. Let’s build something great together."
  },

  links: {
    privacy: "privacy-policy.html",
    terms: "terms-and-conditions.html",
    cookies: "cookie-policy.html"
  },

  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: ""
  }
});
```

The object may be expanded according to project needs.

Keep the object valid and consistently formatted.

Do not add JavaScript functions, DOM operations, event listeners, calculations, or unrelated application logic to `config.js`.

The file must contain configuration data only.

For compatibility with PHP form processing:

- use double-quoted strings;
- do not use comments inside the configuration object;
- do not use trailing commas;
- do not use template literals;
- do not use computed properties;
- do not use functions as values;
- keep `forms.recipientEmail` as a plain string;
- keep the configuration object valid JSON syntax inside the JavaScript wrapper.

---

## 8. VALUES CONTROLLED THROUGH CONFIG

At minimum, `/config/config.js` must control:

- website name;
- company name;
- logo or brand text;
- corporate email;
- website URL;
- company address;
- company ID when supplied;
- repeated navigation labels when appropriate;
- footer company line;
- footer description;
- footer links;
- copyright text;
- social links;
- contact details;
- form labels;
- form button text;
- form loading message;
- form success title;
- form success message;
- form error title;
- form error message;
- form email subject;
- form privacy-consent text;
- recipient corporate email;
- Advertise & Collaborate title;
- Advertise & Collaborate text;
- other repeated content identified in the specific project.

When a configurable value changes, all relevant instances across the website must update without editing individual HTML pages.

Create a dedicated JavaScript config loader that:

- reads values from `window.SITE_CONFIG`;
- updates elements through stable `data-config` attributes or another clear system;
- supports text content;
- supports email links;
- supports website links;
- supports address text;
- supports footer values;
- supports form labels and messages;
- fails safely if an optional value is empty;
- does not inject unsafe HTML from config values.

Prefer `textContent` over `innerHTML`.

---

## 9. NO PHONE NUMBERS

Do not use phone numbers on new websites unless the project-specific requirements explicitly request one.

Do not add:

- phone numbers in the header;
- phone numbers in the footer;
- click-to-call buttons;
- floating call buttons;
- mobile call bars;
- telephone icons implying a call action;
- placeholder phone numbers;
- fictional phone numbers.

Use email, contact forms, service-request forms, collaboration forms, and other project-appropriate contact methods instead.

---

## 10. REQUIRED FORMS

Every website must include at least one fully implemented form.

Depending on the niche, forms may be used for:

- ordering a service;
- requesting a quote;
- requesting information;
- contacting the company;
- advertising inquiries;
- collaboration inquiries;
- partnership inquiries;
- project inquiries;
- booking professional services;
- general questions.

The specific fields must match the website niche and the purpose of the form.

Do not create irrelevant fields only to make the form look larger.

Possible fields include:

- name;
- email;
- company;
- service or inquiry type;
- project details;
- budget range;
- preferred timeline;
- message;
- consent checkbox.

All required forms must be fully connected to the PHP handler.

A visual-only form is not acceptable.

A form that only displays a success message without sending data is not acceptable.

---

## 11. PHP RESTRICTION

Only form processing may use PHP.

PHP may be used exclusively to:

- receive form submissions;
- verify the request method;
- validate submitted values;
- sanitize submitted values;
- apply anti-spam checks;
- read the approved recipient email from the local config file;
- compose the email;
- send the email;
- return a structured JSON response.

PHP must not be used for:

- page rendering;
- HTML templates;
- header or footer generation;
- navigation generation;
- routing;
- loading regular website content;
- replacing JavaScript configuration;
- storing general site text;
- styling;
- client-side interactions.

Use one clear form-processing endpoint unless the project genuinely needs separate handlers.

The recommended endpoint is:

```text
/form-handler.php
```

---

## 12. RECIPIENT EMAIL MUST COME FROM CONFIG.JS

The destination address for form submissions must be obtained server-side from:

```text
/config/config.js
```

The recipient email must not be hardcoded separately in:

- `form-handler.php`;
- HTML;
- hidden form inputs;
- JavaScript submission code;
- individual page scripts.

The browser must never decide the recipient address.

Do not send `recipientEmail`, `to`, `emailTo`, or a similar destination field from the form to PHP.

The PHP handler must read the local `/config/config.js` file directly from the server filesystem and extract the approved `forms.recipientEmail` value.

Use a safe fixed server path based on `__DIR__`, for example:

```php
$configPath = __DIR__ . '/config/config.js';
```

The handler must:

1. verify that the config file exists and is readable;
2. read the local file;
3. extract the configuration object from the fixed JavaScript wrapper;
4. decode the object as JSON;
5. read only `forms.recipientEmail`;
6. validate the extracted value with `FILTER_VALIDATE_EMAIL`;
7. stop with a generic server error if the config cannot be parsed;
8. never fall back to a client-provided recipient;
9. never expose the parsed configuration in the response;
10. never reveal filesystem paths or PHP errors to the visitor.

Because the PHP handler reads the local server file, visitors may not replace the recipient by modifying browser-side JavaScript or submitted form data.

The extraction logic must be intentionally written for the fixed `window.SITE_CONFIG = Object.freeze({...});` format used by the project.

Do not use `eval`.

Do not execute JavaScript from PHP.

Do not install a JavaScript engine for parsing the config.

Do not parse arbitrary JavaScript syntax.

This is why the object inside `config.js` must follow strict JSON-compatible formatting.

If the recipient email is changed in `/config/config.js`, both:

- the email displayed on the website;
- the destination used by `form-handler.php`;

must use the new value without requiring a second manual email change elsewhere.

---

## 13. FORM HANDLER REQUIREMENTS

`form-handler.php` must:

- accept only `POST`;
- reject other request methods;
- return JSON;
- set the correct JSON content type;
- validate all required fields;
- trim submitted values;
- validate the sender's email;
- enforce reasonable field-length limits;
- reject malformed values;
- protect against email-header injection;
- reject carriage-return and newline characters in header values;
- sanitize email content safely;
- use the validated visitor email only as `Reply-To`;
- use a safe website-domain sender address when hosting allows it;
- avoid using the visitor's email as the `From` address;
- include a clear email subject;
- use UTF-8;
- include relevant form data in the email body;
- return a success response only when sending succeeds;
- return a generic failure response when sending fails;
- never return raw warnings;
- never expose server configuration;
- never expose sensitive data.

A suitable JSON response format is:

```json
{
  "success": true,
  "message": "Message sent successfully."
}
```

or:

```json
{
  "success": false,
  "message": "The message could not be sent."
}
```

Use appropriate HTTP status codes.

---

## 14. FORM SECURITY AND ANTI-SPAM

Implement practical protection suitable for a static website with a PHP form handler.

At minimum include:

- server-side validation;
- client-side validation;
- a hidden honeypot field;
- a minimum submission-time check;
- field-length limits;
- allowed-value validation for select fields;
- request-method validation;
- email-header injection protection;
- rejection of unexpected recipient fields;
- a generic error response;
- no raw PHP error output.

Where hosting permits, add lightweight rate limiting using a temporary server-side mechanism.

Do not add CAPTCHA unless the user asks for it or the project specifically requires it.

Do not rely only on JavaScript validation.

The form must remain secure when JavaScript validation is bypassed.

---

## 15. FRONTEND FORM EXPERIENCE

Submit forms asynchronously using `fetch()`.

Do not reload the page after submission.

During submission:

- disable the submit button;
- show the loading label from config;
- prevent duplicate submissions;
- keep the interface stable.

On success:

- clear the form when appropriate;
- show a polished confirmation modal or confirmation panel;
- use the success title and message from config;
- restore the submit button state;
- move keyboard focus into the confirmation;
- allow the confirmation to be closed using the keyboard;
- prevent background interaction while a modal is open.

On failure:

- preserve the user's entered values;
- show the configured error message;
- restore the submit button;
- allow the user to retry.

Validation messages must be clear and attached to the relevant fields.

Do not pretend that a message was sent when PHP returned an error.

---

## 16. EMAIL CONTENT

The email generated by PHP should include relevant available data such as:

- website name;
- company name;
- form type;
- sender name;
- sender email;
- sender company;
- selected service;
- selected inquiry type;
- project details;
- budget;
- timeline;
- message;
- source page;
- submission date and time.

Do not include empty fields.

Do not place unvalidated visitor data in email headers.

The visitor's validated email may be used only as `Reply-To`.

The recipient must always be the value loaded from `/config/config.js`.

---

## 17. ADVERTISE & COLLABORATE

Every website must contain an `Advertise & Collaborate` section on either:

- the About Us page;
- the Contact Us page.

Use the most contextually appropriate location.

The default title is:

```text
Advertise & Collaborate
```

The default text is:

```text
We are always open to new opportunities, high-impact collaborations, and tailored business partnerships. Whether you want to advertise your brand to our audience, launch a joint project, or book our professional services, we are ready to bring your ideas to life. Every business is unique, and we don't believe in one-size-fits-all solutions. Please reach out to us using the contact form below, tell us a bit about your goals, and our team will get back to you with an exclusive, custom-tailored proposal designed strictly for your budget and objectives. Let’s build something great together.
```

The title and the complete text must be editable through:

```text
/config/config.js
```

Place the website's general contact form directly under the section or integrate it into the same clearly connected composition.

Do not hardcode the title or text independently on the page when they are already available through config.

---

## 18. PAGES AND CONTENT STRUCTURE

The user will provide niche references with possible page types, categories, and content directions.

Any supplied number of pages, services, products, categories, or subcategories is a reference, not automatically a mandatory target, unless the user explicitly marks it as required.

Choose a sensible website structure based on:

- the actual niche;
- business goals;
- supplied content;
- user experience;
- search intent;
- available project information.

Do not create pages merely to increase page count.

Do not omit important pages merely to reduce work.

Typical pages may include:

- Home;
- About Us;
- Contact Us;
- service, category, product, publication, or information pages;
- Privacy Policy;
- Terms & Conditions;
- Cookie Policy.

Use only pages that fit the specific project requirements.

Every created page must have a clear purpose and meaningful content.

Do not generate thin pages with only a hero and a few cards.

---

## 19. CONTENT RULES

All text must be original and tailored to the supplied niche.

Do not copy content from:

- the visual reference;
- competing websites;
- template websites;
- previous unrelated projects.

Avoid:

- vague corporate filler;
- excessive superlatives;
- unsupported claims;
- repeated paragraphs;
- repeated CTA wording;
- artificial statistics;
- fake awards;
- fake client logos;
- fake certifications;
- fake addresses;
- fake team biographies;
- fake testimonials presented as real;
- fake guarantees;
- unsupported years of experience;
- unsupported project counts.

Do not invent factual company history unless the user provides it.

When project details are unavailable, write neutral, credible content that does not depend on fabricated facts.

Content should clearly explain:

- what the website or company offers;
- who it is for;
- how the process works;
- what users can expect;
- how users can request information or services;
- how advertising and collaboration inquiries are handled.

Use natural English unless the user requests another language.

Avoid text that obviously sounds machine-generated.

---

## 20. LEGAL PAGES

When legal pages are required, create detailed, project-appropriate content for:

- Privacy Policy;
- Terms & Conditions;
- Cookie Policy.

The content must correspond to the actual website model.

Do not insert aggregator disclaimers into a non-aggregator website.

The Privacy Policy should explain, as applicable:

- information submitted through forms;
- how information is used;
- email communication;
- form processing;
- server logs;
- cookies;
- third-party resources;
- data retention;
- user rights;
- contact details.

The Terms & Conditions should explain, as applicable:

- website use;
- informational content;
- service inquiries;
- intellectual property;
- prohibited use;
- external links;
- disclaimers;
- limitation of liability;
- changes;
- governing terms;
- contact.

The Cookie Policy should explain:

- necessary cookies;
- preference cookies;
- analytics cookies when actually used;
- embedded or third-party content when actually used;
- cookie controls;
- browser controls;
- updates.

Do not claim that the website uses analytics, tracking, advertising cookies, or third-party services unless they are actually present.

Keep configurable company details connected to `/config/config.js`.

---

## 21. ASSETS AND IMAGES

Follow the image requirements supplied with the project and design reference.

Unless instructed otherwise:

- use `.webp` for raster website images;
- give files descriptive names;
- use a unique image for each meaningful context;
- do not reuse one image as filler across unrelated sections;
- use realistic, niche-appropriate visuals;
- avoid obvious AI artifacts;
- avoid futuristic visuals unless explicitly required;
- avoid images that contradict the service or content;
- use proper `alt` text;
- provide intrinsic width and height;
- lazy-load non-critical images;
- preload only the critical hero image when beneficial.

Do not use copyrighted logos, screenshots, or protected visual assets from the reference.

---

## 22. RESPONSIVE IMPLEMENTATION


## RESPONSIVE LAYOUT REQUIREMENTS

The website must be fully responsive.

Supported viewport widths:

- Minimum: 360px
- Maximum design container: 1440px

Recommended responsive breakpoints:

- 360px
- 480px
- 576px
- 768px
- 992px
- 1200px
- 1440px

The layout must scale smoothly between breakpoints using fluid sizing where appropriate.

Use:

- clamp()
- min()
- max()
- CSS Grid
- Flexbox
- responsive spacing
- responsive typography
- responsive images

Do not rely only on media queries.

Avoid fixed pixel dimensions whenever a fluid solution is possible.

The desktop version must never exceed a maximum content width of approximately 1440px unless explicitly required by the project.

The mobile version must never require horizontal scrolling.

Every page must be manually optimized for:

- 360px
- 768px
- 1440px

Do not simply shrink desktop layouts.

On smaller screens you may:

- rearrange sections;
- change layouts;
- reduce typography;
- reduce spacing;
- replace suitable grids with accessible sliders;
- collapse complex content into accordions;
- simplify decorative elements while preserving the overall design quality.

Avoid oversized sections.

Each section should have comfortable spacing without wasting vertical space.

Hero sections should feel premium without occupying unnecessary height.

Use content-driven spacing instead of arbitrary large padding values.


## 23. ACCESSIBILITY

Implement accessibility as part of the website, not as an afterthought.

At minimum:

- use semantic HTML;
- use one logical `h1` per page;
- maintain correct heading hierarchy;
- provide useful alternative text;
- use real buttons for actions;
- use real links for navigation;
- associate labels with form fields;
- include field-level error messages;
- support keyboard navigation;
- use visible `:focus-visible` states;
- provide accessible mobile navigation;
- provide appropriate ARIA attributes only when necessary;
- make modals keyboard accessible;
- trap focus in open modals when needed;
- restore focus after closing;
- support the Escape key;
- respect `prefers-reduced-motion`;
- avoid motion that makes content inaccessible;
- maintain readable contrast;
- avoid using color as the only status indicator.

Do not add unnecessary ARIA to elements that already have correct native semantics.

---

## 24. PERFORMANCE

Keep the website efficient and deployment-ready.

Optimize for strong Lighthouse results without sacrificing the supplied design direction.

Use:

- compressed `.webp` images;
- appropriately sized responsive images;
- lazy loading for below-the-fold images;
- `decoding="async"` where appropriate;
- hero-image preload only when helpful;
- font preloading only when justified;
- `font-display: swap`;
- deferred non-critical scripts;
- minimal DOM complexity;
- minimal dependencies;
- reusable CSS;
- no unused library imports;
- no large uncompressed assets;
- no autoplay background video unless specifically required.

Do not include a library when the same effect can be implemented cleanly with lightweight native code.

When a library is required by the design reference, initialize it only on pages or elements that use it.

---

## 25. SEO AND PAGE METADATA

For every page, create:

- a unique `<title>`;
- a unique meta description;
- correct canonical handling when a real URL is supplied;
- Open Graph metadata when appropriate;
- meaningful headings;
- semantic landmark elements;
- descriptive link text.

Use structured data only when it is accurate and supported by the project.

Do not add fake ratings, fake reviews, fake pricing, fake local-business data, or unsupported schema values.

Do not create `sitemap.xml` or `robots.txt` unless explicitly requested.

---

## 26. JAVASCRIPT QUALITY

Use JavaScript only where it adds real functionality.

Organize scripts clearly.

Avoid:

- global-variable pollution;
- duplicate event listeners;
- inline event handlers;
- duplicated logic;
- page-breaking errors when an element is absent;
- hardcoded repeated company data;
- unsafe `innerHTML`;
- fake form submission;
- unnecessary animation loops.

Scripts must:

- check that target elements exist;
- fail safely;
- use event delegation where useful;
- cleanly manage modal and menu state;
- avoid blocking page rendering;
- respect reduced-motion preferences;
- work correctly on every page where they are loaded.

---

## 27. MANUAL EDITS

Do not overwrite or remove confirmed manual edits unless they directly conflict with a newer explicit user instruction.

Before changing an existing file:

- inspect its current content;
- preserve intentional custom work;
- make targeted changes;
- avoid rebuilding the entire project unnecessarily.

Do not remove working custom functionality merely because a different implementation would be easier.

---

## 28. DEPLOYMENT REQUIREMENTS

The final project must be ready for standard hosting that supports static files and PHP.

Before declaring the form complete, verify:

- `form-handler.php` is reachable;
- every form uses the correct endpoint path;
- forms work from root and nested pages;
- `/config/config.js` loads correctly from every page;
- PHP can read `/config/config.js` using the server filesystem;
- the recipient email is extracted from config;
- no recipient email is separately hardcoded in PHP;
- client-side and server-side validation work;
- the success state appears only after real PHP success;
- failure states are handled;
- PHP errors are not shown publicly;
- the hosting environment supports PHP `mail()` or the chosen server mail transport.

If local development does not provide a configured mail server, do not falsely claim that real email delivery was verified locally.

Implement the complete sending flow and document that final delivery depends on the hosting mail configuration.

Do not silently replace PHP mail processing with a third-party service.

---

## 29. FINAL QUALITY CHECK

Before completing the project, perform a full review.

### Structure

Check that:

- all required pages exist;
- every page has a clear purpose;
- all internal links work;
- asset paths work;
- nested-page paths work;
- no unnecessary files remain;
- no requested manual edits were lost.

### Config

Check that:

- `/config/config.js` exists in the root `config` folder;
- all required repeated values come from config;
- website name updates everywhere;
- company name updates everywhere;
- corporate email updates everywhere;
- address updates everywhere;
- footer content updates everywhere;
- form messages update everywhere;
- Advertise & Collaborate title and text update everywhere;
- PHP reads the recipient from config;
- no outdated hardcoded duplicate values remain.

### Forms

Check that:

- all forms submit to PHP;
- validation works;
- anti-spam protection works;
- loading state works;
- success state works;
- failure state works;
- duplicate submission is prevented;
- the recipient cannot be overridden by a visitor;
- the form email contains useful information;
- no sensitive server errors are exposed.

### Responsive behavior

Check at minimum:

- 360px;
- common mobile widths;
- tablet widths;
- laptop widths;
- large desktop widths.

Verify:

- no horizontal overflow;
- readable typography;
- reasonable section heights;
- usable navigation;
- usable forms;
- accessible sliders and accordions;
- correct image cropping;
- comfortable spacing.

### Accessibility

Check:

- keyboard navigation;
- focus states;
- labels;
- heading hierarchy;
- modal behavior;
- mobile menu behavior;
- contrast;
- reduced-motion mode.

### Performance

Check:

- unused code;
- oversized images;
- unnecessary scripts;
- duplicate libraries;
- layout shifts;
- render-blocking assets;
- lazy loading;
- image dimensions.

### Content

Check:

- no copied reference content;
- no aggregator wording unless explicitly required;
- no invented factual claims;
- no placeholder text;
- no repeated filler;
- no fake testimonials or statistics;
- no obvious AI-style phrasing;
- no irrelevant sections.

### Visual consistency

Compare the completed website with the supplied design reference and verify:

- the intended visual language is recognizable;
- the implementation is original;
- the hierarchy is clear;
- page density is balanced;
- typography is consistent;
- animations are intentional;
- mobile behavior is polished;
- no section looks unfinished or template-like.

After the technical review, inspect the project again as:

- a senior frontend developer;
- a UI/UX designer;
- a content editor;
- a first-time visitor.

If any section appears weak, repetitive, artificial, unfinished, or inconsistent, improve it before finishing.

---

## 30. COMPLETION RESPONSE

When development is complete, provide a concise completion summary that includes:

- what was created;
- which pages were added;
- where the main config is located;
- where the PHP form handler is located;
- how to change the recipient email;
- any hosting requirement for PHP email delivery;
- any point that could not be fully tested in the local environment.

Do not claim success for functionality that was not actually implemented.

Do not begin any work governed by this file until the explicit `START` command has been received.
