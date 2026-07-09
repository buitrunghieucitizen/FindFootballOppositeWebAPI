export const Input = ({ 
  label, 
  error, 
  hint,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {hint && !error && (
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{hint}</p>
      )}
    </div>
  );
};
