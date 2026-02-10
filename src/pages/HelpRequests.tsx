import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestCard } from '@/components/cards/RequestCard';
import { Bell, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function HelpRequests() {
    const { user, isLoading: authLoading } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!user || user.type !== 'organization') return;
            try {
                const res = await fetch('/api/requests/pinged', { credentials: 'include' });
                const data = await res.json();
                setRequests(data || []);
            } catch (err) {
                console.error('Failed to load pinged requests', err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [user]);

    if (authLoading) return <div className="p-8">Loading...</div>;
    if (!user || user.type !== 'organization') return <Navigate to="/dashboard" />;

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10">
                            <Bell className="h-5 w-5 text-warning" />
                        </div>
                        <h1 className="text-2xl font-bold">Help Requests</h1>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle>Direct Requests to Your Organization</CardTitle>
                            <CardDescription>
                                These items have been specifically pinged to your organization for review and help.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex flex-col items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                    <p className="text-muted-foreground">Loading specific help requests...</p>
                                </div>
                            ) : requests.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {requests.map((request) => (
                                        <RequestCard key={request._id} request={request} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-medium mb-2">No Active Pings</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        You'll see requests here when individuals specifically ask for your organization's help.
                                    </p>
                                    <Button asChild>
                                        <Link to="/browse-requests">Browse Global Requests</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
