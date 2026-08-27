export type UserRole = 'CUSTOMER' | 'DISPATCHER' | 'DRIVER' | 'MANAGER' | 'ADMIN';

export type LorryStatus = 'AVAILABLE' | 'ON_ROUTE' | 'LOADING' | 'UNAVAILABLE' | 'MAINTENANCE' | 'OFFLINE';

export type DriverStatus = 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' | 'RESTING' | 'UNAVAILABLE';

export type ShipmentStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_DISPATCH'
  | 'PENDING'
  | 'ACCEPTED'
  | 'ASSIGNMENT_PENDING'
  | 'ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DISPATCHED'
  | 'ARRIVED_DESTINATION'
  | 'ARRIVED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_VERIFICATION'
  | 'DELIVERED'
  | 'DELAYED'
  | 'REROUTED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'FAILED_DELIVERY'
  | 'REQUIRES_REOPTIMIZATION'
  | 'UNASSIGNED';

export type ShipmentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ShipmentCategory = 
  | 'GENERAL' 
  | 'PERISHABLE' 
  | 'HAZARDOUS' 
  | 'FRAGILE' 
  | 'TEXTILE' 
  | 'ELECTRONICS' 
  | 'AUTOMOTIVE' 
  | 'AGRICULTURE' 
  | 'FOOD'
  | 'INDUSTRIAL'
  | 'DOCUMENTS'
  | 'MEDICAL'
  | 'OTHER';

export type StopType = 'PICKUP' | 'DELIVERY';
export type StopStatus = 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED';

export type DeadlineClassification = 'SAFE' | 'AT_RISK' | 'BREACHED';

export type UnassignedReason = 
  | 'INSUFFICIENT_WEIGHT_CAPACITY' 
  | 'INSUFFICIENT_VOLUME_CAPACITY' 
  | 'NO_AVAILABLE_DRIVER' 
  | 'NO_AVAILABLE_LORRY' 
  | 'DEADLINE_INFEASIBLE' 
  | 'DOCUMENT_EXPIRED'
  | 'VEHICLE_MAINTENANCE'
  | 'NO_COMPATIBLE_ROUTE';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPoint extends Coordinates {
  address: string;
  city: string;
  state: string;
}

export interface Lorry {
  id: string;
  lorry_code: string;
  registration_number: string;
  model: string;
  image_url?: string;
  max_weight_kg: number;
  max_volume_m3: number;
  fuel_efficiency_km_per_l: number;
  current_lat: number;
  current_lng: number;
  current_address?: string;
  status: LorryStatus;
  driver_id?: string | null;
  assigned_driver_id?: string | null;
  assigned_driver_name?: string;
  is_refrigerated?: boolean;
  engine_status?: 'ON' | 'OFF' | 'UNKNOWN';
  engine_source?: 'TELEMATICS' | 'DRIVER_REPORTED' | 'MANUAL' | 'UNKNOWN';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone: string;
  license_number: string;
  current_lat: number;
  current_lng: number;
  availability_status: DriverStatus;
  shift_start: string; // "06:00"
  shift_end: string;   // "18:00"
  assigned_lorry_id?: string | null;
  performance_score?: number; // 0-100
  total_deliveries?: number;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  shipment_code: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;

  // Sender Details
  sender_type?: 'PERSON' | 'BUSINESS';
  sender_name?: string;
  sender_company?: string;
  sender_email?: string;
  sender_phone?: string;
  sender_address_line1?: string;
  sender_address_line2?: string;
  sender_city?: string;
  sender_state?: string;
  sender_postal_code?: string;
  sender_country?: string;

  // Receiver Details (Critical for Delivery Verification)
  receiver_type?: 'PERSON' | 'BUSINESS';
  receiver_name?: string;
  receiver_company?: string;
  receiver_email?: string;
  receiver_phone?: string;
  receiver_address_line1?: string;
  receiver_address_line2?: string;
  receiver_city?: string;
  receiver_state?: string;
  receiver_postal_code?: string;
  receiver_country?: string;

  // Legacy/Computed Coordinate points
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  pickup_city: string;
  destination_lat: number;
  destination_lng: number;
  destination_address: string;
  destination_city: string;

  // Package Specifications
  description: string;
  weight_kg: number;
  volume_m3: number;
  package_count?: number;
  fragile?: boolean;
  category: ShipmentCategory;
  priority: ShipmentPriority;
  special_instructions?: string;

  // Timelines & Scheduling
  pickup_time?: string;
  delivery_deadline: string; // ISO date string
  estimated_arrival?: string;
  actual_delivery_time?: string;

  // Lifecycle Status & Assignments
  status: ShipmentStatus;
  assigned_lorry_id?: string | null;
  assigned_lorry_code?: string | null;
  assigned_driver_id?: string | null;
  assigned_driver_name?: string | null;
  assigned_route_id?: string | null;
  assigned_route_code?: string | null;

  // OTP & Proof of Delivery Metadata
  otp_verified_at?: string;
  proof_of_delivery_path?: string;
  signature_path?: string;
  receiver_verified_name?: string;
  delivery_notes?: string;

  value_inr?: number;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  shipment_id: string;
  stop_sequence: number;
  stop_type: StopType;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  arrival_eta: string; // ISO string
  deadline: string; // ISO string
  status: StopStatus;
  actual_arrival?: string;
  actual_departure?: string;
  notes?: string;
}

export interface Route {
  id: string;
  route_code: string;
  lorry_id: string;
  lorry_code?: string;
  driver_id: string;
  driver_name?: string;
  optimization_run_id?: string;
  total_distance_km: number;
  estimated_duration_minutes: number;
  fuel_consumption_liters: number;
  estimated_cost: number;
  status: 'PLANNED' | 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  stops: RouteStop[];
  shipment_ids: string[];
  total_weight_kg: number;
  total_volume_m3: number;
  weight_utilization_pct: number;
  volume_utilization_pct: number;
  created_at: string;
  updated_at: string;
}

export interface ShipmentGroup {
  id: string;
  group_code: string;
  shipments: Shipment[];
  total_weight_kg: number;
  total_volume_m3: number;
  destination_corridor: string;
  earliest_deadline: string;
  highest_priority: ShipmentPriority;
}

export interface LorryCandidateScore {
  lorry: Lorry;
  driver?: Driver;
  group: ShipmentGroup;
  deadhead_distance_km: number;
  delivery_distance_km: number;
  total_distance_km: number;
  fuel_consumption_liters: number;
  fuel_cost_inr: number;
  total_cost_inr: number;
  weight_utilization_pct: number;
  volume_utilization_pct: number;
  eta_hours: number;
  is_deadline_feasible: boolean;
  deadline_status: DeadlineClassification;
  composite_score: number; // Lower is better or higher is better
  explanation_points: string[];
}

export interface Assignment {
  lorry_id: string;
  lorry_code: string;
  driver_id: string;
  driver_name: string;
  shipment_ids: string[];
  route: Route;
  score_details: LorryCandidateScore;
  ai_explanation?: string;
}

export interface UnassignedShipmentDiagnosis {
  shipment: Shipment;
  reason: UnassignedReason;
  required_capacity_kg: number;
  available_capacity_kg: number;
  required_volume_m3: number;
  available_volume_m3: number;
  deadline_issue: string;
  suggested_action: string;
}

export interface OptimizationMetrics {
  total_lorries_used: number;
  total_distance_km: number;
  total_fuel_liters: number;
  total_cost_inr: number;
  late_shipments_count: number;
  on_time_percentage: number;
  avg_capacity_utilization_pct: number;
}

export interface OptimizationResult {
  run_id: string;
  timestamp: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  before_metrics: OptimizationMetrics;
  after_metrics: OptimizationMetrics;
  savings: {
    cost_inr: number;
    cost_savings_pct: number;
    fuel_liters: number;
    fuel_savings_pct: number;
    distance_km: number;
    distance_savings_pct: number;
    lorries_saved: number;
  };
  assignments: Assignment[];
  unassigned: UnassignedShipmentDiagnosis[];
  groups: ShipmentGroup[];
  steps_completed: string[];
  execution_time_ms: number;
}

export interface SystemSettings {
  id: string;
  fuel_price_per_liter: number; // e.g. 96.50 INR
  driver_base_rate_per_km: number; // e.g. 6.00 INR
  operating_cost_per_km: number; // e.g. 3.00 INR (tire, maintenance, lubricant)
  fixed_dispatch_cost_per_lorry: number; // e.g. 800.00 INR
  auto_dispatch_high_priority: boolean; // Auto dispatch when criteria satisfied
  route_deviation_threshold_km: number; // e.g. 1.5 km
  weight_fuel_cost: number; // Weight in optimization scoring (0-1)
  weight_distance: number;
  weight_deadline_risk: number;
  weight_capacity_utilization: number;
  weight_vehicle_reduction: number;
  average_speed_km_per_h: number; // 45 km/h
  loading_time_minutes: number;   // 30 mins
  service_time_per_stop_mins: number; // 20 mins
  road_distance_factor: number;  // 1.28
  updated_at: string;
}

export interface TripCostBreakdown {
  distance_km: number;
  fuel_liters: number;
  fuel_cost_inr: number;
  toll_cost_estimated_inr: number;
  toll_cost_actual_inr?: number;
  driver_cost_inr: number;
  operating_cost_inr: number;
  other_expenses_inr: number;
  total_estimated_inr: number;
  total_actual_inr?: number;
  cost_variance_inr?: number;
}

export interface CargoTransferRecord {
  id: string;
  breakdown_id: string;
  old_lorry_id: string;
  old_lorry_code: string;
  new_lorry_id: string;
  new_lorry_code: string;
  driver_id: string;
  driver_name: string;
  shipment_ids: string[];
  total_cargo_weight_kg: number;
  transfer_location_address: string;
  transfer_lat: number;
  transfer_lng: number;
  status: 'PENDING_TRANSFER' | 'TRANSFERRED';
  transferred_at?: string;
  created_at: string;
}

export interface DisruptionEvent {
  id: string;
  type: 'LORRY_BREAKDOWN' | 'DRIVER_UNAVAILABLE' | 'TRAFFIC_DELAY' | 'URGENT_SHIPMENT' | 'SHIPMENT_CANCELLED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  entity_id: string;
  title: string;
  description: string;
  timestamp: string;
  affected_route_ids: string[];
  affected_shipment_ids: string[];
  status: 'PENDING_REOPTIMIZATION' | 'RESOLVED' | 'DISMISSED';
}

export interface ReoptimizationDelta {
  disruption: DisruptionEvent;
  original_plan: {
    cost_inr: number;
    fuel_liters: number;
    distance_km: number;
    routes_count: number;
    late_deliveries: number;
  };
  new_plan: {
    cost_inr: number;
    fuel_liters: number;
    distance_km: number;
    routes_count: number;
    late_deliveries: number;
  };
  diff: {
    cost_delta_inr: number;
    fuel_delta_liters: number;
    distance_delta_km: number;
    sla_impact: string;
  };
  recommended_actions: string[];
  new_assignments: Assignment[];
}

export interface WhatIfScenarioInput {
  scenario_type: 'LORRY_FAILURE' | 'DRIVER_UNAVAILABLE' | 'URGENT_SHIPMENT' | 'FUEL_PRICE_SPIKE' | 'SHIPMENT_CANCELLATION' | 'CAPACITY_REDUCTION' | 'ROUTE_DELAY';
  target_entity_id?: string;
  fuel_price_delta?: number;
  capacity_reduction_pct?: number;
  delay_minutes?: number;
  new_shipment?: Partial<Shipment>;
}

export interface SimulationResult {
  id: string;
  scenario: WhatIfScenarioInput;
  timestamp: string;
  original_metrics: OptimizationMetrics;
  simulated_metrics: OptimizationMetrics;
  cost_difference: number;
  fuel_difference: number;
  distance_difference: number;
  deadline_impact: string;
  ai_evaluation: string;
}

// ==========================================
// FLEET MANAGEMENT EXTENSIONS
// ==========================================

export type TripStatus = 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'INTERRUPTED';

export interface Trip {
  id: string;
  trip_code: string;
  lorry_id: string;
  lorry_code: string;
  driver_id: string;
  driver_name: string;
  shipment_ids: string[];
  origin_city: string;
  destination_city: string;
  stops_count: number;
  route_id?: string;
  start_time: string; // ISO date string
  eta: string;
  actual_completion_time?: string;
  distance_km: number;
  fuel_liters: number;
  estimated_cost_inr: number;
  actual_cost_inr?: number;
  status: TripStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type MaintenanceType =
  | 'REGULAR_SERVICE'
  | 'OIL_CHANGE'
  | 'TIRE_ROTATION'
  | 'BRAKE_OVERHAUL'
  | 'ENGINE_TUNING'
  | 'INSPECTION'
  | 'EMERGENCY_REPAIR';

export interface MaintenanceRecord {
  id: string;
  lorry_id: string;
  lorry_code: string;
  service_type: MaintenanceType;
  last_service_date: string;
  next_service_date: string;
  odometer_km: number;
  maintenance_cost_inr: number;
  vendor_workshop: string;
  notes?: string;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
}

export interface FuelRecord {
  id: string;
  lorry_id: string;
  lorry_code: string;
  driver_id?: string;
  driver_name?: string;
  date: string;
  fuel_quantity_liters: number;
  fuel_price_per_liter: number;
  total_cost_inr: number;
  odometer_km: number;
  distance_km: number;
  efficiency_km_per_l: number;
  fuel_station?: string;
  created_at: string;
}

export type ExpenseCategory =
  | 'FUEL'
  | 'TOLL'
  | 'MAINTENANCE'
  | 'PARKING'
  | 'DRIVER_ALLOWANCE'
  | 'LOADING_UNLOADING'
  | 'OTHER';

export interface ExpenseRecord {
  id: string;
  trip_id?: string;
  trip_code?: string;
  lorry_id?: string;
  lorry_code?: string;
  driver_id?: string;
  driver_name?: string;
  category: ExpenseCategory;
  amount_inr: number;
  date: string;
  description: string;
  estimated_amount_inr?: number;
  receipt_url?: string;
  created_at: string;
}

export type DocumentStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
export type VehicleDocType = 'RC' | 'INSURANCE' | 'FITNESS' | 'POLLUTION' | 'PERMIT';
export type DriverDocType = 'DRIVING_LICENSE' | 'ID_PROOF' | 'MEDICAL_FITNESS';

export interface VehicleDocument {
  id: string;
  lorry_id: string;
  lorry_code: string;
  document_type: VehicleDocType;
  document_number: string;
  issue_date: string;
  expiry_date: string;
  status: DocumentStatus;
  file_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  driver_name: string;
  document_type: DriverDocType;
  document_number: string;
  issue_date: string;
  expiry_date: string;
  status: DocumentStatus;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export type BreakdownStatus = 'REPORTED' | 'UNDER_REVIEW' | 'ASSISTANCE' | 'RESOLVED' | 'CLOSED';

export interface BreakdownRecord {
  id: string;
  breakdown_code: string;
  lorry_id: string;
  lorry_code: string;
  driver_id: string;
  driver_name: string;
  location_address: string;
  latitude: number;
  longitude: number;
  reported_at: string;
  problem_type: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: BreakdownStatus;
  affected_trip_id?: string;
  affected_shipment_ids: string[];
  replacement_lorry_id?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  type:
    | 'VEHICLE_BREAKDOWN'
    | 'DEADLINE_RISK'
    | 'MAINTENANCE_DUE'
    | 'GPS_STALE'
    | 'ROUTE_UPDATED'
    | 'NEW_ASSIGNMENT'
    | 'DELIVERY_COMPLETED'
    | 'DRIVER_UNAVAILABLE'
    | 'OPTIMIZATION_COMPLETED'
    | 'SYSTEM_ALERT';
  entity_type?: 'LORRY' | 'DRIVER' | 'SHIPMENT' | 'TRIP' | 'ROUTE';
  entity_id?: string;
  is_read: boolean;
  timestamp: string;
}

