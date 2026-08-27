import { Driver, Lorry, OptimizationResult, Route, RouteStop, Shipment, SimulationResult, SystemSettings, UserRole } from '../lib/optimization/types';

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  is_verified?: boolean; // For dispatchers registered via landing page
  verification_status?: 'VERIFIED' | 'PENDING_ADMIN_VERIFICATION' | 'REJECTED';
  verification_details?: {
    freight_zone?: string;
    fleet_size?: string;
    experience_years?: number;
    phone?: string;
    notes?: string;
  };
  phone?: string;
  created_at: string;
  updated_at: string;
}

export type CustomerType = 'PERSON' | 'BUSINESS';

export interface Customer {
  id: string;
  user_id: string;
  customer_type: CustomerType;
  company_name?: string;
  contact_name: string;
  email: string;
  phone: string;
  default_billing_address?: string;
  default_city?: string;
  created_at: string;
  updated_at: string;
}

export type DeliveryEventType = 
  | 'CREATED'
  | 'ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_PICKUP'
  | 'LOADED'
  | 'PICKED_UP'
  | 'EN_ROUTE_TO_DELIVERY'
  | 'IN_TRANSIT'
  | 'ARRIVED_DESTINATION'
  | 'DELIVERY_VERIFICATION_STARTED'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'SIGNATURE_CAPTURED'
  | 'PHOTO_CAPTURED'
  | 'DELIVERED'
  | 'DELAY_REPORTED'
  | 'FAILED_DELIVERY'
  | 'EXCEPTION_FLAGGED';

export interface DeliveryEvent {
  id: string;
  shipment_id: string;
  route_id?: string;
  driver_id: string;
  driver_name?: string;
  event_type: DeliveryEventType;
  latitude?: number;
  longitude?: number;
  notes?: string;
  recipient_name?: string;
  signature_svg?: string;
  attachment_path?: string;
  created_at: string;
}

export interface DeliveryVerification {
  id: string;
  shipment_id: string;
  driver_id: string;
  otp_code: string;
  otp_expires_at: string; // ISO date (10 minutes from creation)
  otp_attempts: number;
  max_attempts: number;
  is_verified: boolean;
  verified_at?: string;
  receiver_name?: string;
  signature_svg?: string;
  photo_data_url?: string;
  delivery_notes?: string;
  verification_latitude?: number;
  verification_longitude?: number;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'SHIPMENT_CREATED'
  | 'SHIPMENT_ASSIGNED'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP_COMPLETED'
  | 'SHIPMENT_IN_TRANSIT'
  | 'ETA_UPDATED'
  | 'DELIVERY_DELAY'
  | 'ARRIVING_DESTINATION'
  | 'DELIVERY_OTP_SENT'
  | 'DELIVERY_COMPLETED'
  | 'DISPATCHER_PENDING_APPROVAL';

export interface Notification {
  id: string;
  user_id: string; // Or user email
  shipment_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export type SupportIssueType =
  | 'DELAY_INQUIRY'
  | 'DAMAGED_CARGO'
  | 'WRONG_DESTINATION'
  | 'BILLING_INQUIRY'
  | 'GENERAL_SUPPORT';

export interface CustomerSupportTicket {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  shipment_id?: string;
  issue_type: SupportIssueType;
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  created_at: string;
  updated_at: string;
}

export interface SystemAlert {
  id: string;
  type: 'DEADLINE_RISK' | 'LORRY_BREAKDOWN' | 'DRIVER_DELAY' | 'CAPACITY_BREACH' | 'REOPTIMIZATION_REQUIRED' | 'SECURITY_FLAG' | 'DISPATCHER_APPLICATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  message: string;
  shipment_id?: string;
  lorry_id?: string;
  driver_id?: string;
  route_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  user_role: UserRole;
  action: string;
  entity: string;
  entity_id?: string;
  before_data?: Record<string, any> | null;
  after_data?: Record<string, any> | null;
  created_at: string;
}

export interface HealthCheckStatus {
  service: 'Firebase Auth' | 'Supabase PostgreSQL' | 'Supabase Realtime' | 'Supabase Storage' | 'Groq AI' | 'Fleet Optimization Engine';
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latency_ms: number;
  last_checked: string;
  details: string;
}
