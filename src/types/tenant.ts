export interface TenantProfile {
  id: number;
  birthday: string;
  current_floor: string | null;
  current_points: number | null;
  current_room: string | null;
  deposit: number | null;
  email: string;
  extension: number | null;
  external_id: string;
  gender: string;
  move_in: string;
  move_out: string;
  name: string;
  nationality: string;
  note: string | null;
  probation_end: string;
  study_field: string;
  sublet: number | null;
  surname: string;
  tel_number: string | null;
  university: string;
  username: string | null;
  new_address: string | null;
}

export interface GlobalAppSettings {
  current_semester: string;
  applications_open: boolean;
  show_applications: boolean;
  updated_at: string;
}

export interface DepartmentForSelect {
  id: number;
  name: string;
  full_name: string;
}

export interface EngagementApplicationData {
  id: number;
  tenant: {
    name: string;
    surname: string;
  };
  department: DepartmentForSelect;
  motivation: string;
  image_base64: string | null;
}

export interface MyEngagementApplication {
  id: number;
  semester: string;
  department: DepartmentForSelect;
  motivation: string;
}

export interface NewTenantPayload {
  name: string;
  surname: string;
  email: string;
  gender: string;
  nationality: string;
  birthday: string | null; // e.g., 'YYYY-MM-DD'
  tel_number?: string;
  move_in: string | null; // e.g., 'YYYY-MM-DD'
  current_room: string;
  deposit: number | string; // Use string for input, convert to number on submit
  university: string;
  study_field: string;
  note?: string;
}

export interface SubtenantProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  username: string | null;
  move_in: string;
  move_out: string;
  tenant: number;
  tenant_name?: string;
  room: number;
  room_name?: string;
  university_confirmation: boolean;
  created_on: string;
  external_id: string;
}

export interface NewSubtenantPayload {
  name: string;
  surname: string;
  email: string;
  move_in: string | null;
  move_out: string | null;
  tenant_id: number | null;
  room_id: number | null;
  university_confirmation: boolean;
}

export interface Subtenant {
  id: number;
  name: string;
  surname: string;
  email: string;
  move_in: string; // move_in date for subtenant is a typo from the original code, should be move_in
  move_out: string;
}

export interface Rental {
  id: number;
  move_in: string;
  moved_out: string;
  room_name: string;
}

export interface MovePayload {
  room_id: number;
  move_date: string;
}

export interface DepartmentInfo {
  name: string;
  full_name: string;
}

export interface Engagement {
  id: number;
  semester: string;
  points: number;
  note: string | null;
  compensate: boolean;
  department: DepartmentInfo;
  external_id: string;
}

export interface HsvTenant {
  name: string;
  surname: string;
  email: string | null;
  tel_number: string | null;
  current_room: string | null;
  current_floor: string | null;
}

export interface HsvEngagementGroup {
  department_id: number;
  department_name: string;
  department_full_name: string;
  semester: string;
  tenants: HsvTenant[];
  group_id: string;
}

export interface Departure {
  tenant: TenantProfile;
  status: "CREATED" | "POSTPONED" | "CONFIRMED" | "CLOSED";
  created_on: string;
  external_id: string;
  signatures?: DepartmentSignature[];
}

export interface DepartmentSignature {
  amount: number;
  department_name: string;
  signed_on: string | null;
  departure: {
    tenant: TenantProfile;
    status: "CREATED" | "POSTPONED" | "CONFIRMED" | "CLOSED";
    created_on: string;
    external_id: string;
  };
}

export interface Claim {
  id: number;
  created_on: string;
  status: "CREATED" | "PROCESSING" | "APPROVED" | "REJECTED";
  type: "EXTENSION";
  tenant: TenantProfile;
  external_id: string;
}
