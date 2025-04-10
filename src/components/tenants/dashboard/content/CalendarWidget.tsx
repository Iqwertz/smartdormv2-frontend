// src/components/dashboard/content/CalendarWidget.tsx
/**
 * Displays an interactive calendar within a DashboardCard.
 */
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import { Box } from '@mui/material';
import DashboardCard from '../DashboardCard';
import './CalendarStyles.css'; // We'll create this file for custom styles

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];


const CalendarWidget: React.FC = () => {
  const [value, onChange] = useState<CalendarValue>(new Date());

  return (
    <DashboardCard title="Events & Dates">
        {/* Apply Box with fixed height or aspect ratio if needed */}
        {/* The calendar might need specific sizing adjustments */}
       <Box sx={{
            '.react-calendar': { /* Target calendar root */
                border: 'none',
                width: '100%',
                fontFamily: 'inherit', // Use theme font
                lineHeight: 1.5,
            },
            '.react-calendar__tile--active': { /* Active day */
                 backgroundColor: 'primary.main', // Use theme color
                 color: 'primary.contrastText',
            },
             '.react-calendar__tile--now': { // Today's date
                backgroundColor: 'action.hover',
             },
             // Add more overrides as needed
       }}>
        <Calendar
          onChange={onChange}
          value={value}
          // Add any other props like tileContent for events
        />
      </Box>
    </DashboardCard>
  );
};

export default CalendarWidget;