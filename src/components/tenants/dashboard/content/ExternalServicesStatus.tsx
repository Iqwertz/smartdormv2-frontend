import React, { useState, useEffect } from "react";
import {
  RoomStatus,
  fetchRoomsStatus,
  WashingMachineSummary,
  fetchWashingMachineStatus,
} from "../../../../services/externalStatusService";

/**
 * Determines the dot color and bookings text for a room.
 * @param status The current status of the room.
 * @param currentBookings The number of current bookings.
 * @param maxBookings The maximum number of bookings.
 * @returns {dotColor: string, bookingsText: string, isClosed: boolean}
 */
const getRoomDisplayProps = (status: RoomStatus["status"], currentBookings: number, maxBookings: number) => {
  let dotColor = "grey";
  let bookingsText = "-/-";
  let isClosed = false;

  console.log(status);

  if (status === "closed") {
    isClosed = true;
    dotColor = "grey";
  } else if (status === "available") {
    bookingsText = `${currentBookings} / ${maxBookings}`;
    dotColor = "green";
    if (currentBookings > 0) {
      dotColor = "orange"; //Partially booked
    }
  } else if (status === "booked") {
    dotColor = "red";
    bookingsText = `${currentBookings} / ${maxBookings}`;
  }

  return { dotColor, bookingsText, isClosed };
};

/**
 * Renders the compact list of bookable rooms and their status.
 */
const RoomsStatusSection: React.FC = () => {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomsStatus()
      .then(setRooms)
      .catch(() => setError("Status der Räume konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-bar" />;
  if (error) return <div className="error-alert">{error}</div>;

  return (
    <div className="rooms-list">
      {rooms.map((room) => {
        const { dotColor, bookingsText, isClosed } = getRoomDisplayProps(
          room.status,
          room.currentBookings,
          room.maxBookings
        );
        return (
          <a
            key={room.id}
            href={room.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`room-item ${isClosed ? "closed" : ""}`}
          >
            <div className="room-icon-container">{room.emoji}</div>
            <div className="room-name">{room.name}</div>
            <div className="room-bookings-container">
              <div className="room-bookings">{bookingsText}</div>
              <div className={`room-status-dot ${dotColor}`} />
            </div>
          </a>
        );
      })}
    </div>
  );
};

/**
 * Renders the compact summary of washing machine availability.
 */
const WashingMachineStatusSection: React.FC = () => {
  const [summary, setSummary] = useState<WashingMachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWashingMachineStatus()
      .then(setSummary)
      .catch(() => setError("Status der Waschmaschinen konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-bar" />;
  if (error) return <div className="error-alert">{error}</div>;

  return (
    <div className="rooms-list">
      {summary.map((room) => {
        const dotColor = room.available > 0 ? "green" : "red";
        return (
          <a
            key={room.roomName}
            href={"http://waschmaschinen.schollheim.net/"}
            target="_blank"
            rel="noopener noreferrer"
            className="room-item"
          >
            <div className="room-icon-container">🧺</div>
            <div className="room-name">{room.roomName}</div>
            <div className="room-bookings-container">
              <div className="room-bookings">
                {room.total - room.available} / {room.total}
              </div>
              <div className={`room-status-dot ${dotColor}`} />
            </div>
          </a>
        );
      })}
    </div>
  );
};

/**
 * The main combined component that includes both Rooms and Washing Machine statuses.
 */
const ExternalServicesStatus: React.FC = () => {
  return (
    <>
      <style>{`
        .external-status {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .horizontal-divider {
          display: block;
          height: 1px;
          background-color: #e0e0e0;
          margin: 8px 0;
          text-align: center;
        }
        .loading-bar {
          height: 4px;
          background: linear-gradient(to right, #1976d2, #42a5f5);
          margin: 16px 0;
        }
        .error-alert {
          margin: 8px;
          padding: 8px;
          border: 1px solid #ff9800;
          border-radius: 4px;
          background-color: #fff3e0;
          color: #ef6c00;
        }
        .rooms-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .room-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: #000000;
          transition: box-shadow 0.3s ease;
        }
        .room-item:hover {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .room-item.closed {
          color: #9e9e9e;
          opacity: 0.6;
        }
        .room-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f0f0f0;
          margin-right: 12px;
          font-size: 1.2rem;
        }
        .room-item.closed .room-icon-container {
          background-color: #e0e0e0;
        }
        .room-name {
          flex: 1;
          font-weight: bold;
        }
        .room-bookings-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .room-bookings {
          min-width: 50px;
          text-align: right;
          color: #757575;
        }
        .room-item.closed .room-bookings {
          color: #9e9e9e;
        }
        .room-status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .room-status-dot.red {
          background-color: red;
        }
        .room-status-dot.green {
          background-color: green;
        }
        .room-status-dot.orange {
          background-color: orange;
        }
        .room-status-dot.grey {
          background-color: grey;
        }
        .room-booking-note {
          margin-left: 8px;
          font-size: 0.75rem;
          color: #757575;
        }

        /* Media query for tablets and smaller */
        @media (max-width: 768px) {
          .rooms-list {
            gap: 6px;
          }
          .room-item {
            padding: 10px;
            border-radius: 12px;
          }
          .room-icon-container {
            width: 32px;
            height: 32px;
            font-size: 1.1rem;
            margin-right: 5px;
          }
          .room-name {
            font-size: 0.95rem;
            max-width: calc(50vw - 130px);
            overflow: scroll;
            //text-overflow: ellipsis;
            text-align: center;
          }
          .room-bookings-container {
            gap: 10px;
          }
          .room-bookings {
            min-width: 45px;
            font-size: 0.95rem;
          }
          .room-status-dot {
            width: 11px;
            height: 11px;
          }
          .external-status {
            margin-top: 16px;
            gap: 12px;
          }
          .horizontal-divider {
            margin: 6px 0;
          }
          .error-alert {
            margin: 6px;
            padding: 6px;
          }
          .loading-bar {
            margin: 12px 0;
          }
        }

        /* Media query for mobile phones */
        @media (max-width: 480px) {
          .rooms-list {
            gap: 4px;
          }
          .room-item {
            padding: 8px;
            border-radius: 8px;
          }
          .room-icon-container {
            width: 28px;
            height: 28px;
            font-size: 1rem;
            margin-right: 6px;
          }
          .room-name {
          font-size: 0.8rem;
            overflow: auto;
          }
          .room-bookings-container {
            gap: 8px;
          }
          .room-bookings {
            min-width: 30px;
            font-size: 0.9rem;
          }
          .room-status-dot {
            width: 10px;
            height: 10px;
          }
          .external-status {
            margin-top: 12px;
            gap: 8px;
          }
          .horizontal-divider {
            margin: 4px 0;
          }
          .error-alert {
            margin: 4px;
            padding: 4px;
            font-size: 0.9rem;
          }
          .loading-bar {
            margin: 8px 0;
            height: 3px;
          }
        }
      `}</style>
      <div className="external-status">
        <div style={{ flex: 1 }}>
          <RoomsStatusSection />
        </div>
        <div className="horizontal-divider"></div>
        <div style={{ flex: 1 }}>
          <WashingMachineStatusSection />
        </div>
      </div>
    </>
  );
};

export default ExternalServicesStatus;
