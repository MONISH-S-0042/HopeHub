import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { HeartHandshake, Loader2, MapPin, Package, ArrowLeft } from 'lucide-react';

export default function DonateToRequest() {
    const { requestId } = useParams();
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        quantity: '',
        pickupAddress: '',
        district: '',
        state: '',
    });

    // Pre-fill user data when it's available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                district: user.district || '',
                state: user.state || '',
            }));
        }
    }, [user]);

    // Fetch target request details
    useEffect(() => {
        async function fetchRequest() {
            try {
                const res = await fetch(`/api/requests`, { credentials: 'include' });
                const data = await res.json();
                const found = data.find((r: any) => (r.id || r._id) === requestId);
                if (found) {
                    setRequest(found);
                } else {
                    toast({ title: 'Request not found', variant: 'destructive' });
                    navigate('/browse');
                }
            } catch (err) {
                console.error('Fetch error', err);
            } finally {
                setLoading(false);
            }
        }
        fetchRequest();
    }, [requestId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestId) return;

        const phoneRegex = /^(\+91)?\s?[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            return toast({
                title: 'Invalid phone number',
                description: 'Please enter a valid 10-digit Indian phone number.',
                variant: 'destructive',
            });
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/requests/${requestId}/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Donation failed');
            }

            toast({
                title: 'Thank you for your donation!',
                description: `You've successfully committed to providing ${formData.quantity} units.`,
            });
            navigate('/dashboard');
        } catch (err: any) {
            toast({
                title: 'Donation failed',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <MainLayout>
                <div className="container py-12 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!user) return <Navigate to="/login" />;

    return (
        <MainLayout>
            <div className="container py-8 max-w-4xl">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="md:col-span-2">
                        <Card className="card-elevated border-primary/20">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="flex items-center gap-2">
                                    <HeartHandshake className="h-5 w-5 text-primary" />
                                    Your Donation Details
                                </CardTitle>
                                <CardDescription>
                                    Confirm how much you can contribute and where it can be picked up.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                disabled // Keep basic info consistent with profile
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">
                                            Quantity to Donate (Target: {request?.quantity - request?.fulfilledQuantity} {request?.unit} remaining)
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            placeholder={`Max ${request?.quantity - request?.fulfilledQuantity}`}
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pickupAddress">Pickup Address</Label>
                                        <Textarea
                                            id="pickupAddress"
                                            placeholder="Street address where resources are located..."
                                            value={formData.pickupAddress}
                                            onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="district">District</Label>
                                            <Input
                                                id="district"
                                                value={formData.district}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm Donation'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Request Info Side */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-lg">Donating To</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Package className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-semibold">{request?.specificResource}</div>
                                        <div className="text-sm text-muted-foreground">{request?.category}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{request?.district}, {request?.state}</span>
                                    </div>
                                    <div className="p-3 border rounded-md text-xs text-muted-foreground bg-amber-50/30 border-amber-200/50">
                                        <strong>Note:</strong> Most requesters need items delivered, but they can pick up if you specify a valid address.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
