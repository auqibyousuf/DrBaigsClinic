'use client';

import { Check, CircleNotch } from '@phosphor-icons/react';

interface AdminSaveButtonProps {
  saving: boolean;
  label?: string;
  savingLabel?: string;
}

// One shared "Save Changes" submit button for every CMS editor form —
// replaces 10 near-identical hand-rolled buttons, and uses a smaller
// size than the public-site Button component's pill/44px tap-target style
// (that one's sized for marketing-page CTAs, not a dense admin form).
export default function AdminSaveButton({ saving, label = 'Save Changes', savingLabel = 'Saving Changes...' }: AdminSaveButtonProps) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
    >
      {saving ? (
        <>
          <CircleNotch className="w-4 h-4 animate-spin" />
          <span>{savingLabel}</span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
