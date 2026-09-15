import { TenantProfile } from "./tenant";

export type MembershipApplicationStatus = "SUBMITTED" | "APPROVED" | "REJECTED";
export type PaymentMethod = "SEPA" | "OTHER";
export type MandateStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "NONE";

/** What the dashboard needs to decide whether to offer the HSV join dialog. */
export type MembershipState =
  | "NONE" // may join, has not been asked yet or dismissed only for this session
  | "SUBMITTED" // application is waiting for a decision
  | "MEMBER"
  | "OPTED_OUT" // asked not to be prompted again
  | "INELIGIBLE" // under 18 - the online route is closed, see reason
  | "NOT_A_TENANT";

export interface MembershipStatusResponse {
  state: MembershipState;
  membership?: Membership;
  submitted_at?: string;
  previously_rejected?: boolean;
  reason?: string;
}

/** The versioned legal wording, rendered by the join form. Keys match membership_texts.py. */
export interface MembershipTerms {
  title: string;
  intro: string;
  welcome: string;
  declaration_heading: string;
  declaration_subheading: string;
  amtsliste_consent_label: string;
  amtsliste_decline_label: string;
  duty_to_notify: string;
  statutes_acknowledgement: string;
  automatic_end: string;
  privacy_notice: string;
  sepa_heading: string;
  sepa_creditor: string;
  sepa_mandate_reference_note: string;
  sepa_authorisation: string;
  sepa_payment_type: string;
  sepa_prenotification: string;
  sepa_consent_label: string;
  sepa_alternative_label: string;
  sepa_documentation_note: string;
  sepa_privacy_notice: string;
  minor_notice: string;
}

export interface MembershipTermsResponse {
  terms_version: string;
  terms: MembershipTerms;
  fee: string;
  creditor_id: string;
  creditor_name: string;
  creditor_address: string;
  privacy_policy_url: string;
  statutes_url: string;
  prefill: { first_name: string; last_name: string };
}

export interface MembershipApplicationPayload {
  first_name: string;
  last_name: string;
  requested_join_date: string; // YYYY-MM-DD
  is_of_age: boolean;
  amtsliste_consent: boolean;
  statutes_accepted: boolean;
  payment_method: PaymentMethod;
  account_holder_first_name: string;
  account_holder_last_name: string;
  iban: string;
  mandate_confirmed: boolean;
}

export interface MembershipApplication {
  id: number;
  tenant: TenantProfile;
  status: MembershipApplicationStatus;
  status_display: string;
  first_name: string;
  last_name: string;
  requested_join_date: string;
  is_of_age: boolean;
  amtsliste_consent: boolean;
  statutes_accepted: boolean;
  payment_method: PaymentMethod;
  payment_method_display: string;
  account_holder: string | null;
  /** Never the full number - reveal it through fetchMemberIban once approved. */
  iban_masked: string;
  mandate_confirmed: boolean;
  terms_version: string;
  submitted_at: string;
  submitted_by_username: string;
  decided_at: string | null;
  decided_by: string;
  decision_note: string;
  has_pdf: boolean;
}

export interface Membership {
  tenant: TenantProfile;
  application: number | null;
  joined_on: string;
  ended_on: string | null;
  amtsliste_consent: boolean;
  amtsliste_consent_at: string | null;
  mandate_reference: string | null;
  mandate_signed_on: string | null;
  mandate_status: MandateStatus;
  mandate_status_display: string;
  payment_method: PaymentMethod;
  payment_method_display: string;
  account_holder: string;
  iban_masked: string;
  last_collection_on: string | null;
  sequence_type: "FRST" | "RCUR";
  is_active: boolean;
  is_collectable: boolean;
  created_at: string;
  updated_at: string;
}

export interface RevealedIban {
  tenant_id: number;
  iban: string;
  account_holder: string;
  mandate_reference: string | null;
}

export interface DirectDebitPreviewItem {
  tenant_id: number;
  name: string;
  mandate_reference: string;
  sequence_type: "FRST" | "RCUR";
  amount: string;
  iban_masked: string;
}

export interface DirectDebitPreview {
  collection_date: string;
  amount: string;
  member_count: number;
  total_amount: string;
  first_collections: number;
  recurring_collections: number;
  skipped_members: number;
  /** Set when the Verein's own creditor data is not configured yet - blocks file creation. */
  config_error: string | null;
  items: DirectDebitPreviewItem[];
}

export interface DirectDebitRun {
  id: number;
  message_id: string;
  collection_date: string;
  amount_per_member: string;
  member_count: number;
  total_amount: string;
  created_by: string;
  created_at: string;
}
