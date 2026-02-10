import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestCard } from '@/components/cards/RequestCard';
import { DonationDetailsModal } from '@/components/modals/DonationDetailsModal';
import { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Bell,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Package,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OrganizationDashboard() {
  const { user } = useAuth();

  const [pingedRequests, setPingedRequests] = useState<any[]>([]);
  const [matchedRequests, setMatchedRequests] = useState<any[]>([]);

  // Donation details modal state
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationRequestId, setDonationRequestId] = useState<string | null>(null);
  const [donationResourceName, setDonationResourceName] = useState('');

  const handleViewDonations = (id: string, name: string) => {
    setDonationRequestId(id);
    setDonationResourceName(name);
    setDonationModalOpen(true);
  };

  useEffect(() => {
    async function load() {
      try {
        const [pingedRes, helpedRes] = await Promise.all([
          fetch('/api/requests/pinged', { credentials: 'include' }),
          fetch('/api/requests/helped', { credentials: 'include' })
        ]);

        const pinged = await pingedRes.json();
        const helped = await helpedRes.json();

        setPingedRequests(pinged || []);
        setMatchedRequests(helped || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold">{user?.organizationName}</h1>
            {user?.isVerified && (
              <Badge className="badge-verified">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {user?.specialization} • Manage your organization's relief activities
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/request">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Resources
            </Link>
          </Button>
          <Button asChild>
            <Link to="/donate">
              <HeartHandshake className="mr-2 h-4 w-4" />
              Donate Resources
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-elevated hover:shadow-lg transition-shadow group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <HeartHandshake className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">Donate Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              List available resources from your organization to help those in need.
            </p>
            <Button variant="outline" className="w-full group-hover:bg-success group-hover:text-success-foreground" size="sm" asChild>
              <Link to="/donate">
                <HeartHandshake className="mr-2 h-4 w-4" />
                Donate Now
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated hover:shadow-lg transition-shadow group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Help Requests</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Individuals have pinged your organization for help. Review and respond.
            </p>
            <Button variant="outline" className="w-full" size="sm" asChild>
              <Link to="/help-requests">
                View Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated hover:shadow-lg transition-shadow group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Request Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Request resources for your relief operations. POC verification may be required.
            </p>
            <Button className="w-full" size="sm" asChild>
              <Link to="/request">
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Direct Help Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Direct Help Requests</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/help-requests">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pingedRequests.slice(0, 2).map((request: any) => (
            <RequestCard key={request.id || request._id} request={request} />
          ))}
          {pingedRequests.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No current help pings.</p>
          )}
        </div>
      </div>

      {/* Matched Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Matched Requests</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-activity">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {matchedRequests.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {matchedRequests.map(request => (
              <RequestCard
                key={request._id || request.id}
                request={request}
                showDonateButton={false}
                onViewDonations={handleViewDonations}
              />
            ))}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <HeartHandshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Matched Requests Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your donations will appear here once matched with requesters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DonationDetailsModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        requestId={donationRequestId}
        resourceName={donationResourceName}
      />
    </div>
  );
}
