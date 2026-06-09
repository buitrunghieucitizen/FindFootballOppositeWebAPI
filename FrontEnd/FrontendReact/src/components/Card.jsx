export const Card = ({ 
  children, 
  header, 
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          {typeof header === 'string' ? (
            <h3 className="font-semibold text-gray-900 dark:text-white">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          {footer}
        </div>
      )}
    </div>
  );
};
