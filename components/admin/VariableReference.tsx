'use client';

// Documents every {placeholder} a message template can use, with a plain-
// English description of what it fills in — so someone who isn't a
// developer can write a correct template without guessing (or copying a
// stale example, which is exactly how a previous template ended up missing
// half its variables).
const VARIABLES: { token: string; description: string }[] = [
  { token: '{name}', description: "The patient's full name" },
  { token: '{email}', description: "The patient's email address" },
  { token: '{phone}', description: "The patient's phone number" },
  { token: '{service}', description: 'The service they selected when booking (if any)' },
  { token: '{doctor}', description: 'The name of the doctor the appointment is with' },
  { token: '{date}', description: 'The appointment date (e.g. 2026-09-05)' },
  { token: '{time}', description: 'The appointment time slot (e.g. 10:00)' },
  { token: '{reason}', description: 'The reason for consultation the patient typed in' },
  { token: '{manageLink}', description: "A link the patient can use to view, reschedule, or cancel their own booking" },
  { token: '{patientId}', description: "The patient's short lookup code for viewing visit history and prescriptions later (blank on SMS if not available yet)" },
  { token: '{submittedAt}', description: 'The date/time the booking form was submitted (email templates only)' },
];

export default function VariableReference() {
  return (
    <div className="rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10 p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Available variables</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Type any of these anywhere in a template below — they'll be replaced with the real booking
        details when the message is sent.
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {VARIABLES.map(({ token, description }) => (
          <div key={token} className="flex items-baseline gap-2">
            <dt>
              <code className="text-xs font-mono font-semibold text-primary-700 dark:text-primary-400 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-800 rounded px-1.5 py-0.5">
                {token}
              </code>
            </dt>
            <dd className="text-xs text-gray-600 dark:text-gray-400">{description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
