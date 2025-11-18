import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DashboardCard from "../../components/shared/DashboardCard";
import BudgetRequestTable from "../../components/budget/BudgetRequestTable";
import {
  fetchBudgetRequests,
  fetchBudgetPermissions,
  createBudgetRequest,
  deleteBudgetRequest,
} from "../../services/budgetService";
import { BudgetRequest, BudgetEngagement } from "../../types/budget";
import { useNotification } from "../../context/NotificationContext";

const TenantBudgetPage: React.FC = () => {
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [engagements, setEngagements] = useState<BudgetEngagement[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    type: "REIMBURSEMENT",
    department: "",
    requester_name: "",
    room_number: "",
    email: "",
    iban: "",
    amount: "",
    description: "",
    note: "",
    is_within_budget: false,
  });
  const [file, setFile] = useState<File | null>(null);

  const { showNotification } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqs, engs] = await Promise.all([fetchBudgetRequests(), fetchBudgetPermissions()]);
      setRequests(reqs);
      setEngagements(engs);
    } catch (e) {
      showNotification("Fehler beim Laden", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!file || !formData.department || !formData.amount) {
      showNotification("Bitte alle Pflichtfelder und Beleg ausfüllen", "warning");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val.toString()));
    data.append("receipt", file);

    try {
      await createBudgetRequest(data);
      showNotification("Antrag erstellt", "success");
      setOpen(false);
      loadData();
    } catch (e) {
      showNotification("Fehler beim Erstellen", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Wirklich löschen?")) {
      await deleteBudgetRequest(id);
      loadData();
    }
  };

  return (
    <Box className="page-root" sx={{ maxWidth: "1200px", margin: "0 auto" }}>
      <DashboardCard
        title="Meine Finanzanträge"
        action={
          engagements.length > 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Neuer Antrag
            </Button>
          )
        }
      >
        <BudgetRequestTable requests={requests} loading={loading} userRole="TENANT" onDelete={handleDelete} />
      </DashboardCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuer Finanzantrag</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              select
              label="Referat"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {engagements.map((e) => (
                <MenuItem key={e.department_id} value={e.department_id}>
                  {e.department_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Art"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="REIMBURSEMENT">Rückerstattung</MenuItem>
              <MenuItem value="BUDGET">Budgetantrag</MenuItem>
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={formData.requester_name}
                onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
              />
              <TextField
                label="Zimmer"
                fullWidth
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </Box>
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="IBAN"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            />
            <TextField
              label="Betrag (€)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <TextField
              label="Beschreibung"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {formData.type === "REIMBURSEMENT" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_within_budget}
                    onChange={(e) => setFormData({ ...formData, is_within_budget: e.target.checked })}
                  />
                }
                label="Im genehmigten Budget"
              />
            )}

            <Button variant="outlined" component="label">
              Beleg hochladen (PDF)
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            {file && <Typography variant="caption">{file.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Absenden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantBudgetPage;
