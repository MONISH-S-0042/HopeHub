import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { RESOURCE_CATEGORIES, URGENCY_LEVELS, ResourceCategory, UrgencyLevel, DeliveryPreference } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  MapPin,
  Package,
  Users,
  Clock,
  Truck,
  Loader2,
  Building2,
  CheckCircle
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const THRESHOLDS: Record<string, number> = {
  'food-nutrition': 500,
  'medical-healthcare': 50,
  'shelter-clothing': 200,
  'water-sanitation': 1000,
};

export default function RequestResource() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.type === 'organization') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal info (pre-filled from user)
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    // Location
    address: '',
    landmark: '',
    district: '',
    state: '',
    // Resource
    category: '' as ResourceCategory | '',
    specificResource: '',
    quantity: '',
    unit: 'units',
    urgency: 'medium' as UrgencyLevel,
    neededBy: '',
    deliveryPreference: 'either' as DeliveryPreference,
    // Additional
    peopleAffected: '',
    specialRequirements: '',
    // Organizations to ping
    pingOrganizations: [] as string[],
  });

  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch('/api/organizations', { credentials: 'include' });
        const data = await res.json();
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch organizations', err);
      }
    }
    fetchOrgs();
  }, []);

  const isUnreasonable = () => {
    if (!formData.category) return false;
    const threshold = THRESHOLDS[formData.category] || 100;
    return Number(formData.quantity) > threshold;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // client-side validations
    if (!formData.category) return toast({ title: 'Validation', description: 'Please select a resource category.' });
    if (!formData.specificResource) return toast({ title: 'Validation', description: 'Please enter the specific resource.' });
    const qty = Number(formData.quantity);
    if (!qty || isNaN(qty) || qty <= 0) return toast({ title: 'Validation', description: 'Please enter a valid quantity.' });
    if (!formData.address || !formData.district || !formData.state) return toast({ title: 'Validation', description: 'Please provide address, district and state.' });

    setIsSubmitting(true);
    try {
      const payload = {
        address: formData.address,
        landmark: formData.landmark,
        district: formData.district,
        state: formData.state,
        category: formData.category,
        specificResource: formData.specificResource,
        quantity: qty,
        unit: formData.unit,
        urgency: formData.urgency,
        neededBy: formData.neededBy || undefined,
        deliveryPreference: formData.deliveryPreference,
        peopleAffected: formData.peopleAffected ? Number(formData.peopleAffected) : undefined,
        specialRequirements: formData.specialRequirements,
        pingOrganizations: formData.pingOrganizations,
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast({ title: 'Unauthorized', description: 'Please login to submit requests.' });
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Error', description: err?.message || 'Failed to submit request' });
        return;
      }

      const created = await res.json();
      toast({
        title: created.status === 'pending-verification' ? 'Verification Required' : 'Request Submitted!',
        description: created.status === 'pending-verification'
          ? 'Your request exceeds standard limits and is pending POC verification.'
          : 'Your request has been created and is now visible to donors.',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('submit error', err);
      toast({ title: 'Error', description: 'Network or server error' });
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
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
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Current Address</Label>
        <Textarea
          id="address"
          placeholder="Enter your complete address for delivery/pickup"
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="landmark">Landmark (Optional)</Label>
          <Input
            id="landmark"
            placeholder="Near Railway Station"
            value={formData.landmark}
            onChange={(e) => updateFormData('landmark', e.target.value)}
          />
        </div>
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

      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
        <MapPin className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          Your location helps us match you with nearby donors for faster delivery
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Resource Category</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RESOURCE_CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.category === cat.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
                }`}
              onClick={() => updateFormData('category', cat.value)}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-sm font-medium">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="specificResource">Specific Resource</Label>
          <Input
            id="specificResource"
            placeholder="e.g., Rice, First Aid Kit, Blankets"
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
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="liters">Liters</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="boxes">Boxes</SelectItem>
              <SelectItem value="packets">Packets</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Urgency Level</Label>
        <RadioGroup
          value={formData.urgency}
          onValueChange={(v) => updateFormData('urgency', v)}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {URGENCY_LEVELS.map((level) => (
            <div key={level.value}>
              <RadioGroupItem value={level.value} id={level.value} className="sr-only" />
              <Label
                htmlFor={level.value}
                className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.urgency === level.value ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <span className="text-lg mb-1">
                  {level.value === 'critical' && '🔴'}
                  {level.value === 'high' && '🟠'}
                  {level.value === 'medium' && '🟡'}
                  {level.value === 'low' && '🟢'}
                </span>
                <span className="font-medium text-sm">{level.label}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">{level.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="neededBy">Needed By</Label>
          <Input
            id="neededBy"
            type="datetime-local"
            value={formData.neededBy}
            onChange={(e) => updateFormData('neededBy', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Delivery Preference</Label>
          <Select
            value={formData.deliveryPreference}
            onValueChange={(v) => updateFormData('deliveryPreference', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">📦 Pickup from donor</SelectItem>
              <SelectItem value="delivery">🚚 Delivery to my location</SelectItem>
              <SelectItem value="either">🤷 Either works</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
        <p className="text-sm font-medium text-warning mb-1">Additional Verification Required</p>
        <p className="text-xs text-muted-foreground">
          Due to the large quantity requested, please provide additional context to help our POCs verify and approve your request faster.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="peopleAffected">Number of People Affected</Label>
          <Input
            id="peopleAffected"
            type="number"
            placeholder="How many people need this resource?"
            value={formData.peopleAffected}
            onChange={(e) => updateFormData('peopleAffected', e.target.value)}
            required={isUnreasonable()}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequirements">Request Justification / Context</Label>
        <Textarea
          id="specialRequirements"
          placeholder="Please explain why this quantity is needed and any other relevant details."
          value={formData.specialRequirements}
          onChange={(e) => updateFormData('specialRequirements', e.target.value)}
          rows={4}
          required={isUnreasonable()}
        />
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Notify Organizations (Optional)
        </Label>
        <p className="text-sm text-muted-foreground">
          Select organizations to directly notify about your request
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {organizations.length > 0 ? (
            organizations.slice(0, 6).map((org) => (
              <div
                key={org._id || org.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <Checkbox
                  id={org._id || org.id}
                  checked={formData.pingOrganizations.includes(org._id || org.id)}
                  onCheckedChange={(checked) => {
                    const id = org._id || org.id;
                    if (checked) {
                      updateFormData('pingOrganizations', [...formData.pingOrganizations, id]);
                    } else {
                      updateFormData('pingOrganizations', formData.pingOrganizations.filter(pingId => pingId !== id));
                    }
                  }}
                />
                <label htmlFor={org._id || org.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{org.name}</span>
                    {org.isVerified && <CheckCircle className="h-3 w-3 text-verified" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{org.specialization || org.type}</p>
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic col-span-2">No registered organizations available to ping.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="container max-w-3xl py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-critical/10">
              <AlertTriangle className="h-5 w-5 text-critical" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Request a Resource</h1>
          </div>
          <p className="text-muted-foreground">
            {step < 3
              ? 'Fill in the basic details of your request.'
              : 'Provide verification details for your large quantity request.'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Location', icon: MapPin },
            { num: 2, label: 'Resource', icon: Package },
            ...(isUnreasonable() ? [{ num: 3, label: 'Verification', icon: Users }] : []),
          ].map((s, i, arr) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors ${step === s.num
                  ? 'bg-primary text-primary-foreground'
                  : step > s.num
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                  }`}
                onClick={() => {
                  if (s.num < step || (s.num === 2 && step === 1) || (s.num === 3 && step === 2 && isUnreasonable())) {
                    setStep(s.num);
                  }
                }}
              >
                {step > s.num ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline font-medium">{s.label}</span>
                <span className="sm:hidden font-medium">{s.num}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-2 ${step > s.num ? 'bg-success' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Your Location'}
              {step === 2 && 'Resource Details'}
              {step === 3 && 'Verification Details'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Where should the resource be delivered?'}
              {step === 2 && 'What resource do you need?'}
              {step === 3 && 'Help us understand your large quantity request'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step === 1 && (
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    type="button"
                    onClick={() => isUnreasonable() ? setStep(3) : handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isUnreasonable() ? 'Continue to Verification' : 'Submit Request'}
                  </Button>
                )}

                {step === 3 && (
                  <Button type="button" onClick={() => handleSubmit()} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit for Review
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {formData.urgency === 'critical' && !isUnreasonable() && (
          <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/20 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div>
              <p className="font-medium text-success">Critical requests are auto-approved</p>
              <p className="text-sm text-muted-foreground">
                Your request will be immediately visible to donors once submitted.
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
