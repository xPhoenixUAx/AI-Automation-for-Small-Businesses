<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    ini_set('display_errors', '0');
}
header('X-Content-Type-Options: nosniff');

function fail_response(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: text/plain; charset=UTF-8');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
        echo $message;
    }
    exit;
}

function load_site_config(): array
{
    $path = __DIR__ . '/config/config.js';
    if (!is_file($path) || !is_readable($path)) {
        fail_response(500, 'Website configuration is temporarily unavailable.');
    }

    $source = file_get_contents($path);
    if ($source === false || !preg_match('/^\s*window\.SITE_CONFIG\s*=\s*Object\.freeze\((\{.*\})\);\s*$/s', $source, $matches)) {
        fail_response(500, 'Website configuration is temporarily unavailable.');
    }

    $config = json_decode($matches[1], true);
    if (!is_array($config) || json_last_error() !== JSON_ERROR_NONE) {
        fail_response(500, 'Website configuration is temporarily unavailable.');
    }

    return $config;
}

function config_value(array $config, string $path)
{
    $value = $config;
    foreach (explode('.', $path) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return null;
        }
        $value = $value[$segment];
    }
    return $value;
}

function resolve_tokens(string $value, array $config): string
{
    $siteName = (string) ($config['site']['name'] ?? '');
    $companyName = (string) ($config['site']['companyName'] ?? $siteName);
    $email = (string) ($config['site']['corporateEmail'] ?? '');
    $websiteUrl = rtrim((string) ($config['site']['websiteUrl'] ?? ''), '/');
    $address = (string) ($config['site']['address'] ?? '');
    $companyId = (string) ($config['site']['companyId'] ?? '');

    return str_replace(
        ['{siteName}', '{companyName}', '{corporateEmail}', '{websiteUrl}', '{address}', '{companyId}', '{addressLine}', '{companyIdLine}'],
        [$siteName, $companyName, $email, $websiteUrl, $address, $companyId, $address !== '' ? ' · ' . $address : '', $companyId !== '' ? ' · ' . $companyId : ''],
        $value
    );
}

function escape_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function set_meta_tag(string $html, string $attribute, string $key, string $value): string
{
    if ($value === '') {
        return $html;
    }
    $tag = '<meta ' . $attribute . '="' . escape_html($key) . '" content="' . escape_html($value) . '">';
    $pattern = '/<meta\b(?=[^>]*\b' . preg_quote($attribute, '/') . '=["\']' . preg_quote($key, '/') . '["\'])[^>]*>/i';
    if (preg_match($pattern, $html)) {
        return (string) preg_replace($pattern, $tag, $html, 1);
    }
    return (string) preg_replace('/<\/head>/i', '  ' . $tag . "\n</head>", $html, 1);
}

function set_canonical(string $html, string $url): string
{
    if ($url === '') {
        return (string) preg_replace('/\s*<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*>/i', '', $html);
    }
    $tag = '<link rel="canonical" href="' . escape_html($url) . '">';
    $pattern = '/<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*>/i';
    if (preg_match($pattern, $html)) {
        return (string) preg_replace($pattern, $tag, $html, 1);
    }
    return (string) preg_replace('/<\/head>/i', '  ' . $tag . "\n</head>", $html, 1);
}

function replace_attribute(string $tag, string $attribute, string $value): string
{
    $escaped = escape_html($value);
    if (preg_match('/\b' . preg_quote($attribute, '/') . '=["\'][^"\']*["\']/i', $tag)) {
        return (string) preg_replace('/\b' . preg_quote($attribute, '/') . '=["\'][^"\']*["\']/i', $attribute . '="' . $escaped . '"', $tag, 1);
    }
    return (string) preg_replace('/>$/', ' ' . $attribute . '="' . $escaped . '">', $tag, 1);
}

function apply_form_content(string $html, array $config): string
{
    return (string) preg_replace_callback(
        '/(<form\b[^>]*\bdata-contact-form\b[^>]*>)(.*?)(<\/form>)/is',
        static function (array $formMatch) use ($config): string {
            $body = $formMatch[2];
            $isAudit = preg_match('/<input\b(?=[^>]*\bname="formType")(?=[^>]*\bvalue="audit")[^>]*>/i', $body) === 1;
            $bindings = [
                'name' => 'forms.labels.name',
                'email' => 'forms.labels.email',
                'company' => $isAudit ? 'forms.labels.auditCompany' : 'forms.labels.company',
                'inquiryType' => 'forms.labels.inquiryType',
                'message' => $isAudit ? 'forms.labels.auditMessage' : 'forms.labels.message',
                'budget' => 'forms.labels.budget',
                'timeline' => 'forms.labels.timeline'
            ];

            foreach ($bindings as $name => $path) {
                if (!preg_match('/<(?:input|select|textarea)\b(?=[^>]*\bname="' . preg_quote($name, '/') . '")(?=[^>]*\bid="([^"]+)")[^>]*>/i', $body, $fieldMatch)) {
                    continue;
                }
                $label = config_value($config, $path);
                if (!is_string($label) || $label === '') {
                    continue;
                }
                $body = (string) preg_replace_callback(
                    '/(<label\b[^>]*\bfor="' . preg_quote($fieldMatch[1], '/') . '"[^>]*>)(.*?)(<\/label>)/is',
                    static function (array $labelMatch) use ($label): string {
                        $inner = preg_match('/<span\b[^>]*\baria-hidden="true"[^>]*>/i', $labelMatch[2])
                            ? preg_replace('/^[^<]*/', escape_html($label) . ' ', $labelMatch[2], 1)
                            : escape_html($label);
                        return $labelMatch[1] . $inner . $labelMatch[3];
                    },
                    $body,
                    1
                );
            }

            $placeholders = [
                'message' => $isAudit ? 'forms.placeholders.auditMessage' : 'forms.placeholders.message'
            ];
            if ($isAudit) {
                $placeholders['company'] = 'forms.placeholders.auditCompany';
            }
            foreach ($placeholders as $name => $path) {
                $placeholder = config_value($config, $path);
                if (!is_string($placeholder) || $placeholder === '') {
                    continue;
                }
                $body = (string) preg_replace_callback(
                    '/<(?:input|textarea)\b(?=[^>]*\bname="' . preg_quote($name, '/') . '")[^>]*>/i',
                    static fn(array $match): string => replace_attribute($match[0], 'placeholder', $placeholder),
                    $body,
                    1
                );
            }

            return $formMatch[1] . $body . $formMatch[3];
        },
        $html
    );
}

function apply_config_bindings(string $html, array $config): string
{
    $html = (string) preg_replace_callback(
        '/(<([a-z][a-z0-9:-]*)\b[^>]*\bdata-config="([^"]+)"[^>]*>)(.*?)(<\/\2>)/is',
        static function (array $match) use ($config): string {
            $value = config_value($config, $match[3]);
            if (!is_scalar($value)) {
                return $match[0];
            }
            return $match[1] . escape_html(resolve_tokens((string) $value, $config)) . $match[5];
        },
        $html
    );

    $html = (string) preg_replace_callback(
        '/(<a\b[^>]*\bdata-config-email="([^"]+)"[^>]*>)(.*?)(<\/a>)/is',
        static function (array $match) use ($config): string {
            $value = config_value($config, $match[2]);
            if (!is_string($value) || $value === '') {
                return $match[0];
            }
            $value = resolve_tokens($value, $config);
            $tag = replace_attribute($match[1], 'href', 'mailto:' . $value);
            $label = stripos($tag, 'data-preserve-label') !== false ? $match[3] : escape_html($value);
            return $tag . $label . $match[4];
        },
        $html
    );

    $html = (string) preg_replace_callback(
        '/<a\b[^>]*\bdata-config-link="([^"]+)"[^>]*>/i',
        static function (array $match) use ($config): string {
            $value = config_value($config, $match[1]);
            return is_string($value) && $value !== '' ? replace_attribute($match[0], 'href', resolve_tokens($value, $config)) : $match[0];
        },
        $html
    );

    $html = (string) preg_replace_callback(
        '/<([a-z][a-z0-9:-]*)\b[^>]*\bdata-config-aria-label="([^"]+)"[^>]*>/i',
        static function (array $match) use ($config): string {
            $value = config_value($config, $match[2]);
            return is_string($value) && $value !== '' ? replace_attribute($match[0], 'aria-label', resolve_tokens($value, $config)) : $match[0];
        },
        $html
    );

    $logo = (string) ($config['branding']['logoImage'] ?? '');
    if ($logo !== '') {
        $html = str_replace('images/branding/favicon.webp', escape_html($logo), $html);
    }

    $routes = [
        'home' => ['index.html', 'navigation.home'],
        'about' => ['about.html', 'navigation.about'],
        'contact' => ['contact.html', 'navigation.contact'],
        'audit' => ['automation-audit.html', 'navigation.audit'],
        'aiCustomerService' => ['ai-customer-service.html', 'navigation.aiCustomerService'],
        'marketingAutomation' => ['marketing-automation.html', 'navigation.marketingAutomation'],
        'leadFollowUp' => ['lead-follow-up-automation.html', 'navigation.leadFollowUp'],
        'emailAutomation' => ['email-automation.html', 'navigation.emailAutomation'],
        'aiChatAssistants' => ['ai-chat-assistants.html', 'navigation.aiChatAssistants'],
        'documentDataAutomation' => ['document-data-automation.html', 'navigation.documentDataAutomation'],
        'industrySolutions' => ['industry-solutions.html', 'navigation.industrySolutions'],
        'automationExamples' => ['automation-examples.html', 'navigation.automationExamples'],
        'aiToolsGuides' => ['ai-tools-guides.html', 'navigation.aiToolsGuides'],
        'privacy' => ['privacy-policy.html', null],
        'terms' => ['terms-and-conditions.html', null],
        'cookies' => ['cookie-policy.html', null]
    ];

    foreach ($routes as $key => [$fallback, $labelPath]) {
        $configured = (string) ($config['links'][$key] ?? '');
        if ($configured === '') {
            continue;
        }
        $html = str_replace('href="' . $fallback . '"', 'href="' . escape_html($configured) . '"', $html);
        if ($labelPath !== null) {
            $label = config_value($config, $labelPath);
            if (is_string($label) && $label !== '') {
                $html = (string) preg_replace_callback(
                    '/(<nav\b[^>]*class="[^"]*(?:site-nav|footer-nav)[^"]*"[^>]*>.*?<a\b[^>]*href="' . preg_quote(escape_html($configured), '/') . '"[^>]*>)(.*?)(<\/a>.*?<\/nav>)/is',
                    static fn(array $match): string => $match[1] . escape_html($label) . $match[3],
                    $html
                );
            }
        }
    }

    $html = (string) preg_replace_callback(
        '/(<nav\b[^>]*class="[^"]*\bsite-nav\b[^"]*"[^>]*>)(.*?)(<\/nav>)/is',
        static function (array $match) use ($config): string {
            $body = $match[2];
            $dropdownIndex = 0;
            $dropdownPaths = ['navigation.solutions', 'navigation.resources'];
            $body = (string) preg_replace_callback(
                '/(<button\b[^>]*\bdata-dropdown-toggle\b[^>]*>)(.*?)(<\/button>)/is',
                static function (array $buttonMatch) use ($config, &$dropdownIndex, $dropdownPaths): string {
                    $path = $dropdownPaths[$dropdownIndex] ?? null;
                    $dropdownIndex++;
                    if ($path === null) {
                        return $buttonMatch[0];
                    }
                    $label = config_value($config, $path);
                    return is_string($label) && $label !== '' ? $buttonMatch[1] . escape_html($label) . $buttonMatch[3] : $buttonMatch[0];
                },
                $body
            );
            $start = replace_attribute($match[1], 'aria-label', resolve_tokens((string) ($config['accessibility']['primaryNavigation'] ?? ''), $config));
            return $start . $body . $match[3];
        },
        $html
    );

    $footerIndex = 0;
    $footerTitlePaths = ['footer.solutionsTitle', 'footer.resourcesTitle', 'footer.companyTitle'];
    $html = (string) preg_replace_callback(
        '/(<nav\b[^>]*class="[^"]*\bfooter-nav\b[^"]*"[^>]*>)(.*?)(<\/nav>)/is',
        static function (array $match) use ($config, &$footerIndex, $footerTitlePaths): string {
            $path = $footerTitlePaths[$footerIndex] ?? null;
            $footerIndex++;
            if ($path === null) {
                return $match[0];
            }
            $title = config_value($config, $path);
            if (!is_string($title) || $title === '') {
                return $match[0];
            }
            $body = (string) preg_replace('/(<h2\b[^>]*>)(.*?)(<\/h2>)/is', '$1' . escape_html($title) . '$3', $match[2], 1);
            $suffix = (string) ($config['accessibility']['footerNavigation'] ?? '');
            $start = replace_attribute($match[1], 'aria-label', trim($title . ' ' . $suffix));
            return $start . $body . $match[3];
        },
        $html
    );

    $brandLabel = resolve_tokens((string) ($config['accessibility']['brandHomeLabel'] ?? ''), $config);
    if ($brandLabel !== '') {
        $html = (string) preg_replace_callback('/<a\b[^>]*class="[^"]*\bbrand\b[^"]*"[^>]*>/i', static fn(array $m): string => replace_attribute($m[0], 'aria-label', $brandLabel), $html);
    }

    $openMenu = resolve_tokens((string) ($config['accessibility']['openMenu'] ?? ''), $config);
    if ($openMenu !== '') {
        $html = (string) preg_replace_callback('/<button\b[^>]*\bdata-menu-toggle\b[^>]*>/i', static fn(array $m): string => replace_attribute($m[0], 'aria-label', $openMenu), $html);
    }

    $cookieLabel = (string) ($config['cookies']['policyLabel'] ?? '');
    if ($cookieLabel !== '') {
        $html = (string) preg_replace_callback('/(<aside\b[^>]*\bdata-cookie-banner\b[^>]*>.*?<a\b[^>]*>)(.*?)(<\/a>.*?<\/aside>)/is', static fn(array $m): string => $m[1] . escape_html($cookieLabel) . $m[3], $html);
    }

    $companyLine = resolve_tokens((string) ($config['footer']['companyLine'] ?? ''), $config);
    if ($companyLine !== '') {
        $html = (string) preg_replace_callback(
            '/(<div\b[^>]*class="[^"]*\bfooter-bottom\b[^"]*"[^>]*>)(.*?)(<\/div>)/is',
            static function (array $match) use ($companyLine): string {
                if (stripos($match[2], 'data-footer-company-line') !== false) {
                    return $match[0];
                }
                $line = '<p class="footer-company-line" data-footer-company-line>' . escape_html($companyLine) . '</p>';
                $body = preg_replace('/(<a\b[^>]*class="[^"]*\bfooter-email\b)/i', $line . '$1', $match[2], 1);
                return $match[1] . $body . $match[3];
            },
            $html
        );
    }

    return apply_form_content($html, $config);
}

function render_page(array $config, string $pageName): void
{
    $pageName = basename($pageName);
    $pages = $config['seo']['pages'] ?? [];
    if (!is_array($pages) || !isset($pages[$pageName]) || !is_array($pages[$pageName])) {
        fail_response(404, 'Page not found.');
    }

    $path = __DIR__ . '/' . $pageName;
    if (!is_file($path) || !is_readable($path)) {
        fail_response(404, 'Page not found.');
    }

    $html = file_get_contents($path);
    if ($html === false) {
        fail_response(500, 'The page is temporarily unavailable.');
    }

    $page = $pages[$pageName];
    $title = resolve_tokens((string) ($page['title'] ?? ''), $config);
    $description = resolve_tokens((string) ($page['description'] ?? ''), $config);
    $websiteUrl = rtrim((string) ($config['site']['websiteUrl'] ?? ''), '/');
    $publicPath = (string) ($page['path'] ?? ($pageName === 'index.html' ? '/' : '/' . $pageName));
    $canonical = $websiteUrl !== '' ? $websiteUrl . $publicPath : '';
    $imagePath = (string) ($page['image'] ?? $config['seo']['defaultImage'] ?? '');
    $imageUrl = $websiteUrl !== '' && $imagePath !== '' ? $websiteUrl . '/' . ltrim($imagePath, '/') : '';
    $imageWidth = (string) ($page['imageWidth'] ?? $config['seo']['defaultImageWidth'] ?? '');
    $imageHeight = (string) ($page['imageHeight'] ?? $config['seo']['defaultImageHeight'] ?? '');

    $html = apply_config_bindings($html, $config);
    $html = (string) preg_replace('/<html\b[^>]*\blang=["\'][^"\']*["\']/i', '<html lang="' . escape_html((string) ($config['seo']['language'] ?? 'en')) . '"', $html, 1);
    $html = (string) preg_replace('/<title>.*?<\/title>/is', '<title>' . escape_html($title) . '</title>', $html, 1);
    $html = set_meta_tag($html, 'name', 'description', $description);
    $html = set_meta_tag($html, 'name', 'robots', (string) ($config['seo']['robotsDirective'] ?? 'index, follow'));
    $html = set_meta_tag($html, 'property', 'og:type', (string) ($page['type'] ?? 'website'));
    $html = set_meta_tag($html, 'property', 'og:locale', (string) ($config['seo']['locale'] ?? 'en_US'));
    $html = set_meta_tag($html, 'property', 'og:title', $title);
    $html = set_meta_tag($html, 'property', 'og:description', $description);
    $html = set_meta_tag($html, 'property', 'og:url', $canonical);
    $html = set_meta_tag($html, 'name', 'twitter:card', $imageUrl !== '' ? 'summary_large_image' : 'summary');
    $html = set_meta_tag($html, 'name', 'twitter:title', $title);
    $html = set_meta_tag($html, 'name', 'twitter:description', $description);
    if ($imageUrl !== '') {
        $html = set_meta_tag($html, 'property', 'og:image', $imageUrl);
        $html = set_meta_tag($html, 'property', 'og:image:width', $imageWidth);
        $html = set_meta_tag($html, 'property', 'og:image:height', $imageHeight);
        $html = set_meta_tag($html, 'name', 'twitter:image', $imageUrl);
    }
    $html = set_canonical($html, $canonical);

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'WebPage',
        'name' => $title,
        'description' => $description,
        'inLanguage' => (string) ($config['seo']['language'] ?? 'en'),
        'isPartOf' => [
            '@type' => 'WebSite',
            'name' => (string) ($config['site']['name'] ?? ''),
            'url' => $websiteUrl
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => (string) ($config['site']['companyName'] ?? $config['site']['name'] ?? ''),
            'url' => $websiteUrl,
            'logo' => $websiteUrl !== '' ? $websiteUrl . '/' . ltrim((string) ($config['branding']['logoImage'] ?? ''), '/') : ''
        ]
    ];
    if ($canonical !== '') {
        $schema['url'] = $canonical;
    }
    if ($imageUrl !== '') {
        $schema['primaryImageOfPage'] = $imageUrl;
    }
    $jsonLd = '<script id="site-config-schema" type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
    $html = (string) preg_replace('/\s*<script\b[^>]*id=["\']site-config-schema["\'][^>]*>.*?<\/script>/is', '', $html);
    $html = (string) preg_replace('/<\/head>/i', '  ' . $jsonLd . "\n</head>", $html, 1);

    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-cache');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
        echo $html;
    }
}

function render_robots(array $config): void
{
    $lines = ['User-agent: *', 'Allow: /'];
    $disallow = $config['seo']['robotsDisallow'] ?? [];
    if (is_array($disallow)) {
        foreach ($disallow as $path) {
            if (is_string($path) && str_starts_with($path, '/')) {
                $lines[] = 'Disallow: ' . $path;
            }
        }
    }
    $websiteUrl = rtrim((string) ($config['site']['websiteUrl'] ?? ''), '/');
    if ($websiteUrl !== '') {
        $lines[] = '';
        $lines[] = 'Sitemap: ' . $websiteUrl . '/sitemap.xml';
    }
    header('Content-Type: text/plain; charset=UTF-8');
    header('Cache-Control: no-cache');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
        echo implode("\n", $lines) . "\n";
    }
}

function render_sitemap(array $config): void
{
    $websiteUrl = rtrim((string) ($config['site']['websiteUrl'] ?? ''), '/');
    if ($websiteUrl === '') {
        fail_response(503, 'Sitemap is unavailable until site.websiteUrl is configured.');
    }
    $lastModified = (string) ($config['seo']['lastModified'] ?? '');
    $pages = $config['seo']['pages'] ?? [];
    $items = [];
    foreach ($pages as $page) {
        if (!is_array($page) || !isset($page['path'])) {
            continue;
        }
        $item = '  <url><loc>' . escape_html($websiteUrl . (string) $page['path']) . '</loc>';
        if ($lastModified !== '') {
            $item .= '<lastmod>' . escape_html($lastModified) . '</lastmod>';
        }
        $items[] = $item . '</url>';
    }
    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" . implode("\n", $items) . "\n</urlset>\n";
    header('Content-Type: application/xml; charset=UTF-8');
    header('Cache-Control: no-cache');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
        echo $xml;
    }
}

function render_manifest(array $config): void
{
    $icon = (string) ($config['branding']['logoImage'] ?? $config['seo']['manifestIcon'] ?? '');
    $manifest = [
        'name' => (string) ($config['site']['name'] ?? ''),
        'short_name' => (string) ($config['branding']['shortName'] ?? $config['site']['name'] ?? ''),
        'description' => resolve_tokens((string) ($config['footer']['text'] ?? ''), $config),
        'lang' => (string) ($config['seo']['language'] ?? 'en'),
        'start_url' => '/',
        'scope' => '/',
        'display' => 'standalone',
        'background_color' => '#050a1d',
        'theme_color' => '#050a1d',
        'icons' => $icon !== '' ? [[
            'src' => '/' . ltrim($icon, '/'),
            'sizes' => (string) ($config['seo']['manifestIconWidth'] ?? 256) . 'x' . (string) ($config['seo']['manifestIconHeight'] ?? 256),
            'type' => 'image/webp'
        ]] : []
    ];
    header('Content-Type: application/manifest+json; charset=UTF-8');
    header('Cache-Control: no-cache');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
        echo json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'HEAD'], true)) {
    fail_response(405, 'Method not allowed.');
}

$config = load_site_config();
$resource = (string) ($_GET['resource'] ?? 'page');

switch ($resource) {
    case 'page':
        render_page($config, (string) ($_GET['page'] ?? 'index.html'));
        break;
    case 'robots':
        render_robots($config);
        break;
    case 'sitemap':
        render_sitemap($config);
        break;
    case 'manifest':
        render_manifest($config);
        break;
    default:
        fail_response(404, 'Resource not found.');
}
