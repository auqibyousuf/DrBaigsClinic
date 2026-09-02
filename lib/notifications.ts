import twilio from 'twilio';

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !authToken) {
    return null;
  }
  return twilio(sid, authToken);
}

// Sends WhatsApp first, falls back to SMS only if WhatsApp fails — never both,
// to avoid duplicate-message noise. Never throws: a booking must succeed even
// if notifications aren't configured or the send fails.
export async function sendWhatsAppOrSMS(to: string, body: string): Promise<void> {
  const client = getTwilioClient();
  if (!client) {
    console.warn('Twilio not configured, skipping WhatsApp/SMS notification.');
    return;
  }

  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  const smsFrom = process.env.TWILIO_SMS_FROM;

  if (whatsappFrom) {
    try {
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:${to}`,
        body,
      });
      return;
    } catch (err) {
      console.error('WhatsApp send failed, falling back to SMS:', err);
    }
  }

  if (smsFrom) {
    try {
      await client.messages.create({ from: smsFrom, to, body });
    } catch (err) {
      console.error('SMS send failed:', err);
    }
  } else {
    console.warn('No TWILIO_SMS_FROM configured, could not fall back to SMS.');
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

// Sends the prescription PDF as a WhatsApp media message (falls back to a
// plain text message with the link if WhatsApp isn't configured).
export async function sendPrescriptionWhatsApp(
  phone: string,
  pdfUrl: string,
  doctorName: string
): Promise<void> {
  const client = getTwilioClient();
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  const body = `Your prescription from ${doctorName} at Dr Baig's Clinic is ready.`;

  if (client && whatsappFrom) {
    try {
      await client.messages.create({
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:${phone}`,
        body,
        mediaUrl: [pdfUrl],
      });
      return;
    } catch (err) {
      console.error('WhatsApp prescription share failed, falling back to text with link:', err);
    }
  }

  await sendWhatsAppOrSMS(phone, `${body} Download it here: ${pdfUrl}`);
}
