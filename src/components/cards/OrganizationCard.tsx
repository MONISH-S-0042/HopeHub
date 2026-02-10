import { Organization, ORGANIZATION_TYPES } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';

interface OrganizationCardProps {
  organization: Organization;
  onRequestHelp?: (org: Organization) => void;
}

export function OrganizationCard({ organization, onRequestHelp }: OrganizationCardProps) {
  const orgTypeLabel = ORGANIZATION_TYPES.find(t => t.value === organization.type)?.label || organization.type;

  return (
    <Card className="card-elevated hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{organization.name}</h3>
              {organization.isVerified && (
                <CheckCircle className="h-4 w-4 text-verified" />
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {orgTypeLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        <p className="text-sm text-primary font-medium">
          {organization.specialization}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {organization.description}
        </p>

        <div className="space-y-2 text-sm pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{organization.district}, {organization.state}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{organization.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{organization.email}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <Button
          className="w-full"
          onClick={() => onRequestHelp?.(organization)}
        >
          Request Help Directly
        </Button>
      </CardFooter>
    </Card>
  );
}
