export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '',
}) => {
  const types = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`border rounded-lg p-4 flex justify-between items-start ${types[type]} ${className}`}>
      <div className="flex gap-3">
        <span className="text-xl font-bold">{icons[type]}</span>
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          {message && <p className="text-sm">{message}</p>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xl font-bold hover:opacity-70"
        >
          ✕
        </button>
      )}
    </div>
  );
};
