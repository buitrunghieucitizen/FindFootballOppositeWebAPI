import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust range if near the edges
    if (currentPage <= 3) {
      start = 2;
      end = Math.min(maxVisible, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - maxVisible + 1);
      end = totalPages - 1;
    }

    // Add ellipsis before range
    if (start > 2) pages.push('...');

    // Add range pages
    for (let i = start; i <= end; i++) pages.push(i);

    // Add ellipsis after range
    if (end < totalPages - 1) pages.push('...');

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200
 ${currentPage === 1
 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
 : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white active:scale-95'
 }`}
      >
        <FiChevronLeft className="text-base" />
        <span>Trước</span>
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 py-2 text-slate-400 dark:text-slate-500 text-sm font-bold select-none">
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all duration-200
 ${currentPage === page
 ? 'bg-gradient-to-r from-emerald-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
 : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white active:scale-95'
 }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200
 ${currentPage === totalPages
 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
 : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white active:scale-95'
 }`}
      >
        <span>Sau</span>
        <FiChevronRight className="text-base" />
      </button>
    </div>
  );
}
