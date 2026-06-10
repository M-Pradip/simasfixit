"use client";

import { useState } from "react";

type DocumentPreviewProps = {
  label: string;
  url: string;
};

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(url);
}

export function DocumentPreview({ label, url }: DocumentPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-xs font-bold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:text-sky-700"
      >
        {url}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-bold text-slate-950">{label}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="h-[75vh] bg-slate-100 p-3">
              {isImage(url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={label} className="h-full w-full object-contain" />
              ) : (
                <iframe title={label} src={url} className="h-full w-full rounded-md border border-slate-200 bg-white" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
