import { Link } from 'react-router-dom';
import { ResourceRequest } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UrgencyBadge } from '@/components/common/UrgencyBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ResourceCategoryIcon } from '@/components/common/ResourceCategoryIcon';
import { ProgressBar } from '@/components/common/ProgressBar';
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestCardProps {
  request: ResourceRequest;
  showDonateButton?: boolean;
  onViewDonations?: (requestId: string, resourceName: string) => void;
}

export function RequestCard({ request, showDonateButton = true, onViewDonations }: RequestCardProps) {
  const timeLeft = formatDistanceToNow(new Date(request.neededBy), { addSuffix: true });

  return (
    <Card className="card-elevated hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
              <ResourceCategoryIcon category={request.category} size="md" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight">
                {request.specificResource}
              </h3>
              <p className="text-sm text-muted-foreground">
                {request.quantity} {request.unit}
              </p>
            </div>
          </div>
          <UrgencyBadge urgency={request.urgency} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={request.status} size="sm" />
        </div>

        <ProgressBar
          current={request.fulfilledQuantity}
          total={request.quantity}
          size="sm"
        />

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{request.district}, {request.state}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Needed {timeLeft}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{request.peopleAffected} people affected</span>
          </div>
        </div>

        {request.specialRequirements && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-warning pl-2">
            {request.specialRequirements}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">By </span>
            <span className="font-medium">{request.userName}</span>
          </div>
          {showDonateButton && request.status === 'active' && (
            <Button size="sm" className="group-hover:translate-x-0.5 transition-transform" asChild>
              <Link to={`/donate-to/${request.id}`}>
                Donate
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}

          {!showDonateButton && request.fulfilledQuantity > 0 && onViewDonations && (
            <Button
              size="sm"
              variant="outline"
              className="group-hover:translate-x-0.5 transition-transform border-primary/50 text-primary hover:bg-primary/5"
              onClick={() => onViewDonations(request.id, request.specificResource)}
            >
              View Donations
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
