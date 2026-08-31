// src/utils/schollwireNetwork.ts
// Ableitung der statischen IP-Daten (schollwire) aus Flur- und Zimmerangabe eines Mieters.
//
// Schema laut Wiki (https://wiki.schollheim.net/e/en/lan):
//   IP:      10.<H>.<R>.<1-5>
//   Gateway: 10.<H>.<R>.254
//   Maske:   255.255.255.0, DNS: 10.0.0.1
//
// H = Flur-ID = Hausnummer + Stockwerk (z. B. Haus 2, 1. Stock -> 21)
// R = Zimmer-ID = die letzten beiden Ziffern der Zimmernummer ohne führende Null
//
// Die Hausnummer steckt normalerweise im Flurnamen (H1EG, H1L3, H2F4, ...).
// Ausnahme: Zimmer aus Haus 3 sind organisatorisch Fluren aus Haus 1/2 zugeordnet
// (z. B. "3-107" auf H2F1). Sie sind an dem Präfix "3-" der Zimmernummer erkennbar
// und gehören netzwerktechnisch immer zu Haus 3 -- das Stockwerk kommt weiterhin
// aus dem Flurnamen.

export const SCHOLLWIRE_SUBNET_MASK = "255.255.255.0";
export const SCHOLLWIRE_DNS_SERVER = "10.0.0.1";
export const SCHOLLWIRE_WIKI_URL = "https://wiki.schollheim.net/e/en/lan";

/** Flurname: H<Haus>EG oder H<Haus><Buchstabe><Stockwerk>, z. B. H1EG, H1L3, H1R5, H2F4 */
const FLOOR_PATTERN = /^H([123])(?:EG|[A-Z]([0-9]))$/;
const HOUSE_3_ROOM_PREFIX = "3-";

export interface SchollwireConfig {
  /** Haus 1, 2 oder 3 */
  house: number;
  /** Stockwerk, EG = 0 */
  floorNumber: number;
  /** Flur-ID H (Hausnummer + Stockwerk) */
  hallwayId: number;
  /** Zimmer-ID R */
  roomId: number;
  /** Netzpräfix inkl. Punkt, z. B. "10.31.7." */
  networkPrefix: string;
  /** z. B. "10.31.7.1" */
  firstIp: string;
  /** z. B. "10.31.7.5" */
  lastIp: string;
  gateway: string;
  subnetMask: string;
  dnsServer: string;
}

/**
 * Berechnet die statischen IP-Daten für einen Flur (z. B. "H2F1") und eine
 * Zimmernummer (z. B. "152" oder "3-107"). Gibt null zurück, wenn die Angaben
 * nicht zum bekannten Schema passen (z. B. Flur "Unbekannt").
 */
export function getSchollwireConfig(
  currentFloor: string | null | undefined,
  currentRoom: string | null | undefined,
): SchollwireConfig | null {
  const floor = (currentFloor ?? "").trim().toUpperCase();
  const room = (currentRoom ?? "").trim();
  if (!floor || !room) return null;

  const floorMatch = FLOOR_PATTERN.exec(floor);
  if (!floorMatch) return null;

  // Stockwerk immer aus dem Flurnamen, "EG" (keine Ziffer im Match) entspricht 0.
  const floorNumber = floorMatch[2] === undefined ? 0 : Number(floorMatch[2]);

  // Haus aus dem Flurnamen -- außer die Zimmernummer weist das Zimmer Haus 3 zu.
  const isHouse3 = room.startsWith(HOUSE_3_ROOM_PREFIX);
  const house = isHouse3 ? 3 : Number(floorMatch[1]);

  const roomDigits = isHouse3 ? room.slice(HOUSE_3_ROOM_PREFIX.length) : room;
  if (!/^[0-9]+$/.test(roomDigits)) return null;

  // R = letzte zwei Ziffern ohne führende Null ("07" -> 7, "152" -> 52)
  const roomId = Number(roomDigits.slice(-2));
  if (roomId < 1 || roomId > 253) return null;

  const hallwayId = house * 10 + floorNumber;
  const networkPrefix = `10.${hallwayId}.${roomId}.`;

  return {
    house,
    floorNumber,
    hallwayId,
    roomId,
    networkPrefix,
    firstIp: `${networkPrefix}1`,
    lastIp: `${networkPrefix}5`,
    gateway: `${networkPrefix}254`,
    subnetMask: SCHOLLWIRE_SUBNET_MASK,
    dnsServer: SCHOLLWIRE_DNS_SERVER,
  };
}
