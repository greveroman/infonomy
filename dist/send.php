<?php
/**
 * Обработчик заявок со страницы /join → письмо на email.
 * Требуется хостинг с PHP 7.4+ и настроенной функцией mail() (или SMTP у хостера).
 *
 * НАСТРОЙКА: укажите адрес получателя в $TO.
 */
$TO = '[НУЖЕН ТЕКСТ: email для получения заявок]';
$SUBJECT = 'Заявка на участие — Конструкторское бюро Вектор';

// Поля формы: имя => [подпись, обязательное]. Должны совпадать с src/content/join.json.
$FIELDS = [
  'name'       => ['Фамилия и имя', true],
  'city'       => ['Город / регион', true],
  'area'       => ['В какой области ваша экспертиза?', true],
  'phone'      => ['Ваш телефон', false],
  'email'      => ['Ваша почта', true],
  'messenger'  => ['Telegram / MAX', false],
  'experience' => ['Ваши компетенции и опыт', true],
  'motivation' => ['Ваша мотивация участвовать', false],
  'comment'    => ['Поле для дополнительных комментариев', false],
];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply($code, $data) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);

// Ловушка для ботов: скрытое поле должно быть пустым. Боту отвечаем «успехом», письмо не шлём.
if (!empty($_POST['website'])) reply(200, ['ok' => true]);

if (!filter_var($TO, FILTER_VALIDATE_EMAIL)) reply(500, ['ok' => false, 'error' => 'recipient-not-configured']);

$data = [];
foreach ($FIELDS as $key => [$label, $required]) {
  $v = isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
  $v = mb_substr(str_replace("\0", '', $v), 0, 5000);
  if ($required && $v === '') reply(422, ['ok' => false, 'error' => 'required', 'field' => $key]);
  $data[$key] = $v;
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) reply(422, ['ok' => false, 'error' => 'email', 'field' => 'email']);

$body = '';
foreach ($FIELDS as $key => [$label]) {
  $body .= $label . ":\n" . ($data[$key] !== '' ? $data[$key] : '—') . "\n\n";
}
$body .= 'Отправлено: ' . date('d.m.Y H:i') . "\n";

$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
$host = preg_replace('/^www\./i', '', $host);
$headers = implode("\r\n", [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  'From: =?UTF-8?B?' . base64_encode('Сайт КБ Вектор') . '?= <noreply@' . $host . '>',
  'Reply-To: ' . $data['email'],
]);

$sent = mail($TO, '=?UTF-8?B?' . base64_encode($SUBJECT) . '?=', $body, $headers);
reply($sent ? 200 : 500, ['ok' => $sent]);
