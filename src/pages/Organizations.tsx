import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockOrganizations, mockPOCs } from '@/data/mockData';
import { ORGANIZATION_TYPES, OrganizationType } from '@/types';
import { OrganizationCard } from '@/components/cards/OrganizationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Building2, 
  Shield,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';

export default function Organizations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OrganizationType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('organizations');
  const { toast } = useToast();

  // Filter organizations
  const filteredOrganizations = mockOrganizations.filter(org => {
    if (searchQuery && !org.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedType !== 'all' && org.type !== selectedType) return false;
    return true;
  });

  const handleRequestHelp = (org: any) => {
    toast({
      title: 'Request Sent!',
      description: `Your help request has been sent to ${org.name}. They will respond shortly.`,
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Organizations & Coordinators</h1>
          <p className="text-muted-foreground">
            Find organizations and district coordinators for disaster relief support
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="organizations">
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="pocs">
              <Shield className="h-4 w-4 mr-2" />
              District POCs
            </TabsTrigger>
          </TabsList>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as OrganizationType | 'all')}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Organization Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ORGANIZATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredOrganizations.length} organizations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => (
                <OrganizationCard 
                  key={org.id} 
                  organization={org}
                  onRequestHelp={handleRequestHelp}
                />
              ))}
            </div>
          </TabsContent>

          {/* POCs Tab */}
          <TabsContent value="pocs" className="space-y-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by district or name..."
                className="pl-10"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPOCs.map((poc) => (
                <Card key={poc.id} className="card-elevated">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{poc.name}</CardTitle>
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">{poc.designation}</p>
                      </div>
                      <Badge 
                        variant={poc.isAvailable ? 'default' : 'secondary'}
                        className={poc.isAvailable ? 'bg-success' : ''}
                      >
                        {poc.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{poc.district}, {poc.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{poc.officeHours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{poc.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{poc.email}</span>
                    </div>
                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" className="flex-1">
                        Report Emergency
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
