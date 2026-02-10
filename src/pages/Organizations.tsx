import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ORGANIZATION_TYPES, OrganizationType, DistrictPOC } from '@/types';
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
  const [pocSearchQuery, setPocSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OrganizationType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('organizations');
  const { toast } = useToast();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [pocs, setPocs] = useState<DistrictPOC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [orgRequests, setOrgRequests] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [orgsRes, pocsRes] = await Promise.all([
          fetch('/api/organizations', { credentials: 'include' }),
          fetch('/api/pocs', { credentials: 'include' })
        ]);

        const orgsData = await orgsRes.json();
        const pocsData = await pocsRes.json();

        setOrganizations(Array.isArray(orgsData) ? orgsData : []);
        setPocs(Array.isArray(pocsData) ? pocsData : []);
      } catch (err) {
        console.error('Failed to load organizations or POCs', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    if (searchQuery && !org.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedType !== 'all' && org.type !== selectedType) return false;
    return true;
  });

  const handleOrgClick = async (org: any) => {
    setSelectedOrg(org);
    try {
      // Fetch requests matched by this organization or pinged to it if available
      const res = await fetch(`/api/requests?orgId=${org._id || org.id}`, { credentials: 'include' });
      const data = await res.json();
      setOrgRequests(data || []);
    } catch (err) {
      console.error('Failed to load org requests', err);
    }
  };

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



            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => (
                <div key={org._id || org.id} onClick={() => handleOrgClick(org)} className="cursor-pointer">
                  <OrganizationCard
                    organization={org}
                    onRequestHelp={() => handleRequestHelp(org)}
                  />
                </div>
              ))}
            </div>

            {selectedOrg && (
              <Card className="mt-8 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Help from {selectedOrg.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orgRequests.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {orgRequests.map((req: any) => (
                        <div key={req._id}>
                          <p className="text-sm font-medium">{req.specificResource}</p>
                          <p className="text-xs text-muted-foreground">{req.quantity} {req.unit}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No current public requests linked to this organization.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* POCs Tab */}
          <TabsContent value="pocs" className="space-y-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by district or name..."
                className="pl-10"
                value={pocSearchQuery}
                onChange={(e) => setPocSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pocs.filter(poc =>
                poc.name.toLowerCase().includes(pocSearchQuery.toLowerCase()) ||
                poc.district.toLowerCase().includes(pocSearchQuery.toLowerCase())
              ).map((poc) => (
                <Card key={poc.id} className="card-elevated">
                  <CardHeader className="pb-3 text-center border-b border-border/50 bg-primary/5">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{poc.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                      <div className="p-1.5 rounded-md bg-background shadow-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">District</span>
                        <span className="font-medium">{poc.district}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                        <div className="p-1.5 rounded-md bg-background shadow-sm">
                          <Phone className="h-4 w-4 text-verified" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contact</span>
                          <span className="font-medium font-mono">{poc.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30 overflow-hidden">
                        <div className="p-1.5 rounded-md bg-background shadow-sm flex-shrink-0">
                          <Mail className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Email</span>
                          <span className="font-medium truncate">{poc.email}</span>
                        </div>
                      </div>
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
