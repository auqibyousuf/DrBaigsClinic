# Medisray Competitive Audit — Findings, Gaps & Build Plan

Audit of `app.medisray.com` (Dr Baigs Clinic's account) against our current DrBaigsClinic admin/booking system. Two passes: an initial walkthrough of the main screens, then a full **end-to-end dry run** — created a real walk-in patient from scratch, ran them through the entire consultation (all modules), generated a prescription, created a GST invoice, and separately configured a real recurring weekly schedule and booked a slot through the confirm-appointment dialog — to make sure nothing was assumed rather than observed.

Roles applied per finding, matching the convention from the earlier design/patient-history plan: **Product Manager** (what/why), **Principal Backend/DB Architect** (data model), **Design System Architect** (UI pattern), **Security Architect** (auth/access), **Notification Engagement Architect** (comms). Each gap below states the finding, why it matters, and the concrete change to make in our codebase.

---

## 1. Consultation workflow is a live queue, not just a calendar of appointments

**Finding:** Medisray's Appointments page has three tabs — `Queue(n)` / `Finished(n)` / `Cancelled(n)` — plus a standalone **"Start Walk-in Consultation"** button that bypasses booking entirely (search-or-create patient → straight into the consultation screen). Booked appointments and walk-ins both land in the same queue.

**Confirmed end-to-end (new patient → consult → finish):** Created a brand-new patient through the walk-in flow's "+ Add New Patient" (`returnTo=/walk-in-consultation` — same add-patient form as the Patients section, just contextual return). On submit it auto-returned to the walk-in screen with that patient pre-selected and a "Consult" button. Clicking Consult navigated to `/digital-rx/?patientId=375&appointmentId=739&doctorId=250&clinicId=253&...` — **a walk-in silently creates a real `appointmentId` behind the scenes**, it isn't a separate "no appointment" code path. So Medisray's data model has exactly one `appointments` concept; "walk-in" is just "an appointment created and consulted in the same motion," not a structurally different entity.

**Why it matters (PM):** Our system only models *scheduled* appointments (`appointments` table, `confirmed`/`cancelled`). There's no notion of "patient is physically in the clinic right now" vs "patient has a future booking." A real clinic gets walk-ins constantly and needs a live front-desk queue, not just a date-sorted list. Medisray's approach — walk-in = instantly-created-and-entered appointment, not a separate concept — is the simpler, more directly portable model for us to copy.

**1a. How a pre-booked appointment enters the queue when its time comes (confirmed by directly testing this, since it's the natural follow-up question):** Booked a real slot (Sat 5th Sep, 12:00–12:30 PM, patient "Tam") through "Add New Appointment," then opened the Queue tab with the date filter set to "Next 7 days." The booking appeared as an ordinary Queue row: **S No. / Name / Contact / Visit Type ("New") / Slot (date + time range) / an "Unbilled" status badge / a "Consult" action button.** Critically: **there is no time-gating** — clicking "Consult" on that Saturday appointment worked immediately even though it was still Thursday (the appointment's slot time hadn't arrived yet). Medisray's "Queue" is simply "every not-yet-finished appointment in the selected date range," filtered by the date-range picker (Today/Tomorrow/Next 7 days/etc. — see finding below); a receptionist/doctor manually clicks Consult whenever the patient is actually ready to be seen, and the app never auto-transitions anything based on the clock. So "the appointment queue for booked patients" isn't a separate mechanic from walk-ins at all — it's the exact same Queue tab, just populated by a scheduled booking instead of an on-the-spot one.

**Also confirmed:** the date-range filter itself is a full preset+custom picker — **Till Date, Today, Tomorrow, Next 7/15/30 days, Last 7/15/30 days, Custom range** — which is how staff would normally view "today's queue" vs. look ahead at upcoming bookings.

**Build implication for us:** this simplifies #1's build — we don't need a separate "walk-in vs booked" state machine. One `appointments` table with a `status` (`queued/finished/cancelled`) and the existing `appointment_date`/`slot_start` columns, filtered by a date-range control on the admin Appointments view, gets us the same behavior: a booked appointment shows up in the queue as soon as it's created (regardless of date), and staff click "Consult"/"Start Consultation" on it whenever the patient is actually there — no clock-based gating logic to write. The only genuinely new UI is the date-range filter dropdown (cheap — a preset list + a custom range picker) replacing whatever ad hoc date logic `AppointmentsView.tsx` has today.

**Gap in our app:** `lib/appointments.ts` has no `status` value for "in progress"/"queued"; `AppointmentsView` and `AppointmentDetailsPanel` render everything as one flat table grouped by date, not a queue.

**Build (Backend/DB Architect):**
- Add `status` values: `queued | in_consultation | finished | cancelled` (extend the existing `confirmed`/`cancelled` enum on `appointments`).
- Add `POST /api/appointment/walk-in` (admin-only) that creates-or-finds a patient by phone and inserts a `queued` appointment with `appointment_date = today`, no pre-picked slot.
- Add `PATCH /api/appointment/admin/[id]/status` to move an appointment through the queue states.

**Build (Design System Architect):** Replace the current single-table `AppointmentsView` with three tab counts (Queue/Finished/Cancelled) mirroring Medisray's pattern, plus a prominent "Start Walk-in Consultation" button next to "Add Appointment."

---

## 2. Digital Rx: a modular consultation screen, not a flat prescription form

**Finding:** Medisray's `/digital-rx/` screen (opened via "Consult") has independent, add-as-you-go sections: **Symptoms, Examinations, Diagnosis, Medications, Investigation, Advices, Follow-up, Notes**, plus four *additional* optional modules listed in a left sidebar — **Vitals & Body Composition, Medical History, Private Notes, Medical Records** — each added via its own "+ Add" and capped at **15 modules total** per visit ("0/15 modules added"). A "Customize" button (top-right) implies doctors can configure which modules appear by default. Every core field (Symptoms, Diagnosis, Medications, Investigation) is a **search-autocomplete with an "Add Custom '<query>'" fallback**.

**Clarifying the autocomplete data source (confirmed by direct testing, not assumption):** created a brand-new "Test Walkin Patient" and typed into every field cold:
- **Symptoms/Diagnosis/Examinations/Advices**: typing "Headache" surfaced "Headache"/"Headaches" suggestions on a patient who had never been consulted before — so there **is** some baseline suggestion list behind these (not purely this-clinic-history as first assumed), though it still allows free-text "Add Custom" for anything not listed. Treat as "curated common-term suggestions + freeform fallback," not a strict medical ontology.
- **Medications**: typing "Para" returned real formal drug names with dosage/strength combinations (e.g. "Acecpara SP 100mg/325mg/15mg Tablet", "Acelopara MR 100mg/325mg/250mg Tablet") — this is unambiguously a **real structured drug database** (brand + strength + form), not user-typed history. Materially different from the other fields.
- **Medical History sub-sections** (see below) ship with an actual **curated master list** of common entries per category — this is the strongest evidence of built-in reference data anywhere in the app.

**Vitals & Body Composition module** (new finding): a dated table — Temperature (°F), Pulse (/min), Resp. Rate (/min), Systolic/Diastolic (mmHg), SPO2 (%), General RBS (mg/dl) — with an "Add New Date" action to track vitals across multiple visits over time.

**Medical History module** (new finding, the richest single screen found): five sub-sections — **Medical Condition, Allergies, Family History, Lifestyle, Surgical History** — each rendered as a grid of quick-toggle chips from a **curated list** (e.g. Medical Condition: Rheumatoid Arthritis, CABG (Coronary), Arthroplasty, Osteoarthritis, Fractures, ACL Reconstruction, THA, Lower back pain; Allergies: Nuts, Mustard, Gluten, Peanuts, Milk, Soya, Fish, Eggs), each with a `+`/`−` toggle to add/remove, a "No known history" checkbox per section, and an "Edit & Add" for custom entries beyond the preset list.

**Private Notes module** (new finding): explicitly "This note will only be visible to you and will not be printed. And you will be able to see in Patient Details" — a doctor-only internal note, deliberately excluded from the patient-facing prescription document.

**Follow-up** has quick-pick chips (**2 Days / 2 Weeks / 2 Months**) plus free text and a calendar picker, alongside a separate "Additional Notes" box (patient-facing, unlike Private Notes).

**Why it matters (PM):** Our `PrescriptionEditor.tsx` is a single "diagnosis textarea + medication rows (name/dosage/frequency/duration)" form. It's functionally fine for medications but has no symptoms, examinations, investigations, vitals, medical history, or follow-up scheduling — the doctor can't build a complete clinical note in one place, only a prescription.

**Gap in our app:** `lib/prescriptions.ts`'s `medications jsonb` schema only models drugs. There's no `symptoms`, `examinations`, `investigations`, `advices`, `vitals`, `medical_history`, `private_notes`, or `follow_up_date` column, and no autocomplete-tag or curated-chip input components.

**Build (Backend/DB Architect):**
- Extend the `prescriptions` table: add `symptoms jsonb`, `examinations jsonb`, `investigations jsonb`, `advices jsonb`, `follow_up_date date`, `additional_notes text`, `private_notes text` (doctor-only, never rendered into the PDF), `vitals jsonb` (`{temperature, pulse, resp_rate, systolic, diastolic, spo2, rbs, recorded_at}[]` — an array so multiple readings per visit/over time are possible), keeping `medications jsonb` as-is.
- **Medications**: since ours is a much smaller clinic app, a full national drug database is disproportionate scope — instead seed a `medication_options` table with the doctor's/clinic's commonly prescribed drugs (a few dozen, entered once by the admin) plus free-text "Add Custom" fallback, rather than trying to replicate a pharmacy-grade formulary.
- **Symptoms/Diagnosis/Examinations/Investigation/Advices/Medical History**: one shared `clinical_terms` table (`id, doctor_id, category, value, is_preset, use_count`), pre-seeded with a small sensible starter list per category (mirroring Medisray's presets — common symptoms, allergies, family-history conditions, lifestyle factors, surgical history) and growing from "Add Custom" entries thereafter, ordered by `use_count`.

**Build (Design System Architect):**
- New `components/admin/AutocompleteTagInput.tsx` — a reusable "search-or-add" input (type → see matching presets/past entries → click one or click "Add custom '<query>'"), used for Symptoms/Examinations/Diagnosis/Investigation/Advices.
- New `components/admin/ChipToggleGroup.tsx` — the Medical-History pattern (grid of preset chips with `+`/`−` toggle + "No known history" checkbox + "Edit & Add" custom entry) — reusable across Medical Condition/Allergies/Family History/Lifestyle/Surgical History.
- New `components/admin/VitalsPanel.tsx` — the dated vitals table.
- Rework `PrescriptionEditor.tsx` into a modular, add-as-you-go layout (core sections always present; Vitals/Medical History/Private Notes as optional "+ Add" modules), replacing the flat medication-rows-only form.
- Follow-up section: quick-pick chips (2 Days/2 Weeks/2 Months) that compute a date from `appointment.appointment_date`, plus a manual date field — small, high-value UX win, cheap to build.

---

## 3. Prescription document is a proper clinical letterhead, not just a med list

**Finding:** Medisray's "Visit Summary" (the generated document, verified by actually generating one end-to-end) shows: doctor name + degree + specialty (e.g. "Dr. Dr Baigs Clinic / MD MS / Unani") on the left, clinic name/address/phone on the right, a bordered block with "Patient Name & Patient Id", "Age/Gender", "Date", "Phone No", then labeled sections in order (only the sections that have data appear — e.g. our test visit had only "Symptoms: Headache" and rendered just that, no empty section headers), a signature line ("Dr. Dr Baigs Clinic"), and a "Thank you for your visit. Wishing you good health." footer.

**Also confirmed end-to-end:** clicking "End Visit" on the consultation screen immediately (1) creates the prescription record, (2) generates this preview document, and (3) surfaces a **"Share this prescription to Patient"** panel with the patient's phone number pre-filled and a single **"Send Prescription"** button (presumably WhatsApp/SMS) — no separate step to look up the number. From that same preview screen: **Create Bill**, **Print Prescription**, **Download Prescription**, and **Edit Prescription** are all one click away.

**Why it matters (Design System Architect):** Our `lib/prescription-pdf.ts` already has a branded header/footer and a medication table (from the earlier prescriptions build), but it has no symptoms/diagnosis/investigation/follow-up sections and no doctor qualification/specialty line — because the underlying data model doesn't capture them (see #2). We also don't have the "one-click send to patient" step — `PrescriptionsListView.tsx` generates the PDF but the admin has to separately go find the patient's number.

**Build:** Once #2's schema/UI additions land, extend `generatePrescriptionPdf()` to render the new sections in the same order Medisray uses (Symptoms → Diagnosis → Medications → Lab Investigation → Follow-up) and to **only render sections that actually have data** (avoid empty "Diagnosis:" headers). Add `doctor.qualification`/`doctor.specialty` fields to the `doctors` CMS section (currently just name/photo/bio) so the PDF can show "Dr. X, MD MS" under the doctor's name. Add a one-click "Send to Patient" action next to the existing PDF link in `PrescriptionsListView.tsx`/`PrescriptionEditor.tsx`'s save-success state, reusing `lib/notifications.ts`'s existing Twilio/Resend plumbing with the patient's phone already in scope — this is a small, high-value addition, not a new subsystem.

---

## 4. Patient profile is far richer than ours

**Finding:** Medisray's "Add Patient" form captures: full name, mobile, gender, date of birth (year + full date), a clinic-defined **Patient Reference ID** (separate from the system-generated `PAT00003`-style code), blood group, marital status, email, occupation, Aadhaar number, and a full address (street/area autocomplete, city, state, pincode), plus a profile photo upload.

**Why it matters (PM/Security):** Our `patients` table only has `name, phone, email, patient_code`. A real clinic needs DOB (for age-based dosing/consent), blood group (relevant clinically), and address (for records/billing) — but Aadhaar-equivalent government ID capture is a **compliance-sensitive** field we should be deliberate about, not copy blindly.

**Build (Backend/DB Architect):**
- Extend `patients` table: `date_of_birth date`, `gender text`, `blood_group text`, `marital_status text`, `occupation text`, `address_street text`, `address_city text`, `address_state text`, `address_pincode text`, `photo_url text`, `reference_id text` (a clinic-assigned free-text ID, distinct from our auto-generated `patient_code`).
- **Skip Aadhaar/government-ID capture** — flagging this explicitly as a scope decision, not an oversight: storing a national ID number meaningfully raises the compliance/security bar (breach blast radius, retention rules) for a feature that isn't core to booking/prescriptions. Revisit only if the user explicitly wants it and is prepared to handle it as sensitive PII (e.g., encrypted at rest, restricted access).
- Update `PatientsView.tsx`'s add/edit form and the public booking flow's patient-creation path to collect the new optional fields (all optional except name/phone, to avoid breaking the fast-booking flow).

---

## 5. Slot scheduling is a recurring weekly template, not a flat list

**Finding:** Medisray's "Timing Configuration" lets the clinic define a **recurring schedule**: pick clinic → slot duration (e.g. 30 min) → a start–end time range → which days of the week it repeats on (S M T W T F S toggles) → Save. Multiple such schedule blocks can be added (e.g. "Mon–Fri 9am–1pm" + "Sat 10am–2pm"). The booking calendar then shows slot counts grouped by Morning/Afternoon/Evening/Night per day, computed from these recurring rules.

**Why it matters (Backend/DB Architect):** Our `BookingSettingsEditor.tsx` only manages a **flat list of time-of-day strings** (`slots: string[]`), the same every single day, with no day-of-week variation and no per-doctor/per-clinic schedule. A clinic that's open different hours on different days (very common — e.g. half-day Saturdays) can't represent that today.

**Build:**
- New `doctor_schedules` table: `id, doctor_id, slot_duration_minutes, start_time, end_time, days_of_week int[] (0-6), effective_from date, effective_to date nullable`.
- Replace the flat `getConfiguredSlots()` in `lib/appointments.ts` with a function that expands a doctor's `doctor_schedules` rows for a given date into concrete slot times, respecting the day-of-week match.
- `BookingSettingsEditor.tsx` gets a "Add Schedule" UI matching Medisray's pattern (duration dropdown, start/end time pickers, day toggles) instead of the current single add/remove time list.
- Booking modal's day-picker keeps its current per-day slot count, but the counts now come from the expanded weekly template instead of a static list — this also fixes the earlier "why is the doctor dropdown/slots the same every day" limitation structurally, not just performance-wise.

---

## 5b. Booking a slot has no "service" selection — just Case Type + Category

**Finding:** Confirmed by actually configuring a real recurring schedule (Dr Baigs Clinic, 30-min slots, 12:00–12:30 PM, Sat+Sun) and booking through it. The resulting "Confirm Appointment" dialog shows: clinic name + chosen date/time (read-only, already decided by the slot click), a patient search-or-add field, **Case Type** (dropdown, saw "New" — likely New/Follow-up), **Category** (dropdown, saw "Acute Patient" — likely a visit-severity/type classification), and a "Remarks for Receptionist" free-text field. **There is no service/consultation-type selection step at all** — Medisray is purely clinic+doctor+time, not clinic+doctor+service+time.

**Why it matters (PM):** Our booking flow is built around **services** (`bookingSettings`/services CMS section — "General Consultation", etc.) as a first-class concept the patient picks before choosing a doctor/time. Medisray doesn't have this — it's simpler, doctor-and-slot-only. This is a deliberate product-shape difference, not a gap: our services-first model suits a clinic offering genuinely distinct paid services (patients need to know what they're booking and often what it costs), while Medisray's model suits a single-doctor-type general-consultation flow. **Not recommending we drop services** — just noting it's not something to copy, and that Medisray's "Case Type" (New/Follow-up) and "Category" (patient acuity) are a different, complementary axis we could consider adding *alongside* our service selection rather than instead of it, since they help the doctor triage the queue (a follow-up or acute patient probably needs to be seen differently than a routine new-patient booking).

**Build (optional, low priority):** If useful later, add a lightweight `case_type: 'new' | 'follow_up'` and `visit_category: text` (free/preset dropdown) to `appointments`, surfaced in the admin queue view for triage — independent of the services model, not a replacement for it.

---

## 6. Billing/Invoicing doesn't exist in our app at all

**Finding:** Medisray has a full per-visit billing module, confirmed by actually creating a bill end-to-end. From "View/Create Bill" on a finished appointment: an invoice list (`INV000001`, date, Billed/Paid/Due amounts in ₹) with Print/Edit/More-options per row. The "Create Bill" screen itself (reached directly from the End-Visit/prescription-preview screen too) is a **full GST-aware invoice builder**:
- Patient/date/doctor header (auto-filled from the visit).
- A line-items table: search-and-add item, quantity (+/− stepper), price per unit, **per-line discount toggleable between % or ₹**, GST %, computed line total, delete action.
- A totals panel: Subtotal, Line item Discount, Applicable GST, an **Extra Discount** (bill-level, also %/₹ toggle), Total Payable Amount.
- Payment section: payment mode dropdown (Cash, presumably Card/UPI/etc.), a "+ Payment mode" to split payment across methods, a Paid Amount field, and a computed "Total Amount Paid".
- A free-text Notes field (300 char limit).
- "Save & Print" and "Save & Preview" actions.

**Why it matters (PM):** This is a completely separate capability from booking/prescriptions — full payment tracking per visit, GST-compliant. Confirmed it's a real, finished feature (not a stub) — worth taking seriously as a scope item, but still large enough to be its own phase.

**Recommendation:** Treat as its own future phase, not part of this pass. If pursued: new `invoices` table (`id, appointment_id, patient_id, line_items jsonb [{name, qty, price, discount_type, discount_value, gst_percent}], extra_discount_type, extra_discount_value, subtotal, gst_amount, total_payable, payments jsonb [{mode, amount}], paid_amount, notes, status`), an admin "Create Bill" action reachable both from the Appointments view and directly from the post-prescription screen (matching Medisray's flow), and a printable invoice template (reusing the PDF infrastructure from `lib/prescription-pdf.ts`). Flagging now so it's a known, well-scoped gap, not silently missing.

---

## 7. Multi-clinic context switcher

**Finding:** Medisray's header has a clinic-switcher dropdown ("Dr Baigs Clinic ▾") — implying a doctor/admin account can operate across multiple clinics/locations from one login.

**Why it matters:** [[project_roles]] memory notes our app has **no RBAC — single shared-password admin auth**, and the whole CMS/booking model is single-clinic (one `cms_data` blob). Medisray's multi-clinic capability is a fundamentally different account model.

**Recommendation:** Out of scope unless the user is planning to operate multiple physical clinic locations under one account. Not worth building speculatively — flagging only so it's a deliberate "not doing this" rather than a gap nobody noticed.

---

## 8. Login is Account ID + Phone + OTP (or password), with reCAPTCHA

**Finding:** Medisray login: Account ID/alias + phone number + reCAPTCHA, then either "Login via OTP" or "Login via Password."

**Why it matters (Security Architect):** Our admin login is a **single shared password**, no per-user identity, no OTP, no bot protection. This was already flagged in memory ([[project_roles]]) as a known, deliberate simplification for a single-admin clinic app.

**Recommendation:** Not a gap to close now — multi-user OTP login is a different product shape (multiple staff/doctor accounts) than what this app currently is. Worth revisiting only if the clinic grows beyond one shared admin login. No action this pass.

---

## Summary — Prioritized build list

| # | Feature | Effort | Priority |
|---|---|---|---|
| 2 | Modular Digital-Rx consultation (Symptoms/Diagnosis/Medications/Investigation/Advices + Vitals + Medical History + Private Notes modules, autocomplete/chip-toggle inputs) | High | **High** — biggest clinical-quality gap, now confirmed to be larger than first scoped |
| 3 | Prescription PDF gains new sections + doctor qualification line + one-click "Send to Patient" | Low-Medium (depends on #2) | **High** — pairs with #2, the send-to-patient part is cheap and high-value on its own |
| 5 | Recurring weekly slot-schedule model (replace flat slot list) | Medium-High | **High** — real scheduling gap, not cosmetic; verified working end-to-end in Medisray |
| 1 | Walk-in flow (silently creates a real appointment + Queue/Finished/Cancelled tabs) | Medium | **Medium** — valuable, and simpler than first assumed since it reuses the appointment model rather than needing a new one |
| 4 | Richer patient profile fields (DOB, blood group, address, etc. — excluding Aadhaar) | Low-Medium | **Medium** |
| 5b | Case Type (New/Follow-up) + visit Category on appointments, for queue triage | Low | **Low** — optional, complementary to our services model, not a replacement |
| 6 | Billing/Invoicing module (full GST invoice builder, confirmed end-to-end) | High | **Low / future phase** — big standalone scope, but now well-specified if pursued |
| 7 | Multi-clinic switcher | High | **Not planned** — different account model |
| 8 | OTP/multi-user login | High | **Not planned** — different account model |

Recommend tackling in this order: **5 → 2 → 3 → 1 → 4 → 5b**, since #5 (real recurring schedules) fixes a structural booking limitation independent of everything else, and #2/#3 are the same piece of work (consultation UI + the PDF/send-to-patient flow it produces) that most directly upgrades what a doctor can actually do with this app day-to-day. #6 (billing) is real and well-understood now but is a genuinely separate, large feature — worth a dedicated future pass rather than folding into this one.
