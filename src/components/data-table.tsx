export function DataTable({
  headers,
  rows,
  maxHeight,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  maxHeight?: string;
}) {
  return (
    <div className="overflow-auto rounded-lg border border-slate-200 bg-white" style={maxHeight ? { maxHeight } : undefined}>
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
            rows.map((row, index) => (
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
  );
}
