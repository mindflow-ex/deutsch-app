// Напоминания. Веб-уведомления по расписанию без сервера невозможны,
// поэтому основной вариант — ежедневное событие в календаре телефона (.ics).
export const notifySupported = () => 'Notification' in window && 'serviceWorker' in navigator;

export async function testNotification() {
  if (!notifySupported()) return 'Этот браузер не поддерживает уведомления.';
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return 'Уведомления запрещены. Разрешите их в настройках браузера.';
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification('Deutsch zu zweit', {
    body: 'Zeit für Deutsch! Урок дня ждёт 🙂',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'test'
  });
  return 'Отправили тестовое уведомление. Если оно появилось, уведомления работают.';
}

export function icsFile(time = '19:30') {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d < new Date()) d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  const local = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const url = location.href.split('#')[0];
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//deutsch-zu-zweit//RU',
    'BEGIN:VEVENT',
    `UID:deutsch-${Date.now()}@zu-zweit`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local}`,
    'DURATION:PT30M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Немецкий: урок дня',
    `DESCRIPTION:30 минут: повторение\\, новый урок\\, диалог. ${url}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Zeit für Deutsch!',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return new Blob([ics], { type: 'text/calendar;charset=utf-8' });
}

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
