export const Card = ({ 
  children, 
  header, 
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          {typeof header === 'string' ? (
            <h3 className="font-semibold text-gray-900">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};
