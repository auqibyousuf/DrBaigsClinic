// Sends patient/admin notifications over WhatsApp using Meta's WhatsApp
// Cloud API directly (no BSP middleman/markup like Twilio). See
// WHATSAPP_SETUP.md — every send here goes through an approved message
// template, because business-initiated messages (which is everything this
// app sends — confirmations, updates, PDFs) are rejected by Meta outside a
// 24-hour window unless they use a template, and this app has no way to
// guarantee a patient messaged us first.

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

// Sends a pre-approved template message — required for every message this
// app sends, since they're all business-initiated (see file header). `body`
// fills the template's numbered {{1}}, {{2}}, ... placeholders in order.
// `headerDocument` attaches a PDF via the template's document header, for
// templates that declare one (e.g. prescription_ready). Never throws: a
// booking/prescription/billing action must succeed even if notifications
// aren't configured or the send fails.
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string | undefined,
  body: string[],
  headerDocument?: { link: string; filename: string }
): Promise<void> {
  const config = getWaConfig();
  if (!config) {
    console.warn('WhatsApp Cloud API not configured, skipping notification.');
    return;
  }
  if (!templateName) {
    console.warn('No template name configured for this notification type, skipping.');
    return;
  }

  const components: Record<string, unknown>[] = [];
  if (headerDocument) {
    components.push({
      type: 'header',
      parameters: [{ type: 'document', document: { link: headerDocument.link, filename: headerDocument.filename } }],
    });
  }
  if (body.length) {
    components.push({ type: 'body', parameters: body.map((text) => ({ type: 'text', text: text || '-' })) });
  }

  try {
    await callGraphApi(config.phoneNumberId, config.token, {
      to,
      type: 'template',
      template: { name: templateName, language: { code: 'en' }, components },
    });
  } catch (err) {
    console.error(`WhatsApp template "${templateName}" send failed:`, err);
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
  // No longer used for the actual message — Meta templates are fixed text
  // approved in advance, so the CMS's "SMS/WhatsApp Templates" free-text
  // editor can't change what's actually sent anymore. Kept optional here so
  // existing callers that still pass these don't need changes; see
  // WHATSAPP_SETUP.md.
  patientSmsTemplate?: string;
  adminSmsTemplate?: string;
}

// Template: appointment_confirmed — see WHATSAPP_SETUP.md for the exact body
// text to submit in Meta's WhatsApp Manager.
export async function sendPatientConfirmation(input: BookingNotificationInput): Promise<void> {
  await sendWhatsAppTemplate(input.patientPhone, process.env.META_WA_TEMPLATE_APPOINTMENT_CONFIRMED, [
    input.patientName,
    input.doctorName,
    input.date,
    input.slot,
    input.manageLink,
    input.patientCode || 'N/A',
  ]);
}

// Template: appointment_admin_alert
export async function sendAdminAlert(input: BookingNotificationInput): Promise<void> {
  const targets = [input.adminPhone, input.doctorPhone].filter((p): p is string => !!p);
  await Promise.all(
    targets.map((phone) =>
      sendWhatsAppTemplate(phone, process.env.META_WA_TEMPLATE_ADMIN_ALERT, [
        input.patientName,
        input.patientPhone,
        input.doctorName,
        input.date,
        input.slot,
        input.reason,
      ])
    )
  );
}

// Template: appointment_cancelled
export async function sendAppointmentCancelled(
  phone: string,
  doctorName: string,
  date: string,
  slot: string
): Promise<void> {
  await sendWhatsAppTemplate(phone, process.env.META_WA_TEMPLATE_APPOINTMENT_CANCELLED, [doctorName, date, slot]);
}

// Template: appointment_rescheduled
export async function sendAppointmentRescheduled(
  phone: string,
  doctorName: string,
  date: string,
  slot: string
): Promise<void> {
  await sendWhatsAppTemplate(phone, process.env.META_WA_TEMPLATE_APPOINTMENT_RESCHEDULED, [doctorName, date, slot]);
}

// Template: invoice_ready
export async function sendInvoiceReady(
  phone: string,
  patientName: string,
  invoiceNumber: string,
  totalPayable: string,
  dueLine: string,
  pdfUrl: string
): Promise<void> {
  await sendWhatsAppTemplate(phone, process.env.META_WA_TEMPLATE_INVOICE_READY, [
    patientName,
    invoiceNumber,
    totalPayable,
    dueLine,
    pdfUrl,
  ]);
}

// Template: daily_digest
export async function sendDailyDigest(phone: string, recipientLabel: string, lines: string[]): Promise<void> {
  await sendWhatsAppTemplate(phone, process.env.META_WA_TEMPLATE_DAILY_DIGEST, [recipientLabel, lines.join('\n')]);
}

// Template: prescription_ready (document header carries the PDF)
export async function sendPrescriptionWhatsApp(
  phone: string,
  pdfUrl: string,
  doctorName: string
): Promise<void> {
  await sendWhatsAppTemplate(
    phone,
    process.env.META_WA_TEMPLATE_PRESCRIPTION_READY,
    [doctorName],
    { link: pdfUrl, filename: 'prescription.pdf' }
  );
}
