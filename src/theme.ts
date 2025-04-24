import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const FONT_FAMILY_PRIMARY = 'Geist Sans, "Roboto", "Helvetica", "Arial", sans-serif';
const FONT_FAMILY_SECONDARY = '"Geist Sans", "Roboto", "Helvetica", "Arial", sans-serif';

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(128, 22, 44);",
      light: "rgb(204, 99, 120);",
      dark: "rgb(59, 6, 6);",
    },
    secondary: {
      main: "#f50057",
    },
    error: {
      main: red.A400,
    },
    background: {
      //Image
      default: "linear-gradient(135deg, rgb(255, 218, 218) 0%, rgb(245, 200, 200) 100%)",
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
    borderRadius: 5,
  },
  // --- Fine-tuning Component Defaults ---
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {},
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          input: {
            padding: "14px 12px",
          },
        },
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
        containedPrimary: {},
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          // Example: Use paper background, or maybe primary.dark?
          // backgroundColor: theme.palette.background.paper,
          // color: theme.palette.text.primary,
          backgroundColor: theme.palette.primary.dark, // Example: Dark sidebar
          color: theme.palette.getContrastText(theme.palette.primary.dark), // Ensure text is readable
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Example: Style hover/selected states if needed
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)", // Subtle hover on dark
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main, // Selected item uses primary main
            "&:hover": {
              backgroundColor: theme.palette.primary.light, // Slightly lighter on hover when selected
            },
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Match icon color to text color inside the drawer
          color: theme.palette.getContrastText(theme.palette.primary.dark),
        }),
      },
    },
  },
});

export default theme;
