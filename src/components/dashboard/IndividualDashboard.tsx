import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestCard } from '@/components/cards/RequestCard';
import { DonationDetailsModal } from '@/components/modals/DonationDetailsModal';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  HeartHandshake,
  Package,
  MapPin,
  ArrowRight,
  Plus
} from 'lucide-react';

export function IndividualDashboard() {
  const { user } = useAuth();

  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [nearbyUrgentRequests, setNearbyUrgentRequests] = useState<any[]>([]);

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
        // fetch user's own requests for the "My Requests" section
        const mineRes = await fetch(`/api/requests/mine`, { credentials: 'include' });
        const mineData = mineRes.ok ? await mineRes.json() : [];
        const normalize = (r: any) => ({ ...r, id: r.id || r._id });
        setMyRequests((mineData || []).map(normalize).slice(0, 4));

        // fetch public requests (server filters out your own)
        const res = await fetch(`/api/requests`, { credentials: 'include' });
        const data = await res.json();
        const normalized = (data || []).map(normalize);
        setNearbyUrgentRequests(normalized.filter((r: any) => r.urgency === 'critical' || r.urgency === 'high').slice(0, 3));
      } catch (err) {
        console.error('Failed to load requests', err);
        // fallback to empty lists
        setMyRequests([]);
        setNearbyUrgentRequests([]);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your disaster relief network.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/donate">
              <HeartHandshake className="mr-2 h-4 w-4" />
              Donate Resource
            </Link>
          </Button>
          <Button asChild>
            <Link to="/request">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Resource
            </Link>
          </Button>
        </div>
      </div>



      {/* Primary Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-elevated hover:shadow-lg transition-shadow group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-critical/10">
                <AlertTriangle className="h-5 w-5 text-critical" />
              </div>
              <div>
                <CardTitle>Request a Resource</CardTitle>
                <CardDescription>Submit a request for essential supplies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Need help? Submit a resource request with details about what you need,
              urgency level, and location. Donors nearby will be notified.
            </p>
            <Button className="w-full group-hover:bg-primary/90" asChild>
              <Link to="/request">
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated hover:shadow-lg transition-shadow group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <HeartHandshake className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>Donate Resources</CardTitle>
                <CardDescription>Help those in need</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Have resources to share? List what you can donate and get matched
              with people who need them based on proximity and urgency.
            </p>
            <Button variant="outline" className="w-full group-hover:bg-success group-hover:text-success-foreground group-hover:border-success" asChild>
              <Link to="/donate">
                <HeartHandshake className="mr-2 h-4 w-4" />
                Donate Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Active Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Active Requests</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/my-activity">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {myRequests.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {myRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                showDonateButton={false}
                onViewDonations={handleViewDonations}
              />
            ))}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Active Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any active resource requests.
              </p>
              <Button asChild>
                <Link to="/request">Create a Request</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Nearby Urgent Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Nearby Urgent Requests</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-critical/10 text-critical text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-critical animate-pulse" />
              Live
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse">
              <MapPin className="mr-1 h-4 w-4" />
              Map View
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {nearbyUrgentRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
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
