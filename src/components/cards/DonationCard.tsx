import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Clock, Truck, User } from 'lucide-react';
import { Donation } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface DonationCardProps {
    donation: Donation;
    onClaim?: (id: string) => void;
}

export function DonationCard({ donation, onClaim }: DonationCardProps) {
    return (
        <Card className="card-elevated flex flex-col h-full overflow-hidden group">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-success/5 text-success border-success/20">
                        Available Supply
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {donation.remainingQuantity} {donation.unit} - {donation.specificResource}
                    </h3>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-grow space-y-3">
                {/* Donor Info */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                    <User className="h-3 w-3" />
                    <span>Donated by <span className="font-semibold text-foreground">{donation.donorName}</span></span>
                </div>

                {/* Location & Delivery */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                        <span className="truncate">{donation.district}, {donation.state}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {donation.canPickup && (
                            <Badge variant="secondary" className="text-[10px] py-0 h-5">
                                🏠 Pickup Available
                            </Badge>
                        )}
                        {donation.canDeliver && (
                            <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-blue-50 text-blue-700 border-blue-100 italic">
                                <Truck className="h-3 w-3 mr-1 inline" />
                                Will Deliver
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] py-0 h-5 capitalize">
                            ✨ Condition: {donation.condition}
                        </Badge>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    onClick={() => onClaim?.(donation.id)}
                >
                    Request & Claim
                </Button>
            </CardFooter>
        </Card>
    );
}
