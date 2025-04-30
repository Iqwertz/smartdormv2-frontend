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
  gender: string; // Do we limit them to M/F?
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
