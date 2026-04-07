'use client';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const baseBtn =
    'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200';
  const inactiveBtn =
    'border-card-border text-text-secondary hover:bg-white/5 hover:border-accent-cyan/40';
  const activeBtn =
    'bg-gradient-to-r from-accent-cyan to-accent-purple text-white border-transparent shadow-[0_0_12px_rgba(6,182,212,0.3)]';
  const disabledBtn = 'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${baseBtn} ${inactiveBtn} ${disabledBtn}`}
      >
        ←
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${baseBtn} ${p === page ? activeBtn : inactiveBtn}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${baseBtn} ${inactiveBtn} ${disabledBtn}`}
      >
        →
      </button>
    </div>
  );
}
