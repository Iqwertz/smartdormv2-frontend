// src/theme.ts
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Define your custom fonts (make sure they are loaded in your public/index.html or via CSS)
const FONT_FAMILY_PRIMARY = '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';
const FONT_FAMILY_SECONDARY = '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
      light: "#757de8",
      dark: "#002984",
    },
    secondary: {
      main: "#f50057",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: FONT_FAMILY_PRIMARY,
    h1: { fontFamily: FONT_FAMILY_SECONDARY, fontWeight: 700 },
    h2: { fontFamily: FONT_FAMILY_SECONDARY, fontWeight: 600 },
    h3: { fontFamily: FONT_FAMILY_SECONDARY, fontWeight: 600 },
    h4: { fontFamily: FONT_FAMILY_SECONDARY, fontWeight: 600 },
    h5: { fontFamily: FONT_FAMILY_SECONDARY, fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  // --- Fine-tuning Component Defaults ---
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          // Some CSS applied to the root element
          // marginBottom: '16px', // Example default margin
        },
      },
    },
    MuiOutlinedInput: {
      // Target the outlined input specifically
      styleOverrides: {
        root: {
          // Style the root of the outlined input
          // borderRadius: '12px' // Apply default border radius to ALL outlined inputs
          // Could adjust default padding via input slot here too:
          // input: {
          //   padding: '14px 12px',
          // }
        },
        // You can target the notch, fieldset etc. here too
        // notchedOutline: {
        //   borderColor: 'rgba(0, 0, 0, 0.1)',
        // },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 24px",
        },
        containedPrimary: {
          // Styles specifically for variant="contained" color="primary"
          // backgroundColor: '#ff0000', // Example: Make primary buttons red
          // '&:hover': { backgroundColor: '#cc0000'}
        },
      },
    },
  },
});

export default theme;
