import apiClient from "./api";
import {
  DirectDebitPreview,
  DirectDebitRun,
  MandateStatus,
  Membership,
  MembershipApplication,
  MembershipApplicationPayload,
  MembershipStatusResponse,
  MembershipTermsResponse,
  RevealedIban,
} from "../types/membership";

export type ApplicationStatusFilter = "OPEN" | "APPROVED" | "REJECTED" | "ALL";

// --- tenant-facing ---

export const fetchMyMembershipStatus = async (): Promise<MembershipStatusResponse> =>
  (await apiClient.get<MembershipStatusResponse>("/api/membership/my-status/")).data;

export const fetchMembershipTerms = async (): Promise<MembershipTermsResponse> =>
  (await apiClient.get<MembershipTermsResponse>("/api/membership/terms/")).data;

export const submitMembershipApplication = async (
  payload: MembershipApplicationPayload
): Promise<{ message: string; application_id: number }> =>
  (await apiClient.post("/api/membership/apply/", payload)).data;

export const optOutOfMembershipPrompt = async (): Promise<{ message: string }> =>
  (await apiClient.post("/api/membership/opt-out/")).data;

export const undoMembershipOptOut = async (): Promise<{ message: string }> =>
  (await apiClient.delete("/api/membership/opt-out/undo/")).data;

// --- review (Zimmerreferat / Finanzenreferat / Heimrat) ---

export const fetchApplications = async (
  status: ApplicationStatusFilter = "OPEN"
): Promise<MembershipApplication[]> =>
  (await apiClient.get<MembershipApplication[]>("/api/membership/applications/", { params: { status } })).data;

export const decideApplication = async (
  applicationId: number,
  decision: "APPROVED" | "REJECTED",
  options: { joinDate?: string; note?: string } = {}
): Promise<{ message: string; mandate_reference?: string; joined_on?: string }> =>
  (
    await apiClient.post(`/api/membership/applications/${applicationId}/decide/`, {
      decision,
      join_date: options.joinDate,
      note: options.note,
    })
  ).data;

/** URL of the archived declaration PDF. Served by a permission-checked view, not from /media. */
export const applicationPdfUrl = (applicationId: number): string =>
  `${apiClient.defaults.baseURL}/api/membership/applications/${applicationId}/pdf/`;

export const fetchMembers = async (includeEnded = false): Promise<Membership[]> =>
  (
    await apiClient.get<Membership[]>("/api/membership/members/", {
      params: includeEnded ? { include_ended: "true" } : undefined,
    })
  ).data;

/**
 * Fetch one member's full IBAN.
 *
 * Deliberately a separate request: the list only ever carries a masked number, and every
 * reveal is logged on the server with the acting user.
 */
export const fetchMemberIban = async (tenantId: number): Promise<RevealedIban> =>
  (await apiClient.get<RevealedIban>(`/api/membership/members/${tenantId}/iban/`)).data;

export const updateMemberMandate = async (
  tenantId: number,
  payload: { account_holder?: string; iban?: string; mandate_status?: MandateStatus }
): Promise<{ message: string; membership: Membership }> =>
  (await apiClient.post(`/api/membership/members/${tenantId}/mandate/`, payload)).data;

// --- SEPA collection (Finanzenreferat) ---

export const previewDirectDebit = async (collectionDate: string, amount?: string): Promise<DirectDebitPreview> =>
  (await apiClient.post("/api/membership/direct-debit/preview/", { collection_date: collectionDate, amount })).data;

export const createDirectDebit = async (
  collectionDate: string,
  amount?: string
): Promise<{ message: string; run: DirectDebitRun }> =>
  (await apiClient.post("/api/membership/direct-debit/create/", { collection_date: collectionDate, amount })).data;

export const fetchDirectDebitRuns = async (): Promise<DirectDebitRun[]> =>
  (await apiClient.get<DirectDebitRun[]>("/api/membership/direct-debit/runs/")).data;

export const directDebitXmlUrl = (runId: number): string =>
  `${apiClient.defaults.baseURL}/api/membership/direct-debit/${runId}/xml/`;
