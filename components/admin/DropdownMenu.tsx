'use client';

import { useState } from 'react';
import { DotsThreeVertical } from '@phosphor-icons/react';
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
        <DotsThreeVertical className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto min-w-[150px] md:min-w-[190px] !p-1 md:!p-1.5">
        {visible.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              setOpen(false);
              action.onClick();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-md text-[11px] md:text-sm leading-none text-left whitespace-nowrap cursor-pointer [&_svg]:w-3.5 [&_svg]:h-3.5 md:[&_svg]:w-4 md:[&_svg]:h-4 [&_svg]:flex-shrink-0 ${
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
