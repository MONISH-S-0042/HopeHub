import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockRequests } from '@/data/mockData';
import { RESOURCE_CATEGORIES, URGENCY_LEVELS, ResourceCategory, UrgencyLevel } from '@/types';
import { RequestCard } from '@/components/cards/RequestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  List, 
  Filter,
  X,
  AlertTriangle
} from 'lucide-react';

export default function BrowseRequests() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter requests
  const filteredRequests = mockRequests.filter(request => {
    if (request.status !== 'active' && request.status !== 'matched') return false;
    if (searchQuery && !request.specificResource.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && request.category !== selectedCategory) return false;
    if (selectedUrgency !== 'all' && request.urgency !== selectedUrgency) return false;
    return true;
  });

  const urgencyCounts = {
    all: mockRequests.filter(r => r.status === 'active').length,
    critical: mockRequests.filter(r => r.status === 'active' && r.urgency === 'critical').length,
    high: mockRequests.filter(r => r.status === 'active' && r.urgency === 'high').length,
    medium: mockRequests.filter(r => r.status === 'active' && r.urgency === 'medium').length,
    low: mockRequests.filter(r => r.status === 'active' && r.urgency === 'low').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedUrgency('all');
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
          <div className="flex items-center gap-2">
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

        {/* Urgency Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by resource name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ResourceCategory | 'all')}>
              <SelectTrigger className="w-[180px]">
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

        {/* Results */}
        {view === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredRequests.length} requests
              </p>
            </div>

            {filteredRequests.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <Card className="card-elevated">
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Requests Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No requests match your current filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="card-elevated">
            <CardContent className="p-0">
              <div className="h-[600px] bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Map View</h3>
                  <p className="text-muted-foreground max-w-md">
                    Interactive map showing request locations would be integrated here 
                    with pins colored by urgency level.
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
