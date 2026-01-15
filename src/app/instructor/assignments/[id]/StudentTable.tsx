'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import DeleteStudentSessionButton from './DeleteStudentSessionButton';

interface StudentWithStats {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  startedAt: Date;
  lastSavedAt: Date | null;
  stats: {
    submissions: number;
    pasteInternal: number;
    pasteExternal: number;
    snapshots: number;
  };
}

interface StudentTableProps {
  students: StudentWithStats[];
  assignmentId: string;
}

const columnHelper = createColumnHelper<StudentWithStats>();

export default function StudentTable({ students, assignmentId }: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'studentName', desc: false }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => `${row.studentLastName}, ${row.studentFirstName}`, {
        id: 'studentName',
        header: 'Student',
        cell: (info) => (
          <div>
            <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">{info.row.original.studentEmail}</div>
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          const a = rowA.original;
          const b = rowB.original;
          const lastNameCompare = a.studentLastName.localeCompare(b.studentLastName);
          if (lastNameCompare !== 0) return lastNameCompare;
          return a.studentFirstName.localeCompare(b.studentFirstName);
        },
      }),
      columnHelper.accessor('startedAt', {
        header: 'Started',
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {new Date(info.getValue()).toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor('lastSavedAt', {
        header: 'Last Active',
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {info.getValue() ? new Date(info.getValue()!).toLocaleString() : '-'}
          </span>
        ),
      }),
      columnHelper.accessor('stats.submissions', {
        header: 'Submissions',
        cell: (info) => <span className="text-sm text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.stats, {
        id: 'pastes',
        header: 'Pastes',
        cell: (info) => {
          const stats = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">
                {stats.pasteInternal} internal
              </span>
              {stats.pasteExternal > 0 && (
                <span className="text-sm text-red-600 font-medium">
                  {stats.pasteExternal} external
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const student = info.row.original;
          return (
            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/instructor/summary/${student.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Summary
              </Link>
              <Link
                href={`/instructor/replay/${student.id}`}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Replay
              </Link>
              <DeleteStudentSessionButton
                sessionId={student.id}
                studentName={`${student.studentLastName}, ${student.studentFirstName}`}
                assignmentId={assignmentId}
              />
            </div>
          );
        },
      }),
    ],
    [assignmentId]
  );

  const table = useReactTable({
    data: students,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No students have started yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search students by name or email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                    } ${header.id === 'actions' ? 'text-right' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className={header.column.getIsSorted() ? 'text-blue-600' : 'text-gray-400'}>
                          {header.column.getIsSorted() === 'asc' && '▲'}
                          {header.column.getIsSorted() === 'desc' && '▼'}
                          {!header.column.getIsSorted() && '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-6 py-4 whitespace-nowrap ${
                      cell.column.id === 'actions' ? 'text-right' : ''
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} students
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {'<'}
          </button>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}
