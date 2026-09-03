# WhatsApp Integration

This app sends patient notifications (booking confirmations, cancellations,
reschedules, follow-up bookings, billing notices, the daily digest, and
prescription PDFs) over WhatsApp using **Meta's WhatsApp Cloud API directly**
— no BSP middleman (Twilio, Gupshup, etc.) and no per-message markup on top
of Meta's own conversation fee. Everything lives in `lib/notifications.ts`.

## How it works

- `sendWhatsAppOrSMS(phone, body)` — sends a free-form text WhatsApp message.
  Only deliverable within Meta's 24-hour customer-service window (i.e. the
  patient messaged this number recently); outside that window Meta silently
  rejects it.
- `sendWhatsAppTemplate(phone, templateName, params)` — sends a pre-approved
  template message. Required for any business-initiated message outside the
  24-hour window (e.g. the first message to a brand-new patient), since Meta
  rejects free-form text in that case. `params` fill the template's
  `{{1}}`, `{{2}}`, ... placeholders in order.
- `sendPrescriptionWhatsApp(phone, pdfUrl, doctorName)` — sends the actual
  prescription PDF as a WhatsApp document message, with a text-message-plus-link
  fallback if the send fails.
- If the Cloud API isn't configured at all (`META_WA_TOKEN`/
  `META_WA_PHONE_NUMBER_ID` unset), every call logs a warning and returns
  silently — **a booking, prescription save, or bill creation always succeeds
  even if notifications aren't set up**. Nothing in the booking/prescription/
  billing flow depends on the notification actually sending.
- **No SMS fallback.** Twilio bundled SMS as a fallback channel; Meta's Cloud
  API is WhatsApp-only. If a message can't be delivered over WhatsApp (not
  configured, outside the 24-hour window for free-form text, send error), it
  is simply skipped and logged — same "never block the real action" behavior
  as before, just without a second channel.

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
4. **Create and get approval for a message template** — required for any
   business-initiated message sent outside a 24-hour customer-service window
   (e.g. the appointment-confirmation and prescription-ready notifications,
   since the patient hasn't just messaged you first). WhatsApp Manager →
   Message Templates → Create Template, category "Utility", with a body like:

   ```
   Your appointment with {{1}} at Dr Baig's Clinic is confirmed for {{2}} at {{3}}.
   ```

   Approval is usually automated and takes minutes to a few hours; note the
   exact template name once approved for `META_WA_TEMPLATE_NAME` below.
5. **Add the environment variables** (see `.env.example`):

   ```
   META_WA_TOKEN=your_meta_permanent_access_token
   META_WA_PHONE_NUMBER_ID=your_meta_phone_number_id
   META_WA_TEMPLATE_NAME=your_approved_template_name
   ```

   In Vercel: Project Settings → Environment Variables. Locally: `.env.local`.

## Cost

Meta charges per conversation (24-hour message window), billed to whoever
owns the phone number sending the message — there's no separate platform fee
for using the Cloud API directly. As of the pricing in effect when this was
written: roughly ₹0.115 per utility/authentication conversation and ₹0.78 per
marketing conversation in India (Meta prices by the *recipient's* country
code, not the sender's). Service conversations — replies within 24 hours of
the patient messaging first — are free, with 1,000/month included. Going
through a BSP like Twilio adds that provider's own per-message markup on top
of these same Meta fees; going direct (as this app now does) avoids that.

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
`WhatsApp prescription share failed, falling back to text with link: ...` or
`WhatsApp Cloud API not configured, skipping ...` — both are logged
server-side, never surfaced as an error to the admin (the toast will still
say success, since the underlying prescription/booking/bill action itself
succeeded).

Note: with only a Meta **test number** configured, sends will fail for any
phone that hasn't been added as a tester on the WhatsApp → API Setup page —
that's expected, not a bug.
