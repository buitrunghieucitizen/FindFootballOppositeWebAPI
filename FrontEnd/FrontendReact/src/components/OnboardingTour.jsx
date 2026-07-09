import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiStar } from 'react-icons/fi';

const CustomTooltip = ({
  index,
  step,
  isLastStep,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div {...tooltipProps} className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 w-80 overflow-hidden animate-fade-in relative z-[10000]">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <FiStar className="text-yellow-300 fill-yellow-300" />
          Hướng dẫn hệ thống
        </h4>
      </div>
      <div className="p-5">
        <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-6">
          {step.content}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button {...skipProps} className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            Bỏ qua
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button {...backProps} className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 transition-colors">
                Trở lại
              </button>
            )}
            <button {...primaryProps} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
              {isLastStep ? 'Hoàn tất' : 'Tiếp tục'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingTour() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    // Determine if onboarding should be shown
    const checkOnboarding = () => {
      const hideOnboarding = localStorage.getItem('hideOnboarding') === 'true';
      if (hideOnboarding || !user || !user.role) {
        setRun(false);
        return;
      }

      // Role-specific steps
      const roleSteps = {
        Captain: [
          {
            target: 'body',
            content: 'Chào mừng Đội trưởng! Đây là trung tâm quản lý các đội và trận đấu của bạn.',
            placement: 'center',
            disableBeacon: true,
          },
          {
            target: '.tour-step-teams',
            content: 'Đầu tiên, bạn có thể tạo và quản lý Đội bóng của mình ở đây.',
            placement: 'right',
          },
          {
            target: '.tour-step-stadiums',
            content: 'Tìm và đặt sân để thi đấu một cách nhanh chóng.',
            placement: 'right',
          },
          {
            target: '.tour-step-matches',
            content: (
              <div>
                <strong className="block mb-2 text-emerald-600">Quản lý Kèo Đấu & Trận Đấu</strong>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li><strong>Tạo Kèo:</strong> Đăng tin tìm đối thủ đá giao hữu.</li>
                  <li><strong>Giao Lưu:</strong> Nhận và duyệt lời mời từ các đội khác.</li>
                  <li><strong>Lịch Thi Đấu:</strong> Theo dõi các trận sắp tới.</li>
                  <li><strong>Kết Quả & Đánh Giá:</strong> Cập nhật tỉ số (bàn thắng hoặc Set) và đánh giá độ Fairplay của đối thủ.</li>
                </ul>
              </div>
            ),
            placement: 'right',
          },
          {
            target: '.tour-step-tournaments',
            content: 'Và cuối cùng là tổ chức hoặc tham gia các giải đấu.',
            placement: 'right',
          }
        ],
        Player: [
          {
            target: 'body',
            content: 'Chào mừng Cầu thủ! Khám phá các trận đấu và đội bóng xung quanh bạn.',
            placement: 'center',
            disableBeacon: true,
          },
          {
            target: '.tour-step-teams',
            content: 'Bạn có thể tìm và xin gia nhập vào các câu lạc bộ mình thích.',
            placement: 'right',
          },
          {
            target: '.tour-step-matches',
            content: (
              <div>
                <strong className="block mb-2 text-emerald-600">Giao lưu & Tham gia Kèo Đấu</strong>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Tìm kiếm các trận đấu (kèo) đang thiếu người.</li>
                  <li>Gửi yêu cầu xin tham gia "đá ké".</li>
                  <li>Xem lại lịch sử thi đấu của bạn.</li>
                </ul>
              </div>
            ),
            placement: 'right',
          }
        ],
        StadiumOwner: [
          {
            target: 'body',
            content: 'Chào mừng Chủ sân! Bắt đầu quản lý sân bãi và lịch đặt sân.',
            placement: 'center',
            disableBeacon: true,
          },
          {
            target: '.tour-step-stadiums',
            content: 'Đầu tiên, hãy tạo sân bóng chính và các sân con để kinh doanh.',
            placement: 'right',
          }
        ]
      };

      if (roleSteps[user.role]) {
        setSteps(roleSteps[user.role]);
        // Small delay to ensure UI is rendered
        const timer = setTimeout(() => {
          setRun(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    };

    checkOnboarding();
    
    // Listen for changes
    window.addEventListener('storage', checkOnboarding);
    return () => window.removeEventListener('storage', checkOnboarding);
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hideOnboarding', 'true');
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress={false}
      showSkipButton
      steps={steps}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          arrowColor: isDark ? '#1e293b' : '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        }
      }}
    />
  );
}
