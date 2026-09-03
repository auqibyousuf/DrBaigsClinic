# WhatsApp Integration

This app sends patient notifications (booking confirmations, cancellations,
reschedules, follow-up bookings, billing notices, the daily digest, and
prescription PDFs) over WhatsApp using **Meta's WhatsApp Cloud API directly**
— no BSP middleman (Twilio, Gupshup, etc.) and no per-message markup on top
of Meta's own conversation fee. Everything lives in `lib/notifications.ts`.

## Why every send uses a template

Every message this app sends is **business-initiated** — the patient never
messages us first through WhatsApp, they book through the website. Meta only
allows free-form text messages within a 24-hour window *after* the customer
messages the business; outside that window (which is always, for this app)
business-initiated messages are rejected unless sent as a **pre-approved
template**. That's why every function in `lib/notifications.ts` sends via
`sendWhatsAppTemplate(...)` — this is what makes delivery instant regardless
of whether the patient has ever messaged the clinic's WhatsApp number, the
same "arrives in no time" experience you get from other businesses' booking/
invoice bots.

**Sending status updates to a patient does *not* open that window either** —
the window only opens when the *patient* messages *you*, never the other way
around. So there's no way to shortcut template approval by sending more
notifications.

## Templates to create and submit

Create each of these in **Meta Business Suite → WhatsApp Manager → Message
Templates → Create Template**, category **Utility**, language **English**.
Approval is typically automated and takes minutes to a few hours. Once
approved, put the exact template name in the matching env var (see
`.env.example`) — the names below match the defaults already in
`.env.example`, so you can leave the names as-is when submitting.

Numbered placeholders (`{{1}}`, `{{2}}`, ...) are filled positionally by the
code — don't reorder them relative to what's described here.

---

**`appointment_confirmed`** — sent to the patient after booking
(`sendPatientConfirmation`)
> Hi {{1}}, your appointment with {{2}} at Dr Baig's Clinic is confirmed for {{3}} at {{4}}. Manage your booking: {{5}}. Your Patient ID is {{6}} — save this to view your visit history and prescriptions.

Sample values for the approval form: `Aisha Khan` / `Dr Aamir Yousuf` /
`12 Sep 2026` / `11:00 AM` / `https://drbaigsclinic.com/manage-appointment/abc123` / `DRB-4K9X2P`

---

**`appointment_admin_alert`** — sent to the doctor/clinic admin number on a
new booking (`sendAdminAlert`)
> New appointment: {{1}} ({{2}}) with {{3}} on {{4}} at {{5}}. Reason: {{6}}

Sample values: `Aisha Khan` / `9596079069` / `Dr Aamir Yousuf` / `12 Sep 2026`
/ `11:00 AM` / `Follow-up for acne treatment`

---

**`appointment_cancelled`** — sent to patient, doctor, and clinic on
cancellation (`sendAppointmentCancelled`)
> Your appointment with {{1}} on {{2}} at {{3}} has been cancelled.

Sample values: `Dr Aamir Yousuf` / `12 Sep 2026` / `11:00 AM`

---

**`appointment_rescheduled`** — sent to patient, doctor, and clinic on
reschedule (`sendAppointmentRescheduled`)
> Your appointment with {{1}} has been rescheduled to {{2}} at {{3}}.

Sample values: `Dr Aamir Yousuf` / `14 Sep 2026` / `4:00 PM`

---

**`prescription_ready`** — sent when a prescription PDF is shared
(`sendPrescriptionWhatsApp`). This one needs a **Document header** in
addition to the body (Meta's template builder → Header → Document) — the
actual PDF is attached at send time, the header itself just declares that
the template carries a document.
> Hi {{1}}, your prescription from {{2}} at Dr Baig's Clinic is ready. Please find it attached.

Sample values: `Aisha Khan` / `Dr Aamir Yousuf`. For the header sample, upload
any sample PDF when submitting for review.

---

**`invoice_ready`** — sent when a bill/invoice is created
(`sendInvoiceReady`)
> Hi {{1}}, your bill {{2}} from Dr Baig's Clinic is ready — Rs. {{3}}. {{4}} View: {{5}}

Sample values: `Aisha Khan` / `INV-0042` / `1500.00` / `Amount due: Rs. 500.00.`
/ `https://xxxxx.supabase.co/storage/v1/object/public/invoices/inv-0042.pdf`

---

**`daily_digest`** — sent to doctors/admin each morning
(`sendDailyDigest`, via the `/api/cron/daily-digest` cron)
> Today's appointments for {{1}}:
> {{2}}

Sample values: `Dr Aamir Yousuf` / `10:00 - Ravi Kumar (Follow-up)\n11:00 - Ayesha Khan (Consultation)`.
`{{2}}` carries the whole appointment list as one multi-line value — that's
expected, not a formatting bug.

## How it works

- `sendWhatsAppTemplate(to, templateName, bodyParams, headerDocument?)` — the
  one low-level sender every notification function goes through. Fills the
  template's `{{n}}` placeholders in order; `headerDocument` (a `{link,
  filename}`) attaches a PDF for templates with a document header.
- If the Cloud API isn't configured at all (`META_WA_TOKEN`/
  `META_WA_PHONE_NUMBER_ID` unset) or a given template's env var is unset,
  the call logs a warning and returns silently — **a booking, prescription
  save, or bill creation always succeeds even if notifications aren't set
  up**. Nothing in the booking/prescription/billing flow depends on the
  notification actually sending.
- **No SMS fallback.** Meta's Cloud API is WhatsApp-only. If a WhatsApp send
  fails (misconfigured, template not approved, API error), it's simply
  skipped and logged.
- The CMS's old "SMS/WhatsApp Templates" free-text editor (Admin → Contact)
  no longer changes what's actually sent — Meta templates are fixed text
  approved in advance, so per-clinic custom wording isn't possible without
  submitting a new template revision to Meta.

### Where prescription-PDF-to-WhatsApp is wired up in the UI

- **Appointments → row → 3-dot menu → View Details**, inside the expanded
  panel, once a prescription exists: "Share on WhatsApp"
  (`components/admin/AppointmentDetailsPanel.tsx`).
- **Prescriptions → "Already Written" table → row → 3-dot menu**: "Send via
  WhatsApp" (`components/admin/PrescriptionsListView.tsx`). Hidden if the
  prescription has no PDF yet or the patient has no phone number on file.

Both call the same endpoint: `POST /api/prescriptions/[id]/share-whatsapp`.

## Setup

1. **Create a Meta Business Account** at
   [business.facebook.com](https://business.facebook.com) if you don't have
   one, and a Meta developer app at
   [developers.facebook.com](https://developers.facebook.com/apps) with the
   **WhatsApp** product added.
2. **Register a WhatsApp Business phone number** in the app's WhatsApp →
   API Setup page. Meta gives you a **test number** immediately for
   development (messages only deliver to phone numbers you've explicitly
   added as testers on that page) — fine for development, not for real
   patients. For production, add and verify your own business phone number
   there instead.
3. **Get your Phone Number ID and a permanent access token**:
   - The Phone Number ID is shown on the WhatsApp → API Setup page next to
     the number you registered.
   - The token shown by default on that page is a **temporary 24-hour
     token** — for anything beyond quick testing, generate a permanent token
     instead: System Users (Meta Business Settings → Users → System Users) →
     create a system user → generate token with the `whatsapp_business_messaging`
     permission for your app.
4. **Create and submit the 7 templates above** for approval (see the exact
   text for each). Note the approved names for step 5.
5. **Add the environment variables** (see `.env.example`):

   ```
   META_WA_TOKEN=your_meta_permanent_access_token
   META_WA_PHONE_NUMBER_ID=your_meta_phone_number_id
   META_WA_TEMPLATE_APPOINTMENT_CONFIRMED=appointment_confirmed
   META_WA_TEMPLATE_ADMIN_ALERT=appointment_admin_alert
   META_WA_TEMPLATE_APPOINTMENT_CANCELLED=appointment_cancelled
   META_WA_TEMPLATE_APPOINTMENT_RESCHEDULED=appointment_rescheduled
   META_WA_TEMPLATE_PRESCRIPTION_READY=prescription_ready
   META_WA_TEMPLATE_INVOICE_READY=invoice_ready
   META_WA_TEMPLATE_DAILY_DIGEST=daily_digest
   ```

   In Vercel: Project Settings → Environment Variables. Locally: `.env.local`.
   You can set only the ones you need — each notification type independently
   skips (with a warning log) if its own template env var is unset.

## Cost

Meta charges per conversation (24-hour message window), billed to whoever
owns the phone number sending the message — there's no separate platform fee
for using the Cloud API directly. As of the pricing in effect when this was
written: roughly ₹0.115 per utility conversation (this covers every template
above — they're all category "Utility") in India (Meta prices by the
*recipient's* country code, not the sender's). Going through a BSP like
Twilio adds that provider's own per-message markup on top of these same Meta
fees; going direct (as this app now does) avoids that.

## ⚠️ Known gap: phone number format

The Cloud API expects phone numbers in **E.164 format** (no `+`, just
`<countrycode><number>`, e.g. `919596079069`). Patient phone numbers in this
app are currently stored exactly as entered at booking/walk-in time —
usually a bare local number like `9596079069`, with no country code. There is
no normalization step anywhere in the codebase before a number is handed to
the WhatsApp API.

**Practical effect**: WhatsApp sends will likely fail silently (caught,
logged, swallowed — per the "never block the real action" design above) for
any patient whose phone number doesn't already include a country code.

This hasn't been fixed as part of this pass — it needs a decision on the
correct default country code (or a country-code field in the booking/patient
forms) before it can be normalized safely. Worth prioritizing before relying
on notifications for a real patient base.

## Testing

```bash
curl -X POST http://localhost:3000/api/prescriptions/<prescription-id>/share-whatsapp \
  -H "Cookie: cms-auth=<your dev token>"
```

Check the terminal running `yarn dev`/`yarn start` for
`WhatsApp template "prescription_ready" send failed: ...` or
`WhatsApp Cloud API not configured, skipping ...` / `No template name
configured for this notification type, skipping.` — all logged server-side,
never surfaced as an error to the admin (the toast will still say success,
since the underlying prescription/booking/bill action itself succeeded).

Note: with only a Meta **test number** configured, sends will fail for any
phone that hasn't been added as a tester on the WhatsApp → API Setup page —
that's expected, not a bug. Likewise a send will fail until its template has
actually been approved (not just submitted).
