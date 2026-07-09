export const Table = ({ 
  columns, 
  data, 
  loading = false,
  onRowClick,
  actions,
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-slate-800 h-12 mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-300"
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-300">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900 animate-fade-in-up"
              style={{ animationDelay: `${(idx % 15) * 50}ms`, animationFillMode: 'both' }}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
