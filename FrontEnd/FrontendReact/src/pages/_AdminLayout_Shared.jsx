import { AdminLayout } from '../components/portal-ui';

function AdminLayoutShared({ children, title = 'Layout quản trị', subtitle = 'Wrapper React thay cho _AdminLayout Razor.' }) {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      {children}
    </AdminLayout>
  );
}

export default AdminLayoutShared;
