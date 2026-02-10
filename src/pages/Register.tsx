import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserType, ORGANIZATION_TYPES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Building2, Shield, Users, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as UserType) || 'individual';

  const [userType, setUserType] = useState<UserType>(initialType);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Organization specific
    organizationName: '',
    organizationType: '',
    specialization: '',
    district: '',
    state: '',
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await register({
        type: userType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        ...(userType === 'organization' && {
          organizationName: formData.organizationName,
          organizationType: formData.organizationType as any,
          specialization: formData.specialization,
          district: formData.district,
          state: formData.state,
        }),
        ...(userType === 'poc' && {
          district: formData.district,
          state: formData.state,
        }),
      });

      toast({
        title: 'Account created!',
        description: userType === 'poc'
          ? 'Your account is pending admin approval.'
          : 'Welcome to CareConnect!',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderIndividualForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">OTP verification will be sent to this number</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderOrganizationForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name</Label>
        <Input
          id="organizationName"
          placeholder="Enter organization name"
          value={formData.organizationName}
          onChange={(e) => updateFormData('organizationName', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organizationType">Organization Type</Label>
        <Select
          value={formData.organizationType}
          onValueChange={(value) => updateFormData('organizationType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {ORGANIZATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          placeholder="e.g., Medical Aid, Food Distribution"
          value={formData.specialization}
          onChange={(e) => updateFormData('specialization', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
      <div className="space-y-2">
        <Label htmlFor="name">Contact Person Name</Label>
        <Input
          id="name"
          placeholder="Enter contact person name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="org@example.com"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderPOCForm = () => (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 mb-4">
        <p className="text-sm text-warning font-medium">Government Verification Required</p>
        <p className="text-xs text-muted-foreground mt-1">
          POC registration requires government email (@gov.in or @nic.in) and admin approval.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
      <div className="space-y-2">
        <Label htmlFor="email">Government Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@gov.in or name@nic.in"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Official Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hero-gradient">
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">CareConnect</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Join the disaster relief network</p>
        </div>

        <Card className="card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Register As</CardTitle>
            <CardDescription>Select your account type</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="individual">
                  <Users className="h-4 w-4 mr-1.5" />
                  Individual
                </TabsTrigger>
                <TabsTrigger value="organization">
                  <Building2 className="h-4 w-4 mr-1.5" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="poc">
                  <Shield className="h-4 w-4 mr-1.5" />
                  POC
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="individual" className="mt-0">
                  {renderIndividualForm()}
                </TabsContent>
                <TabsContent value="organization" className="mt-0">
                  {renderOrganizationForm()}
                </TabsContent>
                <TabsContent value="poc" className="mt-0">
                  {renderPOCForm()}
                </TabsContent>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      By registering, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
