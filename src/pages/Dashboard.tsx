import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { IndividualDashboard } from '@/components/dashboard/IndividualDashboard';
import { OrganizationDashboard } from '@/components/dashboard/OrganizationDashboard';
import { POCDashboard } from '@/components/dashboard/POCDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {user.type === 'individual' && <IndividualDashboard />}
        {user.type === 'organization' && <OrganizationDashboard />}
        {user.type === 'poc' && <POCDashboard />}
      </div>
    </MainLayout>
  );
}
