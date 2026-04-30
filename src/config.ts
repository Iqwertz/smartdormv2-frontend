export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//export const API_BASE_URL = "http://smartdormv2-api-dev.schollheim.net/";

export const ATTENDANCE_LINK_CHECKIN_ENABLED = import.meta.env.VITE_ATTENDANCE_LINK_CHECKIN_ENABLED !== "false";
export const ATTENDANCE_LINK_ROUTE = "/attendance/check-in";
export const ATTENDANCE_LINK_CODE_PARAM = "code";
export const ATTENDANCE_CODE_SEPARATOR = "_";

export const ALL_FLOORS = [
  "H1EG",
  "H1L1",
  "H1L2",
  "H1L3",
  "H1L4",
  "H1L5",
  "H1R1",
  "H1R2",
  "H1R3",
  "H1R4",
  "H1R5",
  "H2EG",
  "H2F1",
  "H2F2",
  "H2F3",
  "H2F4",
  "H2F5",
];
