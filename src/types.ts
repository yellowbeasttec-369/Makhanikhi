export type UserRole = 'owner' | 'specialist' | 'apprentice' | 'admin';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  emergencyContact?: string;
  address?: string;
  specialization?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  affiliations?: string[];
  accreditations?: string[];
  accomplishments?: string;
  bio?: string;
  photoURL?: string;
  isVerified?: boolean;
  isProfileComplete?: boolean;
  dob?: string;
  idNumber?: string;
  trainingPath?: 'traditional' | 'practical';
  apprenticeStartAge?: number;
  verificationStatus?: VerificationStatus;
  verificationDocs?: {
    identityUrl?: string;
    certificationUrl?: string;
    experienceUrl?: string;
    affidavitUrl?: string;
    documents?: { title: string; url: string; category: string }[];
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
  isOwnershipVerified?: boolean;
  ownershipDocs?: {
    registrationUrl?: string;
    logbookUrl?: string;
  };
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
  appointmentDate?: string;
  checklist?: SafetyChecklist;
  tasks?: ApprenticeTask[];
  signatures?: {
    owner?: { uid: string; timestamp: any };
    specialist?: { uid: string; timestamp: any };
  };
  contractSigned?: boolean;
}

export interface ApprenticeTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'signed-off';
  photoEvidence?: string;
  specialistSignOff?: {
    uid: string;
    timestamp: any;
    comments?: string;
  };
}

export interface WorkplaceReport {
  id: string;
  userId: string;
  role: UserRole;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  tasksCompleted: string[];
  signatures: {
    specialist?: { uid: string; timestamp: any };
    skillsAuthority?: { uid: string; timestamp: any; name: string };
    peerReviewer?: { uid: string; timestamp: any; industryId: string };
  };
  status: 'draft' | 'submitted' | 'validated';
}

export interface PortfolioOfEvidence {
  id: string;
  userId: string;
  title: string;
  description: string;
  documents: { title: string; url: string; type: string }[];
  validationStatus: 'pending' | 'validated' | 'rejected';
  validations: {
    validatorUid: string;
    role: 'specialist' | 'skills-authority' | 'peer-reviewer';
    timestamp: any;
    comments?: string;
  }[];
}

export interface SafetyChecklist {
  preWork: {
    ppeInspected: boolean;
    areaBarricaded: boolean;
    toolboxCheck: boolean;
    oilSpillMatsPlaced: boolean;
    siteSafe: boolean;
  };
  ohsaCompliance?: {
    workshopSetup: boolean;
    ppeWorn: boolean;
    hazardSignage: boolean;
    fireExtinguisherReady: boolean;
    firstAidKitAvailable: boolean;
    photoEvidence?: string[];
  };
  postWork: {
    siteCleared: boolean;
    toolsAccounted: boolean;
    wasteDisposed: boolean;
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
