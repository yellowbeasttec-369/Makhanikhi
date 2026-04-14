export type UserRole = 'owner' | 'specialist' | 'apprentice' | 'admin';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  specialization?: string;
  experience?: number;
  bio?: string;
  photoURL?: string;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verificationDocs?: {
    identityUrl?: string;
    certificationUrl?: string;
    experienceUrl?: string;
  };
  rating?: number;
  flagged?: boolean;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  serviceHistory: ServiceRecord[];
  faults: string[];
}

export interface ServiceRecord {
  date: string;
  type: string;
  description: string;
  mileage: number;
  specialistId: string;
}

export type ServiceStatus = 'pending' | 'quoted' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  ownerId: string;
  vehicleId: string;
  specialistId?: string;
  apprenticeId?: string;
  type: 'minor' | 'major' | 'overhaul' | 'diagnostic';
  status: ServiceStatus;
  description: string;
  callOutFee?: number;
  diagnosticQuote?: number;
  partsQuote?: number;
  totalAmount?: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
  checklist?: SafetyChecklist;
}

export interface SafetyChecklist {
  preWork: {
    ppeInspected: boolean;
    areaBarricaded: boolean;
    toolboxCheck: boolean;
    oilSpillMatsPlaced: boolean;
    siteSafe: boolean;
  };
  postWork: {
    siteCleared: boolean;
    toolsAccounted: boolean;
    wasteDisposed: boolean;
  };
}
