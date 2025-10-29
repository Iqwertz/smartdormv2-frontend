import axios from "axios";

// --- Rooms ---

/**
 * Defines the structure of a single room's status data.
 */
export interface RoomStatus {
  id: string;
  name: string;
  emoji: string;
  status: "available" | "closed" | "booked"; // Assuming 'booked' is a possible status
  url: string;
  currentBookings: number;
  maxBookings: number;
}

interface RoomsApiResponse {
  status: string;
  rooms: RoomStatus[];
}

/**
 * Fetches the status of all bookable rooms from the rooms API.
 * @returns A promise that resolves to an array of RoomStatus objects.
 */
export const fetchRoomsStatus = async (): Promise<RoomStatus[]> => {
  // Use a simple axios instance since this is an external, unauthenticated API
  const response = await axios.get<RoomsApiResponse>("https://api-rooms.schollheim.net/api/roomsStatus");
  if (response.data.status === "ok") {
    return response.data.rooms;
  }
  throw new Error("Failed to fetch rooms status");
};

// --- Washing Machines ---

/**
 * Defines the structure of a single washing machine's status.
 */
export type WMStateType = "running" | "available" | "defective";
export interface WashingMachineStatus {
  roomId: number;
  roomName: string;
  wmId: number;
  wmName: string;
  status: WMStateType;
  lastUpdate: string;
}

/**
 * Defines the structure for the summarized washing machine status per room.
 */
export interface WashingMachineSummary {
  roomName: string;
  available: number;
  total: number;
}

/**
 * Fetches washing machine statuses and processes them into a summary by room.
 * @returns A promise that resolves to an array of WashingMachineSummary objects.
 */
export const fetchWashingMachineStatus = async (): Promise<WashingMachineSummary[]> => {
  const response = await axios.get<WashingMachineStatus[]>("https://waschmaschinen.schollheim.net/api/GetWMStatus");
  const machines = response.data;

  // Process the raw data into a summary grouped by room name
  const summaryMap: { [key: string]: { available: number; total: number } } = {};

  machines.forEach((machine) => {
    if (!summaryMap[machine.roomName]) {
      summaryMap[machine.roomName] = { available: 0, total: 0 };
    }

    // Skip defective machines from the total count
    if (machine.status === "defective") {
      return;
    }

    summaryMap[machine.roomName].total++;
    if (machine.status === "available") {
      summaryMap[machine.roomName].available++;
    }
  });

  // Convert the map object into an array for easier rendering
  return Object.keys(summaryMap).map((roomName) => ({
    roomName,
    ...summaryMap[roomName],
  }));
};
