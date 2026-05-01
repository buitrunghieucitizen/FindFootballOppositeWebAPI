export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '',
}) => {
  const types = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
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
