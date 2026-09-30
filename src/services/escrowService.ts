// ============================================================================
// Makhanikhi Web3 & Smart Escrow Protocol Service
// Governs client connection fees, mechanic platform fees, gamified ranking
// discounts, and the strict 90%+ 3-pillar compliance oracle verification.
// ============================================================================

export interface EscrowComplianceData {
  // Pillar 1: Company Incorporation (35 points max)
  jurisdiction: 'ZA' | 'US' | 'GLOBAL';
  cipcRegistrationNumber?: string;
  cipcCertificateUploaded: boolean;
  cipcAnnualReturnsProof: boolean;
  bizeeFilingId?: string;
  bizeeArticlesUploaded: boolean;
  bizeeAnnualReportProof: boolean;
  globalRegistrationNumber?: string;
  globalCertificateUploaded: boolean;

  // Pillar 2: Mechanic Safety & Personal Readiness (35 points max)
  liveSubstanceTestProof: boolean;
  substanceTestTimestamp?: string;
  substanceTestMediaUrl?: string; // photo or video
  ppeSteelToeBoots: boolean;
  ppeOverallsFlameRetardant: boolean;
  ppeEyeGoggles: boolean;
  ppeMechanicGloves: boolean;

  // Pillar 3: Site Readiness & Specialized Toolset (30 points max)
  brandedGazeboDeployed: boolean;
  gazeboWallCoveringsDeployed: boolean; // MANDATORY: Wall coverings to stop water ingress & rain
  gazeboWallCoveringsVerified: boolean; // Photo / video proof of side wall curtains
  demarcationMethod: 'cones' | 'sand_bottles_6';
  dangerTapePerimeterSet: boolean;
  oilSpillMatDeployed: boolean; // MANDATORY: Driveway oil spill mat
  oilSpillMatProofType: 'photo' | '15s_video';
  oilSpillMatMediaUrl?: string;
  oilSpillMatVerified: boolean; // Must have photo or 15s video proof
  toolboxType: 'specialized_mechanic_box' | 'cooler_box' | 'plastic_bucket' | 'unorganized_carton';
  toolboxPhotoUrl?: string;
  toolboxParsedTimestamp?: string;
}

export interface EscrowStateRecord {
  jobId: string;
  clientName: string;
  clientWallet: string;
  mechanicName: string;
  mechanicWallet: string;
  currency: 'ZARU' | 'ZAR';
  jobAmount: number; // in ZAR / ZARU (1 ZARU = 1 ZAR)
  zaruEquivalent: number;
  clientPlatformFeeBps: number; // 10% to 15% (e.g. 1000 to 1500 bps)
  mechanicPlatformFeeBps: number; // Flexible up to 12% (e.g. 800 to 1200 bps)
  clientConnectionFee: number;
  basePlatformFee: number;
  appliedPlatformFee: number;
  rankDiscountApplied: boolean;
  discountPercentage: number;
  netMechanicPayout: number;
  totalPlatformRevenue: number;
  complianceScore: number; // 0 - 100%
  pillar1Score: number; // max 35
  pillar2Score: number; // max 35
  pillar3Score: number; // max 30
  isDisqualified: boolean;
  disqualificationReason?: string;
  isUnlocked: boolean; // complianceScore >= 90%
  status: 'awaiting_deposit' | 'funds_locked' | 'audited' | 'released' | 'refunded';
  txHash?: string; // Strictly transaction hashes on-chain
  storageBucketUrl?: string; // Cloud storage bucket URI for private documents/agreements (NEVER hashed on-chain)
  vaultAddress: string;
  timestamp: string;
  fairTradeComplianceVerified?: boolean;
  roadworthyInspectionPassed?: boolean;
  apprenticeRemuneratedConfirmed?: boolean; // Simple confirmation (private amounts hidden from client)
}

export const ZARU_EXPLANATION = {
  name: 'ZARU Digital Rand',
  ratio: '1 ZARU = R 1.00',
  simpleSummary: 'Safe digital South African Rand. 1 ZARU is always equal to 1 Cash Rand, backed 100% by money kept safely inside registered South African commercial banks.',
  humanExplanation: 'When you book a service, your money is converted into ZARU and locked into a safe digital lockbox (escrow). The mechanic cannot run away with it, and your money is never at risk of internet coins going up or down. Once your car is repaired, tested, and you give 4 or 5 stars, the ZARU is safely paid over to the mechanic.',
  institutionalVocabulary: 'Tier-1 Regulated Bank-Custodied 1:1 Rand Stablecoin Escrow Protocol',
  fairTradeMotorStandards: 'Motor Industry Consumer Protection & Fair Trade Code: Honest pricing, no phantom parts, and payment strictly conditioned on visible deliverables.',
  roadworthyInspectionStandards: 'Certified Technical Roadworthy & Safety Standards: Comprehensive multi-point steering, braking, electrical, and leak inspection before road release.'
};

export interface MechanicRanking {
  mechanicId: string;
  name: string;
  currentRating: number;
  consecutiveFiveStarMonths: number;
  trainsApprentices: boolean;
  fairlyCompensatesApprentices: boolean;
  cpdPoints: number; // Continuous Professional Development
  rulesGameCompleted: boolean;
  eligibleFor15PercentDiscount: boolean;
  lifetimeJobs: number;
}

export interface ClientKudos {
  clientId: string;
  ratingsGiven: number;
  kudosScore: number;
  connectionFeeDiscount: number; // e.g. 10% off connection fee
  tier: 'Silver Patron' | 'Gold Patron' | 'VIP Fleet Sponsor';
}

/**
 * Calculates the 3-Pillar Compliance Score:
 * Total: 100 points
 * Required: >= 90% to release escrow payout!
 */
export function calculateComplianceScore(data: EscrowComplianceData): {
  totalScore: number;
  pillar1: number;
  pillar2: number;
  pillar3: number;
  disqualified: boolean;
  disqualificationReason?: string;
  passedThreshold: boolean;
} {
  // Check for Oil Spill Mat Hard Gate (Driveway Environmental Protection)
  if (!data.oilSpillMatDeployed || !data.oilSpillMatVerified) {
    return {
      totalScore: 0,
      pillar1: 0,
      pillar2: 0,
      pillar3: 0,
      disqualified: true,
      disqualificationReason: 'HARD-LOCK TRIGGERED: Oil spill mats must be deployed beneath the vehicle before commencing service. Work is blocked without verified photographic or 15-second video proof.',
      passedThreshold: false
    };
  }

  // Check for toolbox disqualification
  if (data.toolboxType === 'cooler_box') {
    return {
      totalScore: 0,
      pillar1: 0,
      pillar2: 0,
      pillar3: 0,
      disqualified: true,
      disqualificationReason: 'DISQUALIFIED: Tool container is a cooler box. Mechanic toolset must be in a certified, specialized mechanic toolbox.',
      passedThreshold: false
    };
  }

  if (data.toolboxType === 'plastic_bucket' || data.toolboxType === 'unorganized_carton') {
    return {
      totalScore: 0,
      pillar1: 0,
      pillar2: 0,
      pillar3: 0,
      disqualified: true,
      disqualificationReason: 'DISQUALIFIED: Improper tool container. Unorganized containers or buckets are forbidden on Makhanikhi sites.',
      passedThreshold: false
    };
  }

  // Pillar 1: Incorporation (Max 35 points)
  let p1 = 0;
  if (data.jurisdiction === 'ZA') {
    if (data.cipcCertificateUploaded && (data.cipcRegistrationNumber?.trim().length || 0) > 4) p1 += 20;
    if (data.cipcAnnualReturnsProof) p1 += 15;
  } else if (data.jurisdiction === 'US') {
    if (data.bizeeArticlesUploaded && (data.bizeeFilingId?.trim().length || 0) > 4) p1 += 20;
    if (data.bizeeAnnualReportProof) p1 += 15;
  } else {
    if (data.globalCertificateUploaded && (data.globalRegistrationNumber?.trim().length || 0) > 4) p1 += 20;
    p1 += 15; // International active standing
  }

  // Pillar 2: Safety & Live Substance Test (Max 35 points)
  let p2 = 0;
  if (data.liveSubstanceTestProof) p2 += 20; // 20 points for live timestamped substance test
  let ppeCount = 0;
  if (data.ppeSteelToeBoots) ppeCount++;
  if (data.ppeOverallsFlameRetardant) ppeCount++;
  if (data.ppeEyeGoggles) ppeCount++;
  if (data.ppeMechanicGloves) ppeCount++;
  p2 += Math.round((ppeCount / 4) * 15); // up to 15 points for full PPE

  // Pillar 3: Site Readiness & Specialized Toolset (Max 30 points)
  let p3 = 0;
  if (data.brandedGazeboDeployed) p3 += 5;
  if (data.gazeboWallCoveringsDeployed && data.gazeboWallCoveringsVerified) p3 += 5; // Waterproof wall curtains against water ingress
  if (data.dangerTapePerimeterSet) p3 += 6; // demarcated working area
  if (data.oilSpillMatDeployed && data.oilSpillMatVerified) p3 += 7; // Verified oil spill mat deployed
  if (data.toolboxType === 'specialized_mechanic_box') p3 += 7; // certified mechanic toolbox

  const total = Math.min(100, p1 + p2 + p3);
  return {
    totalScore: total,
    pillar1: p1,
    pillar2: p2,
    pillar3: p3,
    disqualified: false,
    passedThreshold: total >= 90
  };
}

export type JobWeatherCategory = 'minor_enclosed' | 'medium_sheltered' | 'heavy_subgrade';

export function evaluateWeatherWorkViability(
  serviceType: string,
  weather: {
    rainProbability: number; // 0 - 100%
    precipitationMm: number;
    windSpeedKmh: number;
    temperatureC: number;
    isLightningDetected?: boolean;
  },
  hasGazeboWithWalls: boolean
): {
  isPermitted: boolean;
  category: JobWeatherCategory;
  heatStressAlert: 'none' | 'caution' | 'warning' | 'danger';
  reason: string;
  advisory: string;
} {
  // Determine service category
  const lower = serviceType.toLowerCase();
  let category: JobWeatherCategory = 'minor_enclosed';
  if (lower.includes('gearbox') || lower.includes('clutch') || lower.includes('engine drop') || lower.includes('subframe')) {
    category = 'heavy_subgrade';
  } else if (lower.includes('brake') || lower.includes('suspension') || lower.includes('radiator')) {
    category = 'medium_sheltered';
  } else {
    // Air filter, spark plugs, battery, diagnostic scan, roadside assistance
    category = 'minor_enclosed';
  }

  // Ergonomic & Heat Stress Safeguard (WBGT indicator)
  let heatStressAlert: 'none' | 'caution' | 'warning' | 'danger' = 'none';
  if (weather.temperatureC >= 38) {
    heatStressAlert = 'danger';
  } else if (weather.temperatureC >= 34) {
    heatStressAlert = 'warning';
  } else if (weather.temperatureC >= 30) {
    heatStressAlert = 'caution';
  }

  // Severe Lightning Hazard
  if (weather.isLightningDetected) {
    return {
      isPermitted: false,
      category,
      heatStressAlert,
      reason: 'ELECTRICAL STORM DETECTED: Mobile outdoor service is halted for technician lightning safety.',
      advisory: 'Wait for lightning cell to pass (minimum 30 minutes clear radar).'
    };
  }

  // Heavy subgrade repair in the rain
  if (category === 'heavy_subgrade' && (weather.precipitationMm > 1.5 || weather.rainProbability > 60)) {
    return {
      isPermitted: false,
      category,
      heatStressAlert,
      reason: 'HEAVY SUBGRADE RISK: Underbody ground operations (gearbox/transmission) cannot safely occur with ground runoff and rain.',
      advisory: 'Reschedule subgrade repair or divert vehicle to an enclosed brick-and-mortar hoist facility.'
    };
  }

  // Minor or medium work in light rain
  if (weather.precipitationMm > 0.5 || weather.rainProbability > 40) {
    if (!hasGazeboWithWalls) {
      return {
        isPermitted: false,
        category,
        heatStressAlert,
        reason: 'WATER INGRESS RISK: Rain detected, but Gazebo with Wall Coverings has not been verified.',
        advisory: 'Deploy branded gazebo with side wall curtains and upload verification photo/video to unlock work.'
      };
    }
  }

  // Permitted
  return {
    isPermitted: true,
    category,
    heatStressAlert,
    reason: hasGazeboWithWalls 
      ? 'WEATHER PROTECTED: Gazebo with sealed wall coverings active. Mobile workshop insulated from water ingress.'
      : 'FAVORABLE WEATHER: Clear environmental conditions.',
    advisory: heatStressAlert !== 'none'
      ? `Heat stress advisory active (${weather.temperatureC}°C). Hydrate every 20 minutes and utilize shaded rest intervals.`
      : 'All mobile service operations authorized.'
  };
}

/**
 * Calculates fee breakdown with the gamified ranking discount:
 * - Client fee: 10% to 15% (scaled across platform volume)
 * - Mechanic platform fee: flexible rate up to 12% (base 10%, discountable down by ranking)
 * Both terms are visible upon respective sign-up.
 */
export function calculateEscrowFinancials(
  jobAmount: number,
  mechanicRank: MechanicRanking,
  clientKudos?: ClientKudos,
  customClientFeeRate?: number, // 0.10 to 0.15
  customMechanicFeeRate?: number // flexible up to 0.12
): {
  clientConnectionFee: number;
  clientFeeRatePercent: number;
  basePlatformFee: number;
  mechanicFeeRatePercent: number;
  appliedPlatformFee: number;
  discountPercentage: number;
  netMechanicPayout: number;
  totalPlatformRevenue: number;
} {
  // Client Connection Fee is 10% to 15% (default 12%)
  let clientRate = customClientFeeRate || 0.12;
  clientRate = Math.min(0.15, Math.max(0.10, clientRate));

  if (clientKudos && clientKudos.connectionFeeDiscount > 0) {
    clientRate = Math.max(0.10, clientRate * (1 - clientKudos.connectionFeeDiscount / 100));
  }
  const clientConnectionFee = Math.round(jobAmount * clientRate);

  // Mechanic Platform Fee is flexible up to 12% (default 10% base)
  let mechanicRate = customMechanicFeeRate || 0.10;
  mechanicRate = Math.min(0.12, Math.max(0.06, mechanicRate));
  const basePlatformFee = Math.round(jobAmount * mechanicRate);

  // Check 15% discount eligibility for high-ranking mentors
  const is15PercentEligible = 
    mechanicRank.consecutiveFiveStarMonths >= 3 && 
    mechanicRank.trainsApprentices && 
    mechanicRank.fairlyCompensatesApprentices;

  const discountPercentage = is15PercentEligible ? 15 : 0;
  const appliedPlatformFee = is15PercentEligible 
    ? Math.round(basePlatformFee * 0.85) 
    : basePlatformFee;

  const netMechanicPayout = jobAmount - appliedPlatformFee;
  const totalPlatformRevenue = clientConnectionFee + appliedPlatformFee;

  return {
    clientConnectionFee,
    clientFeeRatePercent: Math.round(clientRate * 100),
    basePlatformFee,
    mechanicFeeRatePercent: Math.round(mechanicRate * 100),
    appliedPlatformFee,
    discountPercentage,
    netMechanicPayout,
    totalPlatformRevenue
  };
}

export const STORAGE_BUCKET_BLOCKCHAIN_POLICY = {
  rule: 'Off-Chain Storage Bucket & On-Chain Financial Hashing',
  documentStorage: 'Uploaded documents, vehicle rental leases, and generated agreements are uploaded to a cloud storage bucket (e.g. gs://makhanikhi-vault/agreements/...) for user-facing viewing and auditing.',
  blockchainHashing: 'Uploaded documents or generated agreements are NEVER hashed on-chain to protect proprietary business operations and document privacy. Every financial transaction, escrow deposit, release, and state transition is strictly hashed on-chain (txHash).'
};
