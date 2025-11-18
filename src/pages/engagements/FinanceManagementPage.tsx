import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import BudgetRequestList from "../../components/budget/BudgetRequestList"; // Wrapper for table with status filter

// Reusable wrapper for the table that fetches based on status
import { useState, useEffect } from "react";
import BudgetRequestTable from "../../components/budget/BudgetRequestTable";
import { fetchBudgetRequests, manageBudgetRequest } from "../../services/budgetService";
import { useNotification } from "../../context/NotificationContext";

const FinanceTabContent: React.FC<{ status: string }> = ({ status }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    const data = await fetchBudgetRequests(status);
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status]);

  const handleManage = async (id: number, action: any) => {
    try {
      await manageBudgetRequest(id, action);
      showNotification("Status aktualisiert", "success");
      load();
    } catch (e) {
      showNotification("Fehler", "error");
    }
  };

  return <BudgetRequestTable requests={requests} loading={loading} userRole="FINANZER" onManage={handleManage} />;
};

const FinanceManagementPage: React.FC = () => {
  const tabs = [
    { label: "Offen", content: <FinanceTabContent status="OPEN" /> },
    { label: "Genehmigt", content: <FinanceTabContent status="APPROVED" /> },
    { label: "Bezahlt", content: <FinanceTabContent status="PAID" /> },
    { label: "Abgelehnt", content: <FinanceTabContent status="REJECTED" /> },
  ];

  return (
    <Box className="page-root" sx={{ maxWidth: "1600px", margin: "0 auto" }}>
      <TabbedDashboardCard title="Finanzverwaltung" tabs={tabs} />
    </Box>
  );
};

export default FinanceManagementPage;
