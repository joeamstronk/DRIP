export type SearchVector = 'phone' | 'ip' | 'subscriberId' | 'imei' | 'civilId';

export interface DeviceHistoryRecord {
  imei: string;
  model: string;
  firstSeen: string;
  lastSeen: string;
  tacCode: string;
  isCurrent: boolean;
  osVersion: string;
  dualSimSlots: number;
}

export interface PhoneHistoryRecord {
  msisdn: string;
  simImsi: string;
  activatedDate: string;
  status: 'ACTIVE' | 'PREVIOUS';
  carrier: string;
}

export interface ScoreFactor {
  label: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  detail: string;
}

export interface CreditScoreHistoryPoint {
  month: string; // e.g. "May 2026"
  monthShort: string; // e.g. "May"
  score: number; // 300 to 850
  grade: string; // e.g. "A"
  change: number; // e.g. +8, -5, 0
  changeDirection: 'UP' | 'DOWN' | 'STABLE';
  event?: string; // Telco behavioral event that drove the score
}

export interface FraudAlertTicket {
  ticketId: string;
  flaggedAt: string;
  reason: string;
  investigatorNotes: string;
  dispatchedChannels: string[];
  status: 'ACTIVE' | 'RESOLVED';
}

export interface TelcoCreditScore {
  score: number; // 300 to 850
  grade: 'A+ (Elite)' | 'A (Prime)' | 'B (Standard)' | 'C (Subprime)' | 'D (High Risk)';
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  paymentHistoryPercent: number;
  monthlyRechargeAvgIdr: number;
  simTenureMonths: number;
  deviceStabilityIndex: number;
  creditLimitIdr: number;
  postpaidEligible: boolean;
  scoreFactors: ScoreFactor[];
  scoreHistory?: CreditScoreHistoryPoint[];
  fraudAlert?: FraudAlertTicket;
}

export interface MostOpenedApp {
  appId: string;
  appName: string;
  category: string;
  iconName: string;
  openCount24h: number;
  avgSessionMinutes: number;
  lastOpened: string;
}

export interface MostDataApp {
  appId: string;
  appName: string;
  category: string;
  iconName: string;
  totalMb: number;
  foregroundMb: number;
  backgroundMb: number;
  percentOfTotal: number;
}

export interface AppUsageSummary {
  mostOpened: MostOpenedApp[];
  mostDataConsuming: MostDataApp[];
}

export interface LocationPoint {
  id: string;
  timestamp: string; // ISO string
  hourOffset: number; // 0 to 24 (hours ago)
  sourceType: 'CELL_TOWER' | 'APP_PERMISSION';
  lat: number;
  lng: number;
  locationName: string;
  // Cell Tower fields
  cellId?: string;
  lac?: string;
  azimuth?: number;
  signalStrengthDbm?: number;
  estimatedRadiusMeters?: number;
  towerName?: string;
  // App Permission fields
  appName?: string;
  appPackage?: string;
  accuracyMeters?: number;
  altitudeMeters?: number;
}

export interface IpdrSessionLog {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  sourceIp: string;
  sourcePort: number;
  natPublicIp: string;
  natPublicPort: number;
  destinationIp: string;
  destinationPort: number;
  domain: string;
  protocol: 'TCP' | 'UDP' | 'QUIC' | 'HTTPS' | 'DNS' | 'ICMP';
  applicationCategory: 'Streaming' | 'Social' | 'Messaging' | 'Web' | 'Gaming' | 'VoIP' | 'System';
  bytesIn: number;
  bytesOut: number;
  totalBytes: number;
  terminationReason: 'CLIENT_CLOSE' | 'TIMEOUT' | 'NETWORK_RST' | 'ACTIVE';
}

export interface IndividualCallRecord {
  id: string;
  timestamp: string;
  callType: 'AUDIO' | 'VIDEO';
  direction: 'OUTGOING' | 'INCOMING';
  durationSeconds: number;
  durationFormatted: string;
  relayServerIp: string;
  relayPort: number;
  protocol: 'SRTP' | 'STUN/UDP' | 'TURN';
  codec: string;
  status: 'COMPLETED' | 'MISSED' | 'DROPPED';
  packetLossPercent: number;
  jitterMs: number;
}

export interface WhatsAppContactCallGroup {
  contactPhone: string;
  contactName: string;
  contactCivilId?: string;
  linkedSubscriberId?: string; // If this contact is also in our subscriber database
  totalCallsCount: number;
  outgoingCallsCount: number;
  incomingCallsCount: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  lastCallTimestamp: string;
  individualCalls: IndividualCallRecord[];
}

export interface BillingCycleSummary {
  cyclePeriod: string;
  daysRemaining: number;
  quotaAllocatedGb: number;
  quotaUsedGb: number;
  peakHourUsageGb: number;
  offPeakUsageGb: number;
  domesticUsageGb: number;
  roamingUsageGb: number;
  overageChargesIdr: number;
  fupStatus: 'NORMAL' | 'THROTTLED' | 'TOPPED_UP';
  currentMonthlyBillIdr: number;
  projectedCycleEndUsageGb: number;
}

export interface SecurityAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  category:
    | 'BANDWIDTH_SPIKE'
    | 'RESTRICTED_ZONE'
    | 'VOIP_SURGE'
    | 'PORT_ANOMALY'
    | 'SIM_SWAP_RISK'
    | 'VELOCITY_ANOMALY';
  title: string;
  description: string;
  detectedAt: string;
  evidence: {
    label: string;
    value: string;
  }[];
  mitigationRecommendation: string;
  acknowledged?: boolean;
}

export type FamilyRelationship =
  | 'HEAD_OF_HOUSEHOLD'
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'SIBLING'
  | 'OTHER_RELATIVE';

export interface FamilyMember {
  nik: string; // 16-digit civil ID (NIK)
  name: string;
  relationship: FamilyRelationship;
  relationshipLabel: string; // e.g. "Kepala Keluarga", "Istri", "Anak", "Ayah", "Ibu"
  gender: 'MALE' | 'FEMALE';
  birthDate: string; // YYYY-MM-DD
  birthPlace: string;
  age: number;
  religion: string;
  education: string;
  occupation: string;
  maritalStatus: 'MARRIED' | 'SINGLE' | 'DIVORCED' | 'WIDOWED';
  bloodType: string;
  phone?: string; // MSISDN if registered
  carrier?: string;
  linkedSubscriberId?: string;
  telcoStatus: 'ACTIVE_SUBSCRIBER' | 'EXTERNAL_CARRIER' | 'UNREGISTERED_MINOR';
  isTargetSubscriber?: boolean;
  avatarUrl?: string;
  generation: 1 | 2 | 3; // 1: Parents, 2: Self/Spouse, 3: Children
}

export interface FamilyTreeData {
  familyCardNumber: string; // Nomor Kartu Keluarga (KK) 16 digit
  headOfHouseholdName: string;
  registeredAddress: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  postalCode: string;
  issuingDate: string;
  dukcapilRegionCode: string;
  members: FamilyMember[];
}

export interface Subscriber {
  id: string;
  name: string;
  civilId: string; // NIK
  photoUrl: string;
  phone: string; // MSISDN
  currentIp: string;
  currentIpv6: string;
  status: 'ONLINE' | 'IDLE' | 'OFFLINE';
  registeredAddress: string;
  city: string;
  planName: string;
  carrier: string;
  simCardImsi: string;
  currentImei: string;
  tacCode: string;
  deviceModel: string;
  lastActive: string;
  
  // Intelligence modules
  creditScore: TelcoCreditScore;
  appUsageSummary: AppUsageSummary;
  locationHistory: LocationPoint[];
  ipdrLogs: IpdrSessionLog[];
  whatsappCallGroups: WhatsAppContactCallGroup[];
  billingSummary: BillingCycleSummary;
  deviceHistory: DeviceHistoryRecord[];
  phoneHistory: PhoneHistoryRecord[];
  familyTree?: FamilyTreeData;
}

export interface OperatorUser {
  operatorId: string;
  name: string;
  email: string;
  role: 'NOC Lead Engineer' | 'Lawful Compliance Officer' | 'Cyber Intelligence Analyst';
  clearanceLevel: 'LEVEL_3_CONFIDENTIAL' | 'LEVEL_4_RESTRICTED' | 'LEVEL_5_TOP_SECRET';
  sessionExpiry: string;
}
