import React from "react";
import { Box, Chip, IconButton, Button, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { BudgetRequest } from "../../types/budget";
import { API_BASE_URL } from "../../config";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PaidIcon from "@mui/icons-material/AttachMoney";
import dayjs from "dayjs";

interface Props {
  requests: BudgetRequest[];
  loading: boolean;
  userRole: "TENANT" | "FINANZER" | "HEIMRAT";
  onVote?: (id: number, vote: "APPROVE" | "REJECT") => void;
  onManage?: (id: number, action: "APPROVE" | "REJECT" | "PAID") => void;
  onDelete?: (id: number) => void;
}

const BudgetRequestTable: React.FC<Props> = ({ requests, loading, userRole, onVote, onManage, onDelete }) => {
  const columns: GridColDef<BudgetRequest>[] = [
    {
      field: "type",
      headerName: "Typ",
      width: 130,
      renderCell: (p) => (
        <Chip
          label={p.value === "BUDGET" ? "Budget" : "Erstattung"}
          color={p.value === "BUDGET" ? "primary" : "secondary"}
          size="small"
        />
      ),
    },
    { field: "department_name", headerName: "Referat", width: 150 },
    { field: "amount", headerName: "Betrag", width: 100, valueFormatter: (p) => `${p.value} €` },
    { field: "requester_name", headerName: "Name", width: 150 },
    { field: "description", headerName: "Beschreibung", width: 200 },
    {
      field: "receipt",
      headerName: "Beleg",
      width: 70,
      renderCell: (p) =>
        p.row.has_receipt ? (
          <IconButton href={`${API_BASE_URL}/api/engagements/budget/${p.row.id}/receipt/`} target="_blank">
            <DescriptionIcon />
          </IconButton>
        ) : null,
    },
    {
      field: "created_at",
      headerName: "Datum",
      width: 110,
      valueFormatter: (p) => dayjs(p.value).format("DD.MM.YYYY"),
    },
    {
      field: "actions",
      headerName: "Aktionen",
      width: 200,
      renderCell: (p) => {
        const row = p.row;
        return (
          <Box>
            {/* Tenant Delete */}
            {userRole === "TENANT" && row.status === "OPEN" && (
              <IconButton onClick={() => onDelete && onDelete(row.id)} color="error">
                <DeleteIcon />
              </IconButton>
            )}

            {/* Finanzer Actions */}
            {userRole === "FINANZER" && (
              <>
                {row.status === "OPEN" && (
                  <>
                    <IconButton onClick={() => onManage && onManage(row.id, "APPROVE")} color="success">
                      <CheckIcon />
                    </IconButton>
                    <IconButton onClick={() => onManage && onManage(row.id, "REJECT")} color="error">
                      <CloseIcon />
                    </IconButton>
                  </>
                )}
                {row.status === "APPROVED" && (
                  <Tooltip title="Als bezahlt markieren">
                    <IconButton onClick={() => onManage && onManage(row.id, "PAID")} color="primary">
                      <PaidIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}

            {/* Heimrat Actions */}
            {userRole === "HEIMRAT" && row.status === "OPEN" && row.type === "BUDGET" && (
              <>
                <IconButton onClick={() => onVote && onVote(row.id, "APPROVE")} color="success">
                  <CheckIcon />
                </IconButton>
                <IconButton onClick={() => onVote && onVote(row.id, "REJECT")} color="error">
                  <CloseIcon />
                </IconButton>
                {/* Show vote count/tooltip here if needed */}
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <DataGrid
      rows={requests}
      columns={columns}
      loading={loading}
      autoHeight
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
    />
  );
};

export default BudgetRequestTable;
