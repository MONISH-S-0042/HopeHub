export type UserType = 'individual' | 'organization' | 'poc';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export type ResourceCategory = 
  | 'water-sanitation'
  | 'food-nutrition'
  | 'medical-healthcare'
  | 'shelter-clothing'
  | 'transportation-fuel'
  | 'communication-equipment'
  | 'rescue-safety'
  | 'other';

export type DeliveryPreference = 'pickup' | 'delivery' | 'either';

export type RequestStatus = 
  | 'submitted'
  | 'pending-verification'
  | 'approved'
  | 'active'
  | 'matched'
  | 'in-transit'
  | 'delivered'
  | 'closed'
  | 'rejected';

export type OrganizationType = 
  | 'ngo'
  | 'hospital'
  | 'school'
  | 'government'
  | 'corporate-csr'
  | 'community-center';

export interface User {
  id: string;
  type: UserType;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  trustScore: number;
  createdAt: string;
  // Organization specific
  organizationType?: OrganizationType;
  organizationName?: string;
  specialization?: string;
  // POC specific
  district?: string;
  state?: string;
}

export interface ResourceRequest {
  id: string;
  userId: string;
  userName: string;
  userType: UserType;
  // Location
  address: string;
  landmark?: string;
  district: string;
  state: string;
  coordinates?: { lat: number; lng: number };
  // Resource details
  category: ResourceCategory;
  specificResource: string;
  quantity: number;
  unit: string;
  urgency: UrgencyLevel;
  neededBy: string;
  deliveryPreference: DeliveryPreference;
  // Additional
  peopleAffected: number;
  specialRequirements?: string;
  photoUrl?: string;
  // Status
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  // Matching
  matchedDonations?: string[];
  fulfilledQuantity: number;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorType: UserType;
  // Location
  pickupAddress: string;
  district: string;
  state: string;
  coordinates?: { lat: number; lng: number };
  // Resource details
  category: ResourceCategory;
  specificResource: string;
  quantity: number;
  unit: string;
  condition: 'new' | 'gently-used' | 'consumable';
  expiryDate?: string;
  availableUntil: string;
  // Delivery
  canDeliver: boolean;
  canPickup: boolean;
  deliveryRadius: number;
  // Status
  status: 'available' | 'matched' | 'in-transit' | 'delivered' | 'closed';
  matchedRequestId?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  specialization: string;
  description: string;
  address: string;
  district: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  impactMetrics: {
    peopleHelped: number;
    resourcesDonated: number;
    requestsFulfilled: number;
  };
  createdAt: string;
}

export interface DistrictPOC {
  id: string;
  name: string;
  designation: string;
  district: string;
  state: string;
  email: string;
  phone: string;
  officeHours: string;
  isAvailable: boolean;
}

export const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string; icon: string }[] = [
  { value: 'water-sanitation', label: 'Water & Sanitation', icon: '💧' },
  { value: 'food-nutrition', label: 'Food & Nutrition', icon: '🍚' },
  { value: 'medical-healthcare', label: 'Medical & Healthcare', icon: '🏥' },
  { value: 'shelter-clothing', label: 'Shelter & Clothing', icon: '🏠' },
  { value: 'transportation-fuel', label: 'Transportation & Fuel', icon: '🚗' },
  { value: 'communication-equipment', label: 'Communication Equipment', icon: '📱' },
  { value: 'rescue-safety', label: 'Rescue & Safety Equipment', icon: '🛟' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const URGENCY_LEVELS: { value: UrgencyLevel; label: string; description: string; color: string }[] = [
  { value: 'critical', label: 'Critical', description: 'Life-threatening - medical emergencies', color: 'critical' },
  { value: 'high', label: 'High', description: 'Within 24 hours', color: 'high-urgency' },
  { value: 'medium', label: 'Medium', description: 'Within 2-3 days', color: 'medium-urgency' },
  { value: 'low', label: 'Low', description: 'Within a week', color: 'low-urgency' },
];

export const ORGANIZATION_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'ngo', label: 'NGO' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'school', label: 'School' },
  { value: 'government', label: 'Government Agency' },
  { value: 'corporate-csr', label: 'Corporate CSR' },
  { value: 'community-center', label: 'Community Center' },
];
