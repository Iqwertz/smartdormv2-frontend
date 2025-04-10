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
