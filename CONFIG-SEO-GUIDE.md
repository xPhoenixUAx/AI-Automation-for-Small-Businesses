# Інструкція з `config.js`, SEO, `robots.txt` і `sitemap.xml`

## Головний принцип

Основні дані сайту змінюються в одному файлі:

```text
config/config.js
```

На правильно налаштованому Apache або LiteSpeed замовнику не потрібно запускати генератори чи вручну редагувати SEO-блоки, `robots.txt`, `sitemap.xml` або `site.webmanifest`. Сервер читає актуальний `config/config.js` під час кожного запиту та віддає з нього готовий результат.

Файл `scripts/generate-seo.php` для цього не потрібний. Поточна схема не створює і не перезаписує файли під час роботи сайту.

## Що вже реалізовано

- `config/config.js` є спільним джерелом змінних даних для клієнтського JavaScript і серверного PHP.
- Логотип, назва в loader-ах, доступні назви, навігація, footer, форма, cookie banner і передбачені для конфігурації legal/contact-дані читаються з конфіга.
- Контактний email має одне основне джерело — `site.corporateEmail`.
- `seo-router.php` формує серверні метадані кожної зареєстрованої сторінки з `seo.pages`.
- `robots.txt`, `sitemap.xml` і `site.webmanifest` формуються динамічно без окремої команди генерації.
- `.htaccess` підключає router, не змінюючи публічні URL сторінок.
- Статичні SEO-значення та crawler-файли залишені як аварійний fallback.
- Необов’язковий `.well-known/security.txt` і пов’язаний із ним код видалені.

Під час фінального локального проходу було перевірено:

- коректне читання strict JSON-об’єкта з фіксованої JS-обгортки;
- наявність усіх 16 HTML-сторінок у `seo.pages`;
- зміну назви, компанії та email через один конфіг у логотипі, loader-і, ARIA, legal-даних, footer, title і `mailto:`;
- використання `site.corporateEmail` серверним обробником форми та відхилення невалідної адреси;
- динамічне формування `robots.txt`, `sitemap.xml` і manifest;
- 16 URL у sitemap;
- HTTP 404 для незареєстрованої сторінки та HTTP 405 для недозволеного POST-запиту до router-а.

## Що замовник змінює перед запуском

У секції `site`:

```js
"site": {
  "name": "Digital Assets Media",
  "companyName": "Digital Assets Media",
  "corporateEmail": "contact@digitalassetsmedia.com",
  "websiteUrl": "https://digitalassetsmedia.com",
  "address": "",
  "companyId": ""
}
```

Призначення полів:

| Поле | Що контролює |
| --- | --- |
| `site.name` | Назву сайту, текстовий логотип, loader, SEO та інші місця з токеном `{siteName}` |
| `site.companyName` | Юридичну/корпоративну назву, copyright, legal-тексти та токен `{companyName}` |
| `site.corporateEmail` | Контактний email, `mailto:`-посилання і серверного одержувача форми |
| `site.websiteUrl` | Канонічні URL, Open Graph URL, JSON-LD, `robots.txt` і `sitemap.xml` |
| `site.address` | Адресу компанії там, де вона виводиться через конфіг |
| `site.companyId` | Реєстраційний номер компанії там, де він виводиться через конфіг |

Для `websiteUrl` потрібно вказати повну production-адресу з `https://`, бажано без завершального `/`:

```js
"websiteUrl": "https://example.com"
```

Email достатньо змінити один раз у `site.corporateEmail`. Поле `forms.recipientEmail` уже містить токен:

```js
"recipientEmail": "{corporateEmail}"
```

Його не потрібно замінювати окремою адресою.

## Правила синтаксису `config.js`

Конфіг має фіксовану обгортку:

```js
window.SITE_CONFIG = Object.freeze({
  ...
});
```

Внутрішній об’єкт повинен залишатися валідним JSON:

- ключі та текстові значення — тільки у подвійних лапках;
- без коментарів усередині об’єкта;
- без функцій, змінних і JavaScript-виразів;
- без коми після останнього поля в об’єкті або масиві;
- не змінювати `window.SITE_CONFIG = Object.freeze(` та фінальне `);`.

Якщо синтаксис пошкоджено, PHP не зможе прочитати конфіг. У такому випадку сторінки та crawler-файли використовуватимуть статичний fallback, де це можливо, або сервер поверне помилку конфігурації.

## Доступні токени

У текстових значеннях конфіга підтримуються такі токени:

| Токен | Джерело |
| --- | --- |
| `{siteName}` | `site.name` |
| `{companyName}` | `site.companyName`; якщо поле відсутнє, частини системи використовують назву сайту як fallback |
| `{corporateEmail}` | `site.corporateEmail` |
| `{websiteUrl}` | `site.websiteUrl` |

Наприклад:

```js
"copyright": "© 2026 {companyName}. All rights reserved.",
"brandHomeLabel": "{siteName} home",
"defaultSubject": "New {siteName} inquiry"
```

Токени обробляються і на клієнті, і в серверних частинах, де це потрібно.

## Які секції за що відповідають

### `site`

Основні дані бренду і компанії: назва, юридична назва, email, домен, адреса та реєстраційний номер.

### `branding`

Текст логотипа, коротка назва для manifest, шлях до логотипа/іконки та тексти loader-а.

```js
"branding": {
  "logoText": "{siteName}",
  "shortName": "DAM",
  "logoImage": "favicon.webp",
  "loaderLoadingText": "Loading analysis",
  "loaderOpeningText": "Opening page"
}
```

Назва в логотипі та loader-ах змінюється через конфіг. Якщо `logoText` залишається `{siteName}`, достатньо змінити лише `site.name`.

`branding.logoImage` використовується також у manifest і структурованих SEO-даних. Зображення має бути у форматі WebP. Поточна схема очікує іконку розміром 256 × 256 px.

### `accessibility`

ARIA-label, skip-link і доступні назви навігації. Тут також можна використовувати токени.

### `seo`

Мова, locale, meta robots, дата зміни, стандартне SEO-зображення, правила `robots.txt` і повна карта SEO-даних сторінок.

### `navigation` і `footer`

Написи меню, кнопок та footer. Посилання на legal-сторінки зберігаються в `links`.

### `forms`

Одержувач, тема, підписи, повідомлення та тексти валідації контактної форми.

### `cookies`

Ключ і версія згоди, весь текст cookie banner та назви його кнопок і перемикачів.

### `advertiseCollaborate`

Заголовок і текст блоку про рекламу та співпрацю.

### `social`

Посилання на соціальні мережі. Порожні значення не повинні створювати активні порожні посилання.

## Як значення потрапляють у сторінки

HTML використовує атрибути, які читає `js/config-loader.js`:

| Атрибут | Дія |
| --- | --- |
| `data-config` | Підставляє текст |
| `data-config-email` | Підставляє email і створює `mailto:` |
| `data-config-link` | Підставляє `href` |
| `data-config-aria-label` | Підставляє `aria-label` |
| `data-config-placeholder` | Підставляє placeholder |
| `data-config-value` | Підставляє `value` |
| `data-config-hide-empty` | Приховує елемент, коли значення порожнє |

`js/main.js` використовує ті самі дані для логотипа, loader-а та інших компонентів. `js/forms.js` бере з конфіга стани форми, повідомлення і тексти валідації.

## Контактна форма та єдине джерело email

`form-handler.php` читає локальний `config/config.js` на сервері. Одержувач форми визначається через:

```text
forms.recipientEmail -> {corporateEmail} -> site.corporateEmail
```

Браузер не може передати або підмінити адресу одержувача у формі. Сервер сам бере її з конфіга і перевіряє валідність.

Отже, для зміни контактної адреси потрібно редагувати лише:

```js
"corporateEmail": "new-address@example.com"
```

Фактичне надсилання листів додатково залежить від підтримки PHP `mail()` або SMTP-конфігурації production-хостингу.

## Як працює SEO сторінок

Кожна публічна HTML-сторінка має запис у `seo.pages`. Приклад:

```js
"example.html": {
  "path": "/example.html",
  "title": "Page title — {siteName}",
  "description": "Unique page description.",
  "type": "article",
  "image": "images/guides/example.webp",
  "imageWidth": 1200,
  "imageHeight": 900
}
```

Правила:

- ключ має точно збігатися з назвою HTML-файлу;
- для `index.html` шлях повинен бути `/`;
- для інших сторінок `path` має відповідати їхньому публічному URL;
- `title` і `description` повинні бути унікальними;
- `type` зазвичай `article` для гайдів і `website` для загальних, contact та legal-сторінок;
- `image` має вести на наявне локальне WebP-зображення;
- `imageWidth` і `imageHeight` мають відповідати реальному розміру файлу.

Під час запиту `seo-router.php` читає сторінку та замінює в ній SEO-блок. Із конфіга формуються:

- `<title>` і meta description;
- canonical URL;
- meta robots;
- Open Graph;
- Twitter Card;
- JSON-LD Schema.org;
- абсолютний URL SEO-зображення.

`js/config-loader.js` додатково синхронізує SEO у браузері. Для пошукових роботів важливий саме готовий серверний HTML, який повертає `seo-router.php`.

У самих `.html` залишені статичні fallback-значення. Тому локальний файл на диску може містити стару назву, але production-відповідь через router матиме актуальні дані з конфіга.

## `robots.txt`

Публічний URL:

```text
https://ваш-домен/robots.txt
```

На Apache/LiteSpeed `.htaccess` направляє цей запит до:

```text
seo-router.php?resource=robots
```

Router формує файл із:

- `User-agent: *`;
- `Allow: /`;
- усіх шляхів із `seo.robotsDisallow`;
- актуального URL sitemap на основі `site.websiteUrl`.

Поточна конфігурація:

```js
"robotsDisallow": [
  "/form-handler.php"
]
```

Щоб закрити додатковий технічний шлях, потрібно додати його до масиву:

```js
"robotsDisallow": [
  "/form-handler.php",
  "/private-path/"
]
```

`seo.robotsDirective` — це окреме налаштування. Воно керує `<meta name="robots">` на HTML-сторінках, а `robotsDisallow` — правилами публічного `robots.txt`.

Не варто блокувати `config/config.js`, CSS, JavaScript або зображення, потрібні пошуковим роботам для коректного рендерингу сайту.

Кореневий `robots.txt` збережений як статичний аварійний fallback. При активному rewrite відвідувачі та роботи отримують динамічну версію з конфіга.

## `sitemap.xml`

Публічний URL:

```text
https://ваш-домен/sitemap.xml
```

На Apache/LiteSpeed `.htaccess` направляє його до:

```text
seo-router.php?resource=sitemap
```

Router перебирає `seo.pages` і для кожного запису створює:

- `<loc>` з `site.websiteUrl` та `path` сторінки;
- `<lastmod>` зі спільного поля `seo.lastModified`.

Поточний sitemap містить 16 сторінок. Кореневий `sitemap.xml` залишений як fallback. У нормальному production-режимі публічний sitemap генерується на льоту і автоматично відображає записи `seo.pages`.

Поле дати:

```js
"lastModified": "2026-07-22"
```

Формат — `YYYY-MM-DD`. Дату потрібно оновлювати після суттєвого оновлення контенту, а не при кожній технічній дрібниці.

## Як додати нову сторінку

1. Створити HTML-файл у корені сайту, наприклад `new-guide.html`.
2. Додати запис із ключем `new-guide.html` у `seo.pages`.
3. Вказати точний `path`, унікальні `title` та `description`.
4. Додати реалістичне WebP-зображення та його точні розміри.
5. За потреби додати сторінку до `navigation`, footer або інших списків посилань.
6. Оновити `seo.lastModified`, якщо це змістовне оновлення сайту.

Після цього динамічний `sitemap.xml`, canonical, Open Graph, Twitter Card і JSON-LD оновляться без запуску скриптів.

Якщо сторінку видалено, потрібно також прибрати її запис із `seo.pages` та всі посилання на неї.

## `site.webmanifest`

Manifest теж обробляється `seo-router.php`. Із конфіга беруться:

- `site.name`;
- `branding.shortName`;
- опис із footer;
- мова;
- `branding.logoImage` або запасний `seo.manifestIcon`.

Статичний `site.webmanifest` залишається fallback-версією.

## Роль `.htaccess`

Для Apache/LiteSpeed у проєкті вже налаштовані такі публічні маршрути:

| Публічний запит | Внутрішня обробка |
| --- | --- |
| `/` | `seo-router.php?resource=page&page=index.html` |
| `/*.html` | `seo-router.php?resource=page&page=назва-файлу.html` |
| `/robots.txt` | `seo-router.php?resource=robots` |
| `/sitemap.xml` | `seo-router.php?resource=sitemap` |
| `/site.webmanifest` | `seo-router.php?resource=manifest` |

При цьому адреса в браузері не змінюється: користувач бачить звичайний `/about.html`, а не адресу PHP-router-а.

Вимоги до хостингу:

- PHP з підтримкою сучасного синтаксису, рекомендовано PHP 8.1+;
- Apache `mod_rewrite` або сумісний rewrite у LiteSpeed;
- дозвіл на правила з `.htaccess` (`AllowOverride` має дозволяти rewrite);
- файл `config/config.js` повинен бути доступний для читання PHP.

## Якщо сервер використовує Nginx

Nginx не читає `.htaccess`. Адміністратор хостингу повинен перенести до конфігурації Nginx еквівалентні внутрішні маршрути з таблиці вище та залишити стандартну обробку PHP через FastCGI.

Точний синтаксис залежить від конфігурації конкретного хостингу, тому універсальний фрагмент для сліпого копіювання тут навмисно не наведений. Потрібно передати адміністратору п’ять відповідностей маршрутів із попереднього розділу.

Без цих rewrite-правил HTML продовжить відкриватися зі статичними fallback-метаданими, але автоматичне оновлення серверного SEO, `robots.txt`, `sitemap.xml` і manifest із конфіга не працюватиме.

## Статичні fallback-файли

У корені залишені:

```text
robots.txt
sitemap.xml
site.webmanifest
```

Вони потрібні як безпечний резерв, якщо rewrite вимкнений або конфіг тимчасово неможливо прочитати. Це не головне джерело даних при нормальній роботі сайту.

Якщо production-сервер налаштований правильно, замовник не редагує ці файли після кожної зміни конфіга.

## Чого більше немає

`.well-known/security.txt` було видалено, оскільки для цього сайту він не є обов’язковим. Разом із ним видалені його router-обробка та конфіг-поля. Це не впливає на роботу сайту, SEO, `robots.txt` чи `sitemap.xml`.

## Перевірка після деплою

1. Відкрити головну та кілька внутрішніх сторінок.
2. Перевірити source HTML, а не лише DOM у DevTools: title, description, canonical і Open Graph повинні містити production-домен і актуальну назву.
3. Відкрити `/robots.txt` і перевірити домен у рядку `Sitemap:`.
4. Відкрити `/sitemap.xml`, перевірити всі 16 URL, домен і дату `lastmod`.
5. Відкрити `/site.webmanifest` та перевірити назву, short name і favicon.
6. Переконатися, що всі URL із sitemap повертають HTTP 200.
7. Перевірити контактний email, `mailto:`-посилання та тестове надсилання форми.
8. Після зміни конфіга очистити CDN/server cache і зробити hard refresh браузера.
9. За потреби перевірити sitemap у Google Search Console або іншому webmaster-інструменті.

Швидка контрольна перевірка config-only підходу:

1. Тимчасово змінити `site.name` на тестове значення.
2. Перезавантажити сторінку й перевірити логотип, loader, title та Open Graph у source HTML.
3. Повернути production-назву.
4. Очистити cache.

## Файли, які забезпечують цю систему

| Файл | Призначення |
| --- | --- |
| `config/config.js` | Єдине основне джерело даних сайту |
| `js/config-loader.js` | Підстановка конфіга в HTML та клієнтська синхронізація SEO |
| `js/main.js` | Логотип, loader та основні UI-компоненти з конфіга |
| `js/forms.js` | Тексти, стани і валідація форми з конфіга |
| `form-handler.php` | Серверна обробка форми та одержувач із конфіга |
| `seo-router.php` | Серверний SEO, `robots.txt`, `sitemap.xml` і manifest |
| `.htaccess` | Непомітне спрямування публічних URL до router-а |
| `robots.txt` | Статичний fallback |
| `sitemap.xml` | Статичний fallback |
| `site.webmanifest` | Статичний fallback |

## Важливі застереження

- Не перейменовувати ключі конфіга без одночасної зміни коду, який їх читає.
- Не передавати `config/config.js` через редактор, який додає невалідні коментарі або змінює лапки на типографські.
- Не вказувати тестовий домен у production-конфігу.
- Не дублювати email вручну у формі або PHP-файлі.
- Не додавати сторінку в sitemap вручну: додавати її до `seo.pages`.
- Не видаляти статичні fallback-файли без окремого рішення про серверну конфігурацію.
- Усі растрові зображення сайту та SEO-зображення повинні залишатися у форматі WebP.

За дотримання цих правил замовник змінює бренд, компанію, email, домен, передбачені конфігом UI/legal-тексти, SEO-сторінки, `robots.txt`, `sitemap.xml` і manifest через один `config/config.js`, без окремого генератора.
