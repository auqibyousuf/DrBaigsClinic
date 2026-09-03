'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface DropdownMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  hidden?: boolean;
}

interface DropdownMenuProps {
  actions: DropdownMenuAction[];
  title?: string;
}

// Reusable 3-dot action menu — used wherever a row/panel had a wall of
// equally-weighted buttons (Save/Finish/Cancel/Delete/...), which reads as
// visual noise. One primary action stays a button; the rest live here.
export default function DropdownMenu({ actions, title = 'More actions' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title={title}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto min-w-[144px] !p-1">
        {visible.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              setOpen(false);
              action.onClick();
            }}
            className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] leading-none text-left whitespace-nowrap cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:flex-shrink-0 ${
              action.danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
