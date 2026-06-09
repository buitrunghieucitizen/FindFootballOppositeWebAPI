import { FiSearch, FiChevronDown } from 'react-icons/fi';

export default function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
  onFilterChange,
  filterValues = {},
  actions,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search Input */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-0 w-full sm:min-w-[220px] max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      )}

      {/* Filter Dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={filterValues[filter.key] || ''}
            onChange={(e) => onFilterChange && onFilterChange(filter.key, e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer font-medium"
          >
            <option value="">{filter.label}</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
        </div>
      ))}

      {/* Right-side Actions */}
      {actions && (
        <div className="flex gap-2 ml-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
