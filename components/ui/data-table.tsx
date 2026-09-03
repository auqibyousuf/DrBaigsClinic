'use client';

import { useState } from 'react';
import {
  type ColumnDef,
  type SortingState,
  type ExpandedState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CaretUpDown, CaretDown, CaretRight, MagnifyingGlass } from '@phosphor-icons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/CustomSelect';

export interface DataTableFilter {
  columnId: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
  filters?: DataTableFilter[];
  emptyMessage?: string;
  renderExpandedRow?: (row: TData) => React.ReactNode;
  pageSize?: number;
  // When renderExpandedRow is set, the whole row is clickable-to-expand by
  // default. Set this when a column already has its own Edit/Delete icon
  // buttons calling row.toggleExpanded() itself — clicking anywhere else on
  // the row should then do nothing, so editing is an explicit action.
  manualExpandControl?: boolean;
  // Row-id accessor + a row id to auto-expand once (e.g. jumping straight
  // into a just-created row's detail panel instead of making the admin find
  // and click it themselves).
  getRowId?: (row: TData) => string;
  autoExpandRowId?: string | null;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchColumnId,
  filters,
  emptyMessage = 'No results.',
  renderExpandedRow,
  pageSize = 10,
  manualExpandControl = false,
  getRowId,
  autoExpandRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [autoExpanded, setAutoExpanded] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, expanded, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Without this, `globalFilter`/`columnFilters` state changes never
    // actually filtered the rows shown — typing in search did nothing.
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => !!renderExpandedRow,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    initialState: { pagination: { pageSize } },
  });

  if (autoExpandRowId && autoExpandRowId !== autoExpanded && table.getRowModel().rows.some((r) => r.id === autoExpandRowId)) {
    setAutoExpanded(autoExpandRowId);
    setExpanded({ [autoExpandRowId]: true });
  }

  return (
    <div className="space-y-4">
      {(searchColumnId !== undefined || (filters && filters.length > 0)) && (
        <div className="flex flex-wrap gap-3">
          {searchColumnId !== undefined && (
            <div className="relative flex-1 min-w-[14rem] max-w-sm">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 transition-colors duration-150 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-gray-300 dark:hover:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          )}
          {filters?.map((filter) => {
            const column = table.getColumn(filter.columnId);
            const value = (column?.getFilterValue() as string) ?? '';
            return (
              <div key={filter.columnId} className="w-full sm:w-48">
                <CustomSelect
                  id={`filter-${filter.columnId}`}
                  name={`filter-${filter.columnId}`}
                  value={value}
                  onChange={(e) => column?.setFilterValue(e.target.value || undefined)}
                  options={[{ value: '', label: filter.placeholder || 'All' }, ...filter.options]}
                  placeholder={filter.placeholder || 'All'}
                  compact
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {renderExpandedRow && !manualExpandControl && <TableHead className="w-8" />}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1.5 font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                        title="Click to sort"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <CaretUpDown className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    className={renderExpandedRow && !manualExpandControl ? 'cursor-pointer' : ''}
                    onClick={renderExpandedRow && !manualExpandControl ? () => row.toggleExpanded() : undefined}
                    data-state={row.getIsExpanded() ? 'selected' : undefined}
                    title={
                      renderExpandedRow && !manualExpandControl
                        ? row.getIsExpanded() ? 'Click to collapse' : 'Click to expand'
                        : undefined
                    }
                  >
                    {renderExpandedRow && !manualExpandControl && (
                      <TableCell className="w-8">
                        {row.getIsExpanded() ? (
                          <CaretDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <CaretRight className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderExpandedRow && row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length + (manualExpandControl ? 0 : 1)} className="bg-white dark:bg-gray-800 p-0">
                        <div onClick={(e) => e.stopPropagation()}>
                          {renderExpandedRow(row.original)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (renderExpandedRow ? 1 : 0)} className="h-24 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
