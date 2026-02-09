import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/cards/StatCard';
import { RequestCard } from '@/components/cards/RequestCard';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  HeartHandshake,
  Package,
  Users,
  Building2,
  Bell,
  ArrowRight,
  Plus,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OrganizationDashboard() {
  const { user } = useAuth();

  const [pendingHelpRequests, setPendingHelpRequests] = useState<any[]>([]);
  const [matchedRequests, setMatchedRequests] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/requests`, { credentials: 'include' });
        const data = await res.json();
        setPendingHelpRequests(data.slice(0, 2));
        setMatchedRequests(data.filter((r: any) => r.status === 'matched'));
      } catch (err) {
        console.error('Failed to load requests', err);
        setPendingHelpRequests([]);
        setMatchedRequests([]);
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
            <Link to="/donate">
              <HeartHandshake className="mr-2 h-4 w-4" />
              Donate Resources
            </Link>
          </Button>
          <Button asChild>
            <Link to="/request">
              <Package className="mr-2 h-4 w-4" />
              Request Resources
            </Link>
          </Button>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="People Helped"
          value="12,450"
          icon={Users}
          variant="primary"
          trend={{ value: 12, label: 'this month', positive: true }}
        />
        <StatCard
          title="Resources Donated"
          value="3,200"
          subtitle="items distributed"
          icon={Package}
          variant="success"
        />
        <StatCard
          title="Active Requests"
          value={4}
          subtitle="pending fulfillment"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Direct Help Pings"
          value={8}
          subtitle="awaiting response"
          icon={Bell}
          variant="critical"
        />
      </div>

      {/* Primary Actions */}
      <div className="grid md:grid-cols-3 gap-6">
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
              Request resources for your relief operations. POC verification may be required for large quantities.
            </p>
            <Button className="w-full" size="sm" asChild>
              <Link to="/request">
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Link>
            </Button>
          </CardContent>
        </Card>

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
                <Badge variant="destructive" className="text-xs">8 new</Badge>
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
      </div>

      {/* Direct Help Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Direct Help Requests</h2>
            <Badge variant="secondary">8 pending</Badge>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/help-requests">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pendingHelpRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>

      {/* Matched Donations */}
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
              <RequestCard key={request.id} request={request} showDonateButton={false} />
            ))}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Matched Requests Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your donations will appear here once matched with requesters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Impact Dashboard Preview */}
      <Card className="card-elevated overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Organization Impact</CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/impact">Full Dashboard</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">12,450</p>
              <p className="text-sm text-muted-foreground">People Helped</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-success">3,200</p>
              <p className="text-sm text-muted-foreground">Resources Donated</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-warning">156</p>
              <p className="text-sm text-muted-foreground">Requests Fulfilled</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-info">4.8</p>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
