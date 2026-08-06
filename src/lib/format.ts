export function formatPrice(amount: number) {
  const withDots = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots} FCFA`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function yesterdayOf(date: Date) {
  const y = new Date(date);
  y.setDate(date.getDate() - 1);
  return y;
}

/** Horodatage compact pour une ligne de la liste des discussions (heure, "Hier", ou date courte). */
export function formatDiscussionTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();

  if (isSameDay(date, now)) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (isSameDay(date, yesterdayOf(now))) return 'Hier';

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: date.getFullYear() === now.getFullYear() ? undefined : '2-digit',
  });
}

/** Étiquette de séparateur de date dans le fil de messages ("Aujourd'hui", "Hier", date complète). */
export function formatMessageDateSeparator(iso: string) {
  const date = new Date(iso);
  const now = new Date();

  if (isSameDay(date, now)) return "Aujourd'hui";
  if (isSameDay(date, yesterdayOf(now))) return 'Hier';

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

/** Heure d'une bulle de message ("14:32"). */
export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}