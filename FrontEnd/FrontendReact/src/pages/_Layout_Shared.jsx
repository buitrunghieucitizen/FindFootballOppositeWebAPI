import { PublicLayout } from '../components/portal-ui';

function LayoutShared({ children, title = 'Layout công khai', subtitle = 'Wrapper React thay cho _Layout Razor.' }) {
  return (
    <PublicLayout title={title} subtitle={subtitle}>
      {children}
    </PublicLayout>
  );
}

export default LayoutShared;
