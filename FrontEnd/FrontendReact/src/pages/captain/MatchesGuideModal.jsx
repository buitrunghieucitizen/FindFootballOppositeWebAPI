import React from 'react';
import { FiX, FiPlus, FiCheckSquare, FiAward, FiEdit3, FiMessageSquare } from 'react-icons/fi';

export default function MatchesGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-500">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📖 Hướng dẫn Luồng Kèo Đấu & Trận Đấu
          </h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Section 1: Tạo kèo */}
          <section>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
              Tạo Kèo Giao Hữu (Tìm đối thủ)
            </h4>
            <div className="pl-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Trường hợp đội bạn chưa có đối thủ và muốn đăng tin tìm người giao lưu:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Chuyển sang tab <strong>Kèo & Lời mời</strong>.</li>
                <li>Bấm nút <strong className="text-emerald-600"><FiPlus className="inline" /> Tạo kèo giao hữu mới</strong>.</li>
                <li>Điền thông tin ngày giờ, địa điểm, và yêu cầu (nếu có) rồi lưu lại.</li>
                <li>Kèo của bạn sẽ hiển thị công khai. Các đội khác thấy phù hợp sẽ gửi <strong>Lời mời giao lưu</strong> cho bạn.</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Chốt kèo */}
          <section>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">2</span>
              Duyệt yêu cầu & Chốt kèo
            </h4>
            <div className="pl-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <ul className="list-disc pl-4 space-y-2">
                <li>Khi có đội khác xin giao lưu, bạn sẽ thấy thông báo ở phần <strong>Lời mời chờ duyệt</strong>.</li>
                <li>Bạn có thể bấm <strong className="text-indigo-600"><FiMessageSquare className="inline" /> Chat</strong> để trao đổi trước với đội trưởng bên kia.</li>
                <li>Nếu đồng ý, bấm <strong>Chấp nhận</strong>. Kèo sẽ lập tức chuyển thành <strong>Trận Đấu</strong> và hiển thị bên tab Trận đấu của Đội.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Quản lý trận đấu */}
          <section>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">3</span>
              Trước trận đấu (Điểm danh & Đặt sân)
            </h4>
            <div className="pl-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <ul className="list-disc pl-4 space-y-2">
                <li>Quay lại tab <strong>Trận đấu của Đội</strong>, bạn sẽ thấy trận đấu vừa chốt.</li>
                <li>Nếu chưa có sân, bạn có thể bấm <strong>Đặt sân trên hệ thống</strong> hoặc <strong>Đã tự đặt sân ngoài</strong>.</li>
                <li>Sử dụng tính năng <strong>Điểm danh</strong> để biết có bao nhiêu thành viên trong đội báo Có mặt / Vắng mặt.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Sau trận đấu */}
          <section>
            <h4 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">4</span>
              Sau khi thi đấu xong
            </h4>
            <div className="pl-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Đây là bước quan trọng để ghi nhận thành tích và xây dựng cộng đồng uy tín:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Một trong hai đội trưởng bấm <strong className="text-blue-600"><FiEdit3 className="inline" /> Trận đấu kết thúc (Ghi kết quả)</strong> và nhập tỉ số.</li>
                <li>Đội trưởng bên kia sẽ thấy tỉ số và bấm <strong>Xác nhận đúng</strong> (hoặc <strong>Báo sai</strong> nếu không đồng ý).</li>
                <li>Sau khi cả 2 bên xác nhận, trận đấu chính thức hoàn tất.</li>
                <li>Đừng quên bấm <strong className="text-amber-600"><FiAward className="inline" /> Đánh giá đối thủ</strong> để chấm điểm Fairplay nhé!</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors font-semibold"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
