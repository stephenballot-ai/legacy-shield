import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = `${process.env.EMAIL_FROM_NAME || 'LegacyShield'} <${process.env.EMAIL_FROM || 'noreply@legacyshield.eu'}>`;
const APP_URL = process.env.APP_URL || 'https://legacyshield.eu';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email:', params.subject, '→', params.to);
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text ? { text: params.text } : {}),
    });
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err);
    return false;
  }
}

// ============================================================================
// EMERGENCY CONTACT NOTIFICATION
// ============================================================================

export async function sendEmergencyContactNotification(params: {
  contactEmail: string;
  contactName: string;
  ownerName: string;
}) {
  const { contactEmail, contactName, ownerName } = params;

  return sendEmail({
    to: contactEmail,
    subject: `${ownerName} has named you as an emergency contact on LegacyShield`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">🛡️ LegacyShield</h1>
        </div>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Hi ${contactName},
        </p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          <strong>${ownerName}</strong> has named you as a trusted emergency contact on LegacyShield — a secure, encrypted document vault.
        </p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          This means that if ${ownerName} ever becomes unable to access their account, or in case of an emergency, you can retrieve their important documents.
        </p>

        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">
            What you need to know:
          </p>
          <ul style="font-size: 14px; color: #4B5563; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>${ownerName}</strong> will share an <strong>unlock phrase</strong> with you — keep it safe.</li>
            <li>When the time comes, visit <a href="${APP_URL}/emergency-portal" style="color: #2563EB;">${APP_URL}/emergency-portal</a></li>
            <li>Enter ${ownerName}&apos;s email and the unlock phrase to access their vault.</li>
            <li>Access is <strong>read-only</strong> — documents can be viewed and downloaded but not modified.</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #6B7280; line-height: 1.6;">
          You don&apos;t need to create an account or do anything right now. Just keep the unlock phrase safe for when it&apos;s needed.
        </p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

        <p style="font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.6;">
          LegacyShield uses zero-knowledge encryption. We cannot access anyone&apos;s documents — only you, with the unlock phrase, can.<br />
          🇪🇺 100% European-owned infrastructure.
        </p>
      </div>
    `,
    text: `Hi ${contactName},

${ownerName} has named you as a trusted emergency contact on LegacyShield — a secure, encrypted document vault.

If ${ownerName} ever becomes unable to access their account, you can retrieve their important documents.

What you need to know:
- ${ownerName} will share an unlock phrase with you — keep it safe.
- When the time comes, visit ${APP_URL}/emergency-portal
- Enter ${ownerName}'s email and the unlock phrase to access their vault.
- Access is read-only — documents can be viewed and downloaded but not modified.

You don't need to create an account or do anything right now. Just keep the unlock phrase safe for when it's needed.

— LegacyShield (100% European-owned infrastructure, zero-knowledge encryption)`,
  });
}

// ============================================================================
// VAULT ACCESS NOTIFICATION (to owner)
// ============================================================================

export async function sendVaultAccessNotification(params: {
  ownerEmail: string;
  accessIp?: string;
  accessDate: Date;
}) {
  const { ownerEmail, accessIp, accessDate } = params;
  const dateStr = accessDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return sendEmail({
    to: ownerEmail,
    subject: 'Your LegacyShield vault was accessed via emergency portal',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">🛡️ LegacyShield</h1>
        </div>

        <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 16px; font-weight: 600; color: #92400E; margin: 0 0 8px 0;">
            ⚠️ Emergency vault access detected
          </p>
          <p style="font-size: 14px; color: #92400E; margin: 0;">
            Someone accessed your vault using your emergency unlock phrase.
          </p>
        </div>

        <div style="font-size: 14px; color: #374151; line-height: 1.8;">
          <p><strong>When:</strong> ${dateStr}</p>
          ${accessIp ? `<p><strong>IP Address:</strong> ${accessIp}</p>` : ''}
        </div>

        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-top: 16px;">
          If this was expected, no action is needed. If you did not authorize this access,
          log in immediately and change your unlock phrase in Settings → Emergency Access.
        </p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
          🇪🇺 LegacyShield · Zero-Knowledge Encryption · European-owned infrastructure
        </p>
      </div>
    `,
    text: `⚠️ Emergency vault access detected

Someone accessed your LegacyShield vault using your emergency unlock phrase.

When: ${dateStr}
${accessIp ? `IP Address: ${accessIp}` : ''}

If this was expected, no action is needed. If you did not authorize this access, log in immediately and change your unlock phrase.

— LegacyShield`,
  });
}

// ============================================================================
// WELCOME CHECKLIST EMAIL
// ============================================================================

export async function sendWelcomeChecklistEmail(params: {
  ownerEmail: string;
}) {
  const { ownerEmail } = params;

  return sendEmail({
    to: ownerEmail,
    subject: '🛡️ 5 documents every family needs (and how to secure them)',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">🛡️ LegacyShield</h1>
        </div>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Welcome to LegacyShield.
        </p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Most people know they need to protect their documents, but few know <em>which</em> ones are truly critical for their loved ones in an emergency.
        </p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Here are the 5 most essential documents you should secure in your vault today:
        </p>

        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <ul style="font-size: 15px; color: #4B5563; line-height: 1.8; margin: 0; padding-left: 0; list-style-type: none;">
            <li style="margin-bottom: 16px;">
              <strong style="color: #111827;">1. Will & Trust Documents</strong><br />
              The foundation of your estate. It dictates who gets what and who is in charge.
            </li>
            <li style="margin-bottom: 16px;">
              <strong style="color: #111827;">2. Passport / ID</strong><br />
              A digital backup of your primary identification — essential for any legal process.
            </li>
            <li style="margin-bottom: 16px;">
              <strong style="color: #111827;">3. Life Insurance Policies</strong><br />
              Ensures your family has immediate access to funds for expenses without waiting for probate.
            </li>
            <li style="margin-bottom: 16px;">
              <strong style="color: #111827;">4. Online Accounts Summary</strong><br />
              A list of your key online accounts (email, social media, subscriptions) so nothing is locked away forever.
            </li>
            <li style="margin-bottom: 0;">
              <strong style="color: #111827;">5. Financial Overview</strong><br />
              A map of your banks, pensions, investments, and debts so nothing is lost or forgotten.
            </li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${APP_URL}/dashboard" style="background-color: #C9A84C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Upload Your First Document
          </a>
        </div>

        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin-top: 32px; text-align: center;">
          Remember: LegacyShield uses zero-knowledge encryption. Only you (and your designated emergency contacts) can ever see these files.
        </p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
          🇪🇺 LegacyShield · European-owned infrastructure · Secure by design
        </p>
      </div>
    `,
    text: `Welcome to LegacyShield.\n\nHere are the 5 most essential documents every family needs:\n\n1. Will & Trust Documents\n2. Passport / ID\n3. Life Insurance Policies\n4. Online Accounts Summary\n5. Financial Overview\n\nUpload your first document now: ${APP_URL}/dashboard\n\nLegacyShield (100% European-owned infrastructure, zero-knowledge encryption)`,
  });
}

