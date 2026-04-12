import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Chip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import attendanceService, { AttendanceRecord } from "../../services/attendanceService";

const AttendanceHistoryCard: React.FC = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService.getMyHistory()
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Anwesenheitshistorie
        </Typography>
        
        {history.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Keine Anwesenheiten protokolliert.
          </Typography>
        ) : (
          <List dense>
            {history.map((record) => (
              <ListItem key={record.id} divider>
                <ListItemText
                  primary={`Event: ${record.session} - Part: ${record.part}`}
                  secondary={new Date(record.timestamp).toLocaleString()}
                />
                <Chip 
                  label="Anwesend" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircleIcon />} 
                  variant={record.is_manual_override ? "outlined" : "filled"}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceHistoryCard;
