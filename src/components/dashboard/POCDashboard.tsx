import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/cards/StatCard';
import { RequestCard } from '@/components/cards/RequestCard';
import { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  FileText,
  Bell,
  ArrowRight,
  Shield,
  Users,
  Package,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function POCDashboard() {
  const { user } = useAuth();

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [urgencyStats, setUrgencyStats] = useState<any>({ critical: 0, high: 0, medium: 0, low: 0 });
  const [totalActive, setTotalActive] = useState<number>(0);
  const [recentCritical, setRecentCritical] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
    async function load() {
      try {
        const [requestsRes, urgencyRes] = await Promise.all([
          fetch(`${API_BASE}/api/requests`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/stats/urgency`),
        ]);
        const requests = await requestsRes.json();
        const urgency = await urgencyRes.json();
        const normalized = (requests || []).map((r:any)=>({ ...r, id: r.id || r._id }));
        setPendingApprovals(normalized.filter((r: any) => r.status === 'pending-verification'));
        setUrgencyStats(urgency);
        setTotalActive(Object.values(urgency).reduce((a: number, b: number) => a + b, 0));
        setRecentCritical(normalized.filter((r: any) => r.urgency === 'critical').slice(0,3));
      } catch (err) {
        console.error('Failed to load POC data', err);
        setPendingApprovals([]);
        setUrgencyStats({ critical: 0, high: 0, medium: 0, low: 0 });
        setTotalActive(0);
        setRecentCritical([]);
      }
    }
    load();
  }, []);

  const apiBase = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

  async function approveRequest(id: string) {
    try {
      const res = await fetch(`${apiBase}/api/requests/${id}/approve`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Approve failed');
      const updated = await res.json();
      setPendingApprovals(prev => prev.filter(p => String(p.id || p._id) !== String(id)));
      setSelectedRequest(null);
      toast({ title: 'Request approved', description: 'The request is now active and visible to responders.' });
    } catch (err) {
      console.error('Approve error', err);
      toast({ title: 'Approve failed', description: 'Unable to approve request.', variant: 'destructive' });
    }
  }

  async function rejectRequest(id: string) {
    try {
      const res = await fetch(`${apiBase}/api/requests/${id}/reject`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Reject failed');
      setPendingApprovals(prev => prev.filter(p => String(p.id || p._id) !== String(id)));
      setSelectedRequest(null);
      toast({ title: 'Request rejected', description: 'The request has been removed.' });
    } catch (err) {
      console.error('Reject error', err);
      toast({ title: 'Reject failed', description: 'Unable to reject request.', variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">District POC Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            {user?.district}, {user?.state} • Monitoring disaster relief operations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/reports">
              <FileText className="mr-2 h-4 w-4" />
              Generate Reports
            </Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link to="/emergency">
              <AlertOctagon className="mr-2 h-4 w-4" />
              Emergency Alert
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail Dialog for selected request */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        {selectedRequest && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>Review the request before approving or rejecting.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <div className="text-sm text-muted-foreground">Requested by: <strong>{selectedRequest.userName}</strong> ({selectedRequest.userType})</div>
              <div className="text-sm">Resource: <strong>{selectedRequest.quantity} {selectedRequest.unit} of {selectedRequest.specificResource}</strong></div>
              <div className="text-sm">Category: <strong>{selectedRequest.category}</strong></div>
              <div className="text-sm">Urgency: <strong>{selectedRequest.urgency}</strong></div>
              <div className="text-sm">Needed By: <strong>{selectedRequest.neededBy ? new Date(selectedRequest.neededBy).toLocaleString() : 'N/A'}</strong></div>
              <div className="text-sm">Location: <strong>{selectedRequest.address || ''} {selectedRequest.landmark ? '• ' + selectedRequest.landmark : ''}</strong></div>
              <div className="text-sm">District / State: <strong>{selectedRequest.district}, {selectedRequest.state}</strong></div>
              <div className="text-sm">People Affected: <strong>{selectedRequest.peopleAffected || 'N/A'}</strong></div>
              <div className="text-sm">Delivery Preference: <strong>{selectedRequest.deliveryPreference || 'N/A'}</strong></div>
              {selectedRequest.specialRequirements && (
                <div className="text-sm italic text-muted-foreground">Special: {selectedRequest.specialRequirements}</div>
              )}
              {selectedRequest.assignedPOC && (
                <div className="text-sm">Assigned POC: <strong>{selectedRequest.assignedPOC.name} ({selectedRequest.assignedPOC.email})</strong></div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => { if (selectedRequest) rejectRequest(selectedRequest.id || selectedRequest._id); }}>Reject</Button>
              <Button className="bg-success" onClick={() => { if (selectedRequest) approveRequest(selectedRequest.id || selectedRequest._id); }}>Approve</Button>
            </DialogFooter>
            <DialogClose />
          </DialogContent>
        )}
      </Dialog>

      {/* Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">Pending Approvals</p>
              <p className="text-sm text-muted-foreground">
                {pendingApprovals.length} requests require your verification
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="#pending">
              Review Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="awaiting verification"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Critical Requests"
          value={urgencyStats.critical}
          subtitle="need immediate attention"
          icon={AlertTriangle}
          variant="critical"
        />
        <StatCard
          title="Active Requests"
          value={totalActive}
          subtitle="in your district"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Fulfillment Rate"
          value="78%"
          subtitle="this week"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 5, label: 'vs last week', positive: true }}
        />
      </div>

      {/* Primary Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link to="#pending">
          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-3 rounded-full bg-warning/10 w-fit mx-auto mb-3 group-hover:bg-warning/20 transition-colors">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-1">Verify Requests</h3>
              <p className="text-xs text-muted-foreground">{pendingApprovals.length} pending</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-xs text-muted-foreground">Regional insights</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/emergency">
          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-3 rounded-full bg-critical/10 w-fit mx-auto mb-3 group-hover:bg-critical/20 transition-colors">
                <Bell className="h-6 w-6 text-critical" />
              </div>
              <h3 className="font-semibold mb-1">Alerts</h3>
              <p className="text-xs text-muted-foreground">Broadcast emergency</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports">
          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="pt-6 text-center">
              <div className="p-3 rounded-full bg-success/10 w-fit mx-auto mb-3 group-hover:bg-success/20 transition-colors">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-1">Reports</h3>
              <p className="text-xs text-muted-foreground">Generate reports</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Urgency Distribution */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Request Urgency Distribution
          </CardTitle>
          <CardDescription>Active requests by urgency level in your district</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-critical">Critical</div>
              <div className="flex-1">
                <Progress value={(urgencyStats.critical / totalActive) * 100} className="h-3 bg-muted [&>div]:bg-critical" />
              </div>
              <div className="w-12 text-sm text-right">{urgencyStats.critical}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-high-urgency">High</div>
              <div className="flex-1">
                <Progress value={(urgencyStats.high / totalActive) * 100} className="h-3 bg-muted [&>div]:bg-high-urgency" />
              </div>
              <div className="w-12 text-sm text-right">{urgencyStats.high}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-medium-urgency">Medium</div>
              <div className="flex-1">
                <Progress value={(urgencyStats.medium / totalActive) * 100} className="h-3 bg-muted [&>div]:bg-medium-urgency" />
              </div>
              <div className="w-12 text-sm text-right">{urgencyStats.medium}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-low-urgency">Low</div>
              <div className="flex-1">
                <Progress value={(urgencyStats.low / totalActive) * 100} className="h-3 bg-muted [&>div]:bg-low-urgency" />
              </div>
              <div className="w-12 text-sm text-right">{urgencyStats.low}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <div id="pending">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>
            <Badge variant="secondary">{pendingApprovals.length} pending</Badge>
          </div>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="space-y-4">
            {pendingApprovals.map(request => (
              <Card key={request.id} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="urgency-medium text-xs">{request.urgency}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Requested by {request.userName} ({request.userType})
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">
                        {request.quantity} {request.unit} of {request.specificResource}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {request.district}, {request.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {request.peopleAffected} people affected
                        </span>
                      </div>
                      {request.specialRequirements && (
                        <p className="mt-2 text-sm italic text-muted-foreground border-l-2 border-warning pl-2">
                          {request.specialRequirements}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => approveRequest(request.id || request._id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-medium mb-2">All Caught Up!</h3>
              <p className="text-sm text-muted-foreground">
                No pending approvals at the moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Critical Requests</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCritical.map(request => (
            <RequestCard key={request.id} request={request} showDonateButton={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
