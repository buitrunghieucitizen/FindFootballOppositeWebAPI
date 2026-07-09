export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 hover:shadow-md';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600',
    secondary: 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-slate-600',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-slate-600',
    outline: 'border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};
