import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, Loader2, Calendar, User, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Donation {
    _id: string;
    donorName: string;
    donorType: string;
    quantity: number;
    unit: string;
    pickupAddress?: string;
    district?: string;
    state?: string;
    createdAt: string;
}

interface DonationDetailsModalProps {
    requestId: string | null;
    resourceName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function DonationDetailsModal({ requestId, resourceName, isOpen, onClose }: DonationDetailsModalProps) {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && requestId) {
            fetchDonations();
        }
    }, [isOpen, requestId]);

    async function fetchDonations() {
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${requestId}/donations`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setDonations(data);
            }
        } catch (err) {
            console.error('Failed to fetch donations', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl italic font-bold text-primary">
                        <HeartHandshake className="h-6 w-6" />
                        Donation Details
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Contributions for <span className="font-semibold text-foreground">"{resourceName}"</span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-6 pt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading donation history...</p>
                        </div>
                    ) : donations.length > 0 ? (
                        <div className="space-y-4">
                            {donations.map((d) => (
                                <div key={d._id} className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm leading-none">{d.donorName}</p>
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1 capitalize leading-none">
                                                    {d.donorType}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-primary font-bold">
                                                <Package className="h-4 w-4" />
                                                <span>{d.quantity} {d.unit}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>

                                    {(d.pickupAddress || d.district) && (
                                        <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground flex items-start gap-2">
                                            <div className="h-4 w-4 mt-0.5 opacity-70">📍</div>
                                            <div>
                                                {d.pickupAddress && <span>{d.pickupAddress}, </span>}
                                                {d.district && <span>{d.district}, </span>}
                                                {d.state && <span>{d.state}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center gap-3">
                            <Package className="h-12 w-12 text-muted-foreground/20" />
                            <p className="text-muted-foreground">No donations received for this request yet.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
