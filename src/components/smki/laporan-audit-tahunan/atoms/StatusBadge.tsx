import React, { memo } from 'react';

export const StatusBadge = memo(({ status }: { status: string }) => {
  const isSelesai = status === 'Selesai';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
      isSelesai ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {status}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
