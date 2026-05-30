const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

// Domains we won't allow at signup time. Combines known abuse clusters
// observed in production with common disposable / temp-mail services.
// Extend freely — keep sorted to make diffs readable.
const BLOCKED_DOMAINS = new Set<string>([
  '10minutemail.com',
  'a7gi.ru',
  'a7goldinvest.ru',
  'dropmail.me',
  'fakeinbox.com',
  'getnada.com',
  'guerrillamail.biz',
  'guerrillamail.com',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'maildrop.cc',
  'mailinator.com',
  'mintemail.com',
  'sharklasers.com',
  'temp-mail.org',
  'tempmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
]);

/**
 * Lowercase, trim, drop +suffix, and (for gmail/googlemail) strip dots and
 * collapse googlemail.com → gmail.com. Returns a stable canonical form
 * suitable for uniqueness checks and as the stored value.
 *
 * Why: gmail famously ignores dots in the local part, so dot permutations
 * (alice@gmail.com vs a.l.i.c.e@gmail.com) all route to one inbox.
 * Treating them as distinct accounts lets a single attacker mint unlimited
 * signups against one real victim's inbox.
 */
export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at === -1) return trimmed;

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);

  const plus = local.indexOf('+');
  if (plus !== -1) local = local.slice(0, plus);

  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }

  return `${local}@${domain}`;
}

export function emailDomain(email: string): string {
  const at = email.lastIndexOf('@');
  return at === -1 ? '' : email.slice(at + 1).toLowerCase();
}

export function isBlockedEmailDomain(email: string): boolean {
  return BLOCKED_DOMAINS.has(emailDomain(email));
}
