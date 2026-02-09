import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { RESOURCE_CATEGORIES, ResourceCategory, UrgencyLevel, Donation as DonationType } from '@/types';
import { RequestCard } from '@/components/cards/RequestCard';
import { DonationCard } from '@/components/cards/DonationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MapPin,
  List,
  Filter,
  X,
  AlertTriangle,
  Heart,
  Package
} from 'lucide-react';

export default function BrowseRequests() {
  const [activeTab, setActiveTab] = useState<'needs' | 'supplies'>('needs');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'all'>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<DonationType[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch live data from server
  useEffect(() => {
    async function load() {
      try {
        const [reqRes, supRes] = await Promise.all([
          fetch(`/api/requests`, { credentials: 'include' }),
          fetch(`/api/donations`, { credentials: 'include' })
        ]);

        const reqData = await reqRes.json();
        const supData = await supRes.json();

        const normalize = (r: any) => ({ ...r, id: r.id || r._id });
        setRequests((reqData || []).map(normalize));
        setSupplies((supData || []).map(normalize));
      } catch (err) {
        console.error('Failed to load feed', err);
      }
    }
    load();
  }, []);

  // Filtering Logic
  const filteredRequests = requests.filter(request => {
    if (request.status !== 'active') return false;
    if (searchQuery && !request.specificResource.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && request.category !== selectedCategory) return false;
    if (selectedUrgency !== 'all' && request.urgency !== selectedUrgency) return false;
    return true;
  });

  const filteredSupplies = supplies.filter(supply => {
    if (searchQuery && !supply.specificResource.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && supply.category !== selectedCategory) return false;
    return true;
  });

  const urgencyCounts = {
    all: requests.filter(r => r.status === 'active').length,
    critical: requests.filter(r => r.status === 'active' && r.urgency === 'critical').length,
    high: requests.filter(r => r.status === 'active' && r.urgency === 'high').length,
    medium: requests.filter(r => r.status === 'active' && r.urgency === 'medium').length,
    low: requests.filter(r => r.status === 'active' && r.urgency === 'low').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedUrgency('all');
  };

  const handleClaim = (donationId: string) => {
    toast({
      title: 'Claiming Resource...',
      description: 'Redirecting you to complete the request form for this supply.',
    });
    // Redirect to the request form
    navigate('/request');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all';

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Browse Requests</h1>
            <p className="text-muted-foreground mt-1">
              Find requests near you and help those in need
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-[240px] grid-cols-2">
                <TabsTrigger value="needs" className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Needs
                </TabsTrigger>
                <TabsTrigger value="supplies" className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5" />
                  Supplies
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-8 w-px bg-border hidden sm:block mx-1" />

            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')}>
              <TabsList>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-1" />
                  List
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapPin className="h-4 w-4 mr-1" />
                  Map
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Filters Section */}
        <div className="space-y-6 mb-8">
          {activeTab === 'needs' && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedUrgency === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedUrgency('all')}
              >
                All
                <Badge variant="secondary" className="ml-2">{urgencyCounts.all}</Badge>
              </Button>
              <Button
                variant={selectedUrgency === 'critical' ? 'default' : 'outline'}
                size="sm"
                className={selectedUrgency === 'critical' ? 'bg-critical hover:bg-critical/90' : ''}
                onClick={() => setSelectedUrgency('critical')}
              >
                🔴 Critical
                <Badge variant="secondary" className="ml-2">{urgencyCounts.critical}</Badge>
              </Button>
              <Button
                variant={selectedUrgency === 'high' ? 'default' : 'outline'}
                size="sm"
                className={selectedUrgency === 'high' ? 'bg-high-urgency hover:bg-high-urgency/90' : ''}
                onClick={() => setSelectedUrgency('high')}
              >
                🟠 High
                <Badge variant="secondary" className="ml-2">{urgencyCounts.high}</Badge>
              </Button>
              <Button
                variant={selectedUrgency === 'medium' ? 'default' : 'outline'}
                size="sm"
                className={selectedUrgency === 'medium' ? 'bg-medium-urgency hover:bg-medium-urgency/90 text-medium-urgency-foreground' : ''}
                onClick={() => setSelectedUrgency('medium')}
              >
                🟡 Medium
                <Badge variant="secondary" className="ml-2">{urgencyCounts.medium}</Badge>
              </Button>
              <Button
                variant={selectedUrgency === 'low' ? 'default' : 'outline'}
                size="sm"
                className={selectedUrgency === 'low' ? 'bg-low-urgency hover:bg-low-urgency/90' : ''}
                onClick={() => setSelectedUrgency('low')}
              >
                🟢 Low
                <Badge variant="secondary" className="ml-2">{urgencyCounts.low}</Badge>
              </Button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'needs' ? 'requests' : 'supplies'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ResourceCategory | 'all')}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {view === 'list' ? (
          activeTab === 'needs' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Active Requests
                  <Badge variant="outline" className="text-xs">{filteredRequests.length}</Badge>
                </h2>
              </div>
              {filteredRequests.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No requests found matching your filters."
                  onClear={clearFilters}
                  icon={<AlertTriangle className="h-10 w-10 mx-auto mb-4 opacity-50" />}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-success">
                  Available Supplies
                  <Badge variant="outline" className="text-xs font-normal">{filteredSupplies.length}</Badge>
                </h2>
              </div>
              {filteredSupplies.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSupplies.map((donation) => (
                    <DonationCard key={donation.id} donation={donation} onClaim={handleClaim} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No available supplies found at the moment."
                  onClear={clearFilters}
                  icon={<Package className="h-10 w-10 mx-auto mb-4 opacity-50" />}
                />
              )}
            </div>
          )
        ) : (
          <Card className="card-elevated">
            <CardContent className="p-0">
              <div className="h-[600px] bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Map View - {activeTab === 'needs' ? 'Needs' : 'Supplies'}</h3>
                  <p className="text-muted-foreground max-w-md px-4">
                    Interactive map showing locations of {activeTab === 'needs' ? 'active requests' : 'available donations'} near you.
                    Pins are color-coded by {activeTab === 'needs' ? 'urgency level' : 'resource category'}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

function EmptyState({ message, onClear, icon }: { message: string, onClear: () => void, icon?: React.ReactNode }) {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="py-12 text-center text-muted-foreground">
        {icon || <Package className="h-10 w-10 mx-auto mb-4 opacity-50" />}
        <p className="mb-4">{message}</p>
        <Button variant="outline" size="sm" onClick={onClear}>Clear Filters</Button>
      </CardContent>
    </Card>
  );
}
