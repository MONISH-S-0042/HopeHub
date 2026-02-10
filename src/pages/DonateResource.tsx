import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { RESOURCE_CATEGORIES, ResourceCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import {
  HeartHandshake,
  MapPin,
  Package,
  Truck,
  Loader2,
  CheckCircle,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DonateResource() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');

  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // Donor info (pre-filled)
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    // Location
    pickupAddress: '', // User model doesn't have address
    district: user?.district || '',
    state: user?.state || '',
    // Resource
    category: '' as ResourceCategory | '',
    specificResource: '',
    quantity: '',
    unit: 'units',
    condition: 'new' as 'new' | 'gently-used' | 'consumable',
    expiryDate: '',
    availableUntil: '',
    // Delivery
    canDeliver: true,
    canPickup: true,
    deliveryRadius: '25',
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get matching requests from server
  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch(`/api/requests`, { credentials: 'include' });
        const data = await res.json();
        const normalize = (r: any) => ({ ...r, id: r.id || r._id });
        const matches = (data || []).filter((r: any) =>
          r.status === 'active' &&
          (formData.category ? r.category === formData.category : true) &&
          (formData.district ? r.district.toLowerCase() === formData.district.toLowerCase() : true)
        ).slice(0, 5).map(normalize);
        setMatchingRequests(matches);
      } catch (err) {
        console.error('Failed to load matching requests', err);
        setMatchingRequests([]);
      }
    }
    loadMatches();
  }, [formData.category, formData.district]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          deliveryRadius: Number(formData.deliveryRadius)
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: result.matchedCount > 0 ? 'Donation Matched!' : 'Donation Listed!',
          description: result.matchedCount > 0
            ? `Successfully matched with ${result.matchedCount} urgent requests! Check your dashboard.`
            : 'Your donation is now visible to requesters in the global feed.',
        });
        navigate('/dashboard');
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to list donation',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonateToRequest = async (requestId: string) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/requests/${requestId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: Number(formData.quantity) || 1, // Default to 1 if not set
          pickupAddress: formData.pickupAddress,
          district: formData.district,
          state: formData.state
        }),
        credentials: 'include'
      });

      if (res.ok) {
        toast({
          title: 'Donation Successful!',
          description: 'Thank you for your contribution. The requester has been notified.',
        });
        navigate('/dashboard');
      } else {
        const error = await res.json();
        toast({
          title: 'Failed to Donate',
          description: error.message || 'Something went wrong',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.type === 'poc') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10">
              <HeartHandshake className="h-5 w-5 text-success" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Donate Resources</h1>
          </div>
          <p className="text-muted-foreground">
            List what you can donate and get matched with people who need it most.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
                <CardDescription>Tell us what you'd like to donate</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress">Pickup Address</Label>
                      <Input
                        id="pickupAddress"
                        placeholder="Where can requesters pick up the donation?"
                        value={formData.pickupAddress}
                        onChange={(e) => updateFormData('pickupAddress', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          placeholder="e.g., Chennai"
                          value={formData.district}
                          onChange={(e) => updateFormData('district', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="e.g., Tamil Nadu"
                          value={formData.state}
                          onChange={(e) => updateFormData('state', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resource Category */}
                  <div className="space-y-3">
                    <Label>Resource Category</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {RESOURCE_CATEGORIES.map((cat) => (
                        <div
                          key={cat.value}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.category === cat.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                          onClick={() => {
                            updateFormData('category', cat.value);
                            setShowMatches(true);
                          }}
                        >
                          <div className="text-xl mb-1">{cat.icon}</div>
                          <p className="text-xs font-medium">{cat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resource Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specificResource">Specific Resource</Label>
                      <Input
                        id="specificResource"
                        placeholder="e.g., Rice, Blankets"
                        value={formData.specificResource}
                        onChange={(e) => updateFormData('specificResource', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={formData.quantity}
                        onChange={(e) => updateFormData('quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(v) => updateFormData('unit', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="units">Units</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(v) => updateFormData('condition', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="gently-used">Gently Used</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.condition === 'consumable' && (
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => updateFormData('expiryDate', e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="availableUntil">Available Until</Label>
                      <Input
                        id="availableUntil"
                        type="date"
                        value={formData.availableUntil}
                        onChange={(e) => updateFormData('availableUntil', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                    <Label className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Options
                    </Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="canDeliver" className="font-normal">
                          I can deliver to requester
                        </Label>
                        <Switch
                          id="canDeliver"
                          checked={formData.canDeliver}
                          onCheckedChange={(v) => updateFormData('canDeliver', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="canPickup" className="font-normal">
                          Requester can pick up from me
                        </Label>
                        <Switch
                          id="canPickup"
                          checked={formData.canPickup}
                          onCheckedChange={(v) => updateFormData('canPickup', v)}
                        />
                      </div>
                      {formData.canDeliver && (
                        <div className="space-y-2">
                          <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                          <Input
                            id="deliveryRadius"
                            type="number"
                            value={formData.deliveryRadius}
                            onChange={(e) => updateFormData('deliveryRadius', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>


                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Listing Donation...
                      </>
                    ) : (
                      <>
                        <HeartHandshake className="mr-2 h-5 w-5" />
                        List Donation
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Matching Requests */}
          <div className="lg:col-span-1">
            <Card className="card-elevated sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Matching Requests
                </CardTitle>
                <CardDescription>
                  People near you who need this resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matchingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {matchingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <UrgencyBadge urgency={request.urgency} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">
                          {request.quantity} {request.unit} - {request.specificResource}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {request.district}
                        </div>
                        <ProgressBar
                          current={request.fulfilledQuantity}
                          total={request.quantity}
                          size="sm"
                          showLabel={false}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            <Users className="h-3 w-3 inline mr-1" />
                            {request.peopleAffected} people
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link to={`/donate-to/${request.id}`}>
                              Donate
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Select a category to see matching requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
