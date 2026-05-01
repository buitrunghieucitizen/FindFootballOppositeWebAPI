import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageSection, PublicLayout, SurfaceCard } from '../components/portal-ui';
import { publicService } from '../services/publicService';

const releaseChecklist = [
  'Xóa toàn bộ file .cshtml trong thư mục Home',
  'Xóa logic ViewBag và TempData khỏi backend',
  'Tách riêng thư mục FrontendReact khỏi C# MVC',
  'Dựng lại hệ thống Component bằng Tailwind CSS v3',
  'Đã nối luồng đăng nhập và load dữ liệu API thật',
];

function OperationsGuest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await publicService.getPortalData();
        if (result) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <PublicLayout title="Đang tải dữ liệu..." subtitle="Đang kết nối tới Backend...">
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
      </PublicLayout>
    );
  }

  if (!data) return null;

  const actorCapabilities = data.actorCapabilities || [];

  return (
    <PublicLayout
      title="Ma trận vận hành của hệ thống FindFootball"
      subtitle="Trang này đang tải các quyền hạn của người dùng từ C# Backend API."
      actions={
        <>
          <Link className="portal-button" to="/admin/overview">
            Xem điều hành admin
          </Link>
          <Link className="portal-button ghost" to="/privacy">
            Xem cấu trúc dữ liệu
          </Link>
        </>
      }
    >
      <PageSection
        eyebrow="Vai trò"
        title="Từng actor làm gì trong nền tảng"
        subtitle="Thông tin phân quyền động được thiết lập trên hệ thống."
      >
        <div className="card-grid">
          {actorCapabilities.map((actor) => (
            <SurfaceCard
              key={actor.actorName}
              title={actor.actorName}
              subtitle={actor.summary}
            >
              <ul className="plain-list">
                {actor.capabilities?.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Checklist"
        title="Những gì đã được dọn khỏi code cũ"
        subtitle="Đây là các bước đã được hoàn thiện để kết nối Backend-Frontend."
      >
        <SurfaceCard title="React hóa thành công" subtitle="Không còn token Razor, full API.">
          <ul className="plain-list">
            {releaseChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SurfaceCard>
      </PageSection>
    </PublicLayout>
  );
}

export default OperationsGuest;
