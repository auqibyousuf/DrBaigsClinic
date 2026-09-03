# WhatsApp / SMS Integration

This app sends patient notifications (booking confirmations, cancellations,
reschedules, follow-up bookings, billing notices, the daily digest, and
prescription PDFs) over WhatsApp via Twilio, falling back to SMS if WhatsApp
fails or isn't configured. Everything lives in `lib/notifications.ts`.

## How it works

- `sendWhatsAppOrSMS(phone, body)` — the general-purpose sender used for
  plain-text notifications. Tries WhatsApp first; only falls back to SMS if
  the WhatsApp send throws (never sends both, to avoid duplicate messages).
- `sendPrescriptionWhatsApp(phone, pdfUrl, doctorName)` — sends the actual
  prescription PDF as a WhatsApp media attachment (`mediaUrl`), with a
  text-message-plus-link fallback if WhatsApp fails.
- If Twilio isn't configured at all (`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`
  unset), every call logs a warning and returns silently — **a booking,
  prescription save, or bill creation always succeeds even if notifications
  aren't set up**. Nothing in the booking/prescription/billing flow depends
  on the notification actually sending.

### Where prescription-PDF-to-WhatsApp is wired up in the UI

- **Appointments → row → 3-dot menu → View Details**, inside the expanded
  panel, once a prescription exists: "Share on WhatsApp"
  (`components/admin/AppointmentDetailsPanel.tsx`).
- **Prescriptions → "Already Written" table → row → 3-dot menu**: "Send via
  WhatsApp" (`components/admin/PrescriptionsListView.tsx`). Hidden if the
  prescription has no PDF yet or the patient has no phone number on file.

Both call the same endpoint: `POST /api/prescriptions/[id]/share-whatsapp`.

## Setup

1. **Create a Twilio account** at [twilio.com](https://www.twilio.com) if you
   don't have one, and open the [Console](https://console.twilio.com).
2. **Get your Account SID and Auth Token** from the Console dashboard home
   page.
3. **Set up a WhatsApp sender**:
   - **For testing** — Twilio's WhatsApp Sandbox (Console → Messaging → Try it
     out → Send a WhatsApp message) gives you a shared sandbox number
     (commonly `+14155238886`) instantly, no approval needed. Each phone that
     wants to receive messages must first send the sandbox's join code
     (e.g. `join <word>-<word>`) to that number on WhatsApp — this is a
     one-time opt-in per phone number and only works for numbers that have
     done it. Fine for development, not for real patients.
   - **For production** — apply for a WhatsApp Business API sender through
     Twilio (Console → Messaging → Senders → WhatsApp senders). This requires
     Meta/WhatsApp Business verification and takes some time to approve;
     until it's approved, real patients can't receive messages this way.
4. **(Optional) Set up an SMS sender** — a regular Twilio phone number, used
   only as a fallback if the WhatsApp send fails. Buy one from Console →
   Phone Numbers, or skip this if you're fine with notifications silently
   not sending when WhatsApp fails.
5. **Add the environment variables** (see `.env.example`):

   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=+14155238886   # sandbox number, or your approved WhatsApp sender
   TWILIO_SMS_FROM=+1XXXXXXXXXX        # optional SMS fallback number
   ```

   In Vercel: Project Settings → Environment Variables. Locally: `.env.local`.

## ⚠️ Known gap: phone number format

Twilio requires phone numbers in **E.164 format** (`+<countrycode><number>`,
e.g. `+919596079069`). Patient phone numbers in this app are currently stored
exactly as entered at booking/walk-in time — usually a bare local number like
`9596079069`, with no country code and no `+`. There is no normalization step
anywhere in the codebase before a number is handed to Twilio.

**Practical effect**: WhatsApp/SMS sends will likely fail silently (caught,
logged, swallowed — per the "never block the real action" design above) for
any patient whose phone number doesn't already include a country code.

This hasn't been fixed as part of this pass — it needs a decision on the
correct default country code (or a country-code field in the booking/patient
forms) before it can be normalized safely. Worth prioritizing before relying
on notifications for a real patient base outside whatever country your
numbers happen to already be entered with a `+` prefix for.

## Testing

```bash
curl -X POST http://localhost:3000/api/prescriptions/<prescription-id>/share-whatsapp \
  -H "Cookie: cms-auth=<your dev token>"
```

Check the terminal running `yarn dev`/`yarn start` for
`WhatsApp send failed, falling back to SMS: ...` or
`Twilio not configured, skipping ...` — both are logged server-side, never
surfaced as an error to the admin (the toast will still say success, since
the underlying prescription/booking/bill action itself succeeded).
