<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

function clean_text($value, int $maxLength): string
{
    if (!is_string($value)) {
        return '';
    }
    $value = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '');
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }
    return substr($value, 0, $maxLength);
}

function has_header_injection(string $value): bool
{
    return preg_match('/[\r\n]/', $value) === 1;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, false, 'Method not allowed.');
}

foreach (['recipientEmail', 'recipient', 'to', 'emailTo', 'mailTo'] as $forbiddenField) {
    if (array_key_exists($forbiddenField, $_POST)) {
        respond(400, false, 'The request could not be processed.');
    }
}

$honeypot = clean_text($_POST['website'] ?? '', 200);
if ($honeypot !== '') {
    respond(400, false, 'The request could not be processed.');
}

$started = filter_var($_POST['formStarted'] ?? null, FILTER_VALIDATE_INT);
$now = time();
if ($started === false || $started < ($now - 86400) || ($now - $started) < 3) {
    respond(400, false, 'Please wait a moment and try again.');
}

$formType = clean_text($_POST['formType'] ?? 'contact', 30);
$name = clean_text($_POST['name'] ?? '', 100);
$email = clean_text($_POST['email'] ?? '', 254);
$company = clean_text($_POST['company'] ?? '', 150);
$inquiryType = clean_text($_POST['inquiryType'] ?? '', 60);
$budget = clean_text($_POST['budget'] ?? '', 40);
$timeline = clean_text($_POST['timeline'] ?? '', 40);
$message = clean_text($_POST['message'] ?? '', 4000);
$sourcePage = clean_text($_POST['sourcePage'] ?? '', 200);
$consent = $_POST['privacyConsent'] ?? '';

$allowedFormTypes = ['contact', 'audit'];
$allowedInquiryTypes = [
    'automation-audit',
    'lead-follow-up',
    'email',
    'customer-service',
    'chat-assistant',
    'marketing',
    'document-data',
    'industry',
    'advertise-collaborate',
    'general'
];
$allowedBudgets = ['', 'under-1000', '1000-3000', '3000-7500', '7500-plus', 'not-sure'];
$allowedTimelines = ['', 'asap', '1-month', '1-3-months', 'exploring'];

if (!in_array($formType, $allowedFormTypes, true)) {
    respond(422, false, 'The request contains an invalid form type.');
}
if ($name === '' || has_header_injection($name)) {
    respond(422, false, 'Please provide a valid name.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || has_header_injection($email)) {
    respond(422, false, 'Please provide a valid email address.');
}
if (has_header_injection($company)) {
    respond(422, false, 'Please provide valid company information.');
}
if (!in_array($inquiryType, $allowedInquiryTypes, true)) {
    respond(422, false, 'Please select a valid inquiry type.');
}
if (!in_array($budget, $allowedBudgets, true) || !in_array($timeline, $allowedTimelines, true)) {
    respond(422, false, 'Please select valid project details.');
}
if (strlen($message) < 20) {
    respond(422, false, 'Please provide a little more detail about your request.');
}
if (!in_array($consent, ['1', 'on', 'yes'], true)) {
    respond(422, false, 'Privacy consent is required.');
}

$configPath = __DIR__ . '/config/config.js';
if (!is_file($configPath) || !is_readable($configPath)) {
    respond(500, false, 'The form is temporarily unavailable.');
}

$configSource = file_get_contents($configPath);
if ($configSource === false || !preg_match('/^\s*window\.SITE_CONFIG\s*=\s*Object\.freeze\((\{.*\})\);\s*$/s', $configSource, $matches)) {
    respond(500, false, 'The form is temporarily unavailable.');
}

$config = json_decode($matches[1], true);
if (!is_array($config)) {
    respond(500, false, 'The form is temporarily unavailable.');
}

$corporateEmail = $config['site']['corporateEmail'] ?? '';
$recipientTemplate = $config['forms']['recipientEmail'] ?? '';
if (!is_string($corporateEmail) || !is_string($recipientTemplate)) {
    respond(500, false, 'The form is temporarily unavailable.');
}
$recipient = str_replace('{corporateEmail}', $corporateEmail, $recipientTemplate);
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || has_header_injection($recipient)) {
    respond(500, false, 'The form is temporarily unavailable.');
}

$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'flowready-form-' . hash('sha256', $ipAddress) . '.json';
if (is_file($rateFile)) {
    $lastSubmission = json_decode((string) @file_get_contents($rateFile), true);
    if (is_array($lastSubmission) && isset($lastSubmission['time']) && ($now - (int) $lastSubmission['time']) < 20) {
        respond(429, false, 'Please wait before sending another request.');
    }
}
@file_put_contents($rateFile, json_encode(['time' => $now]), LOCK_EX);

$siteName = clean_text($config['site']['name'] ?? 'Website', 120);
$companyName = clean_text($config['site']['companyName'] ?? $siteName, 120);
$defaultSubject = clean_text($config['forms']['defaultSubject'] ?? 'New website inquiry', 160);
$defaultSubject = str_replace(
    ['{siteName}', '{companyName}', '{corporateEmail}'],
    [$siteName, $companyName, $corporateEmail],
    $defaultSubject
);
$subjectPrefix = $formType === 'audit' ? 'Automation audit request' : $defaultSubject;
$subject = $subjectPrefix . ' — ' . $name;

$labels = [
    'automation-audit' => 'Automation audit',
    'lead-follow-up' => 'Lead follow-up automation',
    'email' => 'Email automation',
    'customer-service' => 'AI for customer service',
    'chat-assistant' => 'AI chat assistant',
    'marketing' => 'Marketing automation',
    'document-data' => 'Document and data automation',
    'industry' => 'Industry solution',
    'advertise-collaborate' => 'Advertise and collaborate',
    'general' => 'General inquiry'
];

$bodyLines = [
    'Website: ' . $siteName,
    'Company: ' . $companyName,
    'Form type: ' . ($formType === 'audit' ? 'Automation audit' : 'General contact'),
    'Name: ' . $name,
    'Email: ' . $email
];
if ($company !== '') {
    $bodyLines[] = 'Visitor company: ' . $company;
}
$bodyLines[] = 'Inquiry: ' . ($labels[$inquiryType] ?? $inquiryType);
if ($budget !== '') {
    $bodyLines[] = 'Budget range: ' . $budget;
}
if ($timeline !== '') {
    $bodyLines[] = 'Timeline: ' . $timeline;
}
$bodyLines[] = 'Source page: ' . ($sourcePage !== '' ? $sourcePage : 'Not provided');
$bodyLines[] = 'Submitted: ' . gmdate('Y-m-d H:i:s') . ' UTC';
$bodyLines[] = '';
$bodyLines[] = 'Message:';
$bodyLines[] = $message;
$emailBody = implode("\r\n", $bodyLines);

$websiteUrl = $config['site']['websiteUrl'] ?? '';
$sender = $recipient;
if (is_string($websiteUrl) && $websiteUrl !== '') {
    $host = parse_url($websiteUrl, PHP_URL_HOST);
    if (is_string($host)) {
        $host = preg_replace('/^www\./i', '', strtolower($host));
        if ($host && preg_match('/^[a-z0-9.-]+$/', $host)) {
            $candidate = 'noreply@' . $host;
            if (filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
                $sender = $candidate;
            }
        }
    }
}

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $siteName . ' <' . $sender . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . PHP_VERSION
];
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($recipient, $encodedSubject, $emailBody, implode("\r\n", $headers));

if (!$sent) {
    respond(500, false, 'The message could not be sent.');
}

respond(200, true, 'Message sent successfully.');
