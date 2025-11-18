export type BudgetRequestType = "BUDGET" | "REIMBURSEMENT";
export type BudgetStatus = "OPEN" | "APPROVED" | "REJECTED" | "PAID";

export interface BudgetVote {
  id: number;
  vote: "APPROVE" | "REJECT";
  voter_name: string;
  created_at: string;
}

export interface BudgetRequest {
  id: number;
  type: BudgetRequestType;
  status: BudgetStatus;
  requester_name: string;
  room_number: string;
  email: string;
  iban: string;
  amount: number;
  description: string;
  note?: string;
  is_within_budget: boolean;
  receipt_filename?: string;
  created_at: string;
  department: number;
  department_name: string;
  votes: BudgetVote[];
  has_receipt: boolean;
}

export interface CreateBudgetPayload {
  type: BudgetRequestType;
  department: number;
  requester_name: string;
  room_number: string;
  email: string;
  iban: string;
  amount: string; // Sent as string to preserve decimal precision in JSON
  description: string;
  note?: string;
  is_within_budget: boolean;
  receipt: File;
}

export interface BudgetEngagement {
  department_id: number;
  department_name: string;
}
