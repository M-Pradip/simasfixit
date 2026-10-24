"use client";

import { useEffect, useMemo, useState } from "react";

export function DataTable({
  headers,
  rows,
  maxHeight,
  pagination = false,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  maxHeight?: string;
  pagination?: boolean;
}) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = useMemo(
    () => pagination
      ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : rows,
    [currentPage, pageSize, pagination, rows],
  );

  useEffect(() => {
    setPage(1);
  }, [pageSize, rows.length]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            visibleRows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-b border-slate-100 px-4 py-4 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={headers.length}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {pagination && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="table-page-size" className="whitespace-nowrap">Rows per page</label>
            <select
              id="table-page-size"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5"
            >
              {[10, 20, 30].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <span className="whitespace-nowrap">{rows.length} total</span>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="whitespace-nowrap">Page {currentPage} of {pageCount}</span>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >Previous</button>
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
