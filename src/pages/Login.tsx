import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Building2, Shield, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeConfig = {
    individual: {
      icon: Users,
      label: 'Individual',
      description: 'Personal account for requesting or donating resources',
      demoEmail: 'individual@demo.com',
    },
    organization: {
      icon: Building2,
      label: 'Organization',
      description: 'NGO, Hospital, School, or Corporate account',
      demoEmail: 'org@demo.com',
    },
    poc: {
      icon: Shield,
      label: 'District POC',
      description: 'Government official coordinating relief efforts',
      demoEmail: 'poc@gov.in',
    },
  };

  const CurrentIcon = userTypeConfig[userType].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="font-bold text-2xl text-primary">HopeHub</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <Card className="card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In As</CardTitle>
            <CardDescription>Select your account type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="individual" className="text-xs sm:text-sm">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Individual</span>
                </TabsTrigger>
                <TabsTrigger value="organization" className="text-xs sm:text-sm">
                  <Building2 className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Org</span>
                </TabsTrigger>
                <TabsTrigger value="poc" className="text-xs sm:text-sm">
                  <Shield className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">POC</span>
                </TabsTrigger>
              </TabsList>

              {Object.entries(userTypeConfig).map(([type, config]) => (
                <TabsContent key={type} value={type} className="mt-0">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <config.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={userTypeConfig[userType].demoEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">
                Demo: Use any email with any password to login
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
