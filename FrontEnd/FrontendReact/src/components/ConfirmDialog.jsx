import { useState, useEffect } from 'react';
import { FiTrash2, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const variantConfig = {
  danger: {
    icon: FiTrash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600',
    confirmBg: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25',
    confirmText: 'text-white',
  },
  warning: {
    icon: FiAlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600',
    confirmBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25',
    confirmText: 'text-white',
  },
  info: {
    icon: FiInfo,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600',
    confirmBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/25',
    confirmText: 'text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  reasonRequired = false,
  reasonPlaceholder = 'Nhập lý do...',
}) {
  const [reason, setReason] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation on next frame
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (reasonRequired && !reason.trim()) return;
    onConfirm(reasonRequired ? reason.trim() : undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300
 ${animateIn ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700 w-full max-w-md overflow-hidden transition-all duration-300 origin-center
 ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-0">
          <div className={`p-3 rounded-xl ${config.iconBg} shrink-0`}>
            <Icon className={`text-xl ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-slate-800 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Reason textarea */}
        {reasonRequired && (
          <div className="px-6 pt-4">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
            {reasonRequired && !reason.trim() && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">* Vui lòng nhập lý do</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all duration-200 active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={reasonRequired && !reason.trim()}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 active:scale-[0.98]
 ${config.confirmBg} ${config.confirmText}
 ${reasonRequired && !reason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
