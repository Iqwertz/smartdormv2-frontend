export interface TenantForSelect {
  id: number; // or string if external_id is used by your select logic
  name: string;
  surname: string;
  username: string | null;
  current_room: string | null;
  label: string; // Pre-formatted display string for Autocomplete
}

export interface Parcel {
  id: number;
  external_id: string;
  arrived: string; // ISO date string
  count: number;
  registered: boolean;
  picked_up: string | null; // ISO date string or null
  tenant: number | null; // tenant_id or null (FK to Tenant model)
  subtenant: number | null; // subtenant_id or null (FK to Subtenant model)
  tenant_info: string | null; // Denormalized string like "Name Surname (Room XXX)"
  subtenant_info: string | null; // Denormalized string like "Name Surname (Associated Room YYY)"
}

export interface CreateParcelPayload {
  room?: string;
  name?: string;
  surname?: string;
  quantity: number;
  registered: boolean;
}
