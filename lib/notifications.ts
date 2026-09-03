// Sends patient/admin notifications over WhatsApp via Meta's WhatsApp Cloud
// API directly (no BSP middleman/markup like Twilio). See WHATSAPP_SETUP.md.

const GRAPH_VERSION = 'v20.0';

function getWaConfig() {
  const token = process.env.META_WA_TOKEN;
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId };
}

async function callGraphApi(phoneNumberId: string, token: string, payload: Record<string, unknown>) {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`WhatsApp Cloud API error ${res.status}: ${detail}`);
  }
}

// Sends a free-form text WhatsApp message. Only deliverable within Meta's
// 24-hour customer-service window (i.e. the patient messaged us recently);
// outside that window Meta silently rejects it, which is why the booking
// flow instead sends a pre-approved template (see sendWhatsAppTemplate).
// Never throws: a booking must succeed even if notifications aren't
// configured or the send fails.
export async function sendWhatsAppOrSMS(to: string, body: string): Promise<void> {
  const config = getWaConfig();
  if (!config) {
    console.warn('WhatsApp Cloud API not configured, skipping notification.');
    return;
  }

  try {
    await callGraphApi(config.phoneNumberId, config.token, {
      to,
      type: 'text',
      text: { body },
    });
  } catch (err) {
    console.error('WhatsApp send failed:', err);
  }
}

// Sends a pre-approved template message — required for any business-initiated
// message outside the 24-hour customer-service window (Meta rejects free-form
// text otherwise). `params` fill the template's numbered {{1}}, {{2}}, ...
// placeholders in order. Never throws, same reasoning as sendWhatsAppOrSMS.
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
): Promise<void> {
  const config = getWaConfig();
  if (!config) {
    console.warn('WhatsApp Cloud API not configured, skipping template notification.');
    return;
  }

  try {
    await callGraphApi(config.phoneNumberId, config.token, {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: params.length
          ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }]
          : undefined,
      },
    });
  } catch (err) {
    console.error('WhatsApp template send failed:', err);
  }
}

interface BookingNotificationInput {
  patientName: string;
  patientPhone: string;
  patientCode?: string;
  doctorName: string;
  doctorPhone?: string;
  doctorEmail?: string;
  date: string;
  slot: string;
  reason: string;
  manageLink: string;
  adminPhone?: string;
  // CMS-configurable overrides (Admin → Contact → SMS/WhatsApp Templates).
  // Falls back to the built-in default text below when unset.
  patientSmsTemplate?: string;
  adminSmsTemplate?: string;
}

// Same {placeholder} syntax as the email templates (app/api/appointment/route.ts)
// so admins only have to learn one substitution syntax across every channel.
export function fillNotificationTemplate(template: string, input: BookingNotificationInput): string {
  return template
    .replace(/{name}/g, input.patientName)
    .replace(/{phone}/g, input.patientPhone)
    .replace(/{patientId}/g, input.patientCode || '')
    .replace(/{doctor}/g, input.doctorName)
    .replace(/{date}/g, input.date)
    .replace(/{time}/g, input.slot)
    .replace(/{reason}/g, input.reason)
    .replace(/{manageLink}/g, input.manageLink);
}

const DEFAULT_PATIENT_SMS_TEMPLATE =
  "Hi {name}, your appointment with {doctor} at Dr Baig's Clinic is confirmed for {date} at {time}. " +
  'Manage your booking: {manageLink}';

const DEFAULT_ADMIN_SMS_TEMPLATE =
  'New appointment: {name} ({phone}) with {doctor} on {date} at {time}. Reason: {reason}';

export async function sendPatientConfirmation(input: BookingNotificationInput): Promise<void> {
  let body = fillNotificationTemplate(input.patientSmsTemplate || DEFAULT_PATIENT_SMS_TEMPLATE, input);
  if (input.patientCode && !input.patientSmsTemplate) {
    body += `\n\nYour Patient ID is ${input.patientCode} — save this to view your visit history and prescriptions.`;
  }
  await sendWhatsAppOrSMS(input.patientPhone, body);
}

export async function sendAdminAlert(input: BookingNotificationInput): Promise<void> {
  const body = fillNotificationTemplate(input.adminSmsTemplate || DEFAULT_ADMIN_SMS_TEMPLATE, input);
  const targets = [input.adminPhone, input.doctorPhone].filter((p): p is string => !!p);
  await Promise.all(targets.map((phone) => sendWhatsAppOrSMS(phone, body)));
}

export async function sendUpdateNotification(
  phone: string,
  message: string
): Promise<void> {
  await sendWhatsAppOrSMS(phone, message);
}

export async function sendDailyDigest(phone: string, lines: string[]): Promise<void> {
  const body = `Today's appointments:\n${lines.join('\n')}`;
  await sendWhatsAppOrSMS(phone, body);
}

// Sends the prescription PDF as a WhatsApp document message (falls back to a
// plain text message with the link if the Cloud API isn't configured or the
// send fails).
export async function sendPrescriptionWhatsApp(
  phone: string,
  pdfUrl: string,
  doctorName: string
): Promise<void> {
  const config = getWaConfig();
  const body = `Your prescription from ${doctorName} at Dr Baig's Clinic is ready.`;

  if (config) {
    try {
      await callGraphApi(config.phoneNumberId, config.token, {
        to: phone,
        type: 'document',
        document: { link: pdfUrl, caption: body, filename: 'prescription.pdf' },
      });
      return;
    } catch (err) {
      console.error('WhatsApp prescription share failed, falling back to text with link:', err);
    }
  }

  await sendWhatsAppOrSMS(phone, `${body} Download it here: ${pdfUrl}`);
}
