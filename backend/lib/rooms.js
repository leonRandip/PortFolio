// ─────────────────────────────────────────────────────────────────────────────
// Multiplayer room manager — Map-based, in-process, with 30-minute TTL.
// ─────────────────────────────────────────────────────────────────────────────

const TTL = 30 * 60 * 1000; // 30 minutes in ms

/** @type {Map<string, { host: import('ws').WebSocket|null, guest: import('ws').WebSocket|null, lastActivity: number, timer: NodeJS.Timeout }>} */
const rooms = new Map();

function generateId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // unambiguous chars
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function createRoom() {
  let roomId;
  let attempts = 0;
  do {
    roomId = generateId();
    if (++attempts > 100) throw new Error('Room ID space exhausted');
  } while (rooms.has(roomId));

  const timer = setTimeout(() => {
    console.log(`[rooms] TTL expired: ${roomId}`);
    rooms.delete(roomId);
  }, TTL);

  rooms.set(roomId, { host: null, guest: null, lastActivity: Date.now(), timer });
  console.log(`[rooms] Created room: ${roomId}`);
  return roomId;
}

export function getRoom(roomId) {
  return rooms.get(roomId) ?? null;
}

export function setHost(roomId, ws) {
  const room = rooms.get(roomId);
  if (!room) return false;
  room.host = ws;
  room.lastActivity = Date.now();
  return true;
}

export function joinRoom(roomId, ws) {
  const room = rooms.get(roomId);
  if (!room || room.guest) return false; // not found or already full
  room.guest = ws;
  room.lastActivity = Date.now();
  console.log(`[rooms] Guest joined: ${roomId}`);
  return true;
}

/** Send payload to every participant except senderWs (pass null to send to all) */
export function broadcast(roomId, payload, senderWs) {
  const room = rooms.get(roomId);
  if (!room) return;
  const msg = JSON.stringify(payload);
  for (const peer of [room.host, room.guest]) {
    if (peer && peer !== senderWs && peer.readyState === 1 /* OPEN */) {
      peer.send(msg);
    }
  }
}

export function destroyRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  clearTimeout(room.timer);
  rooms.delete(roomId);
  console.log(`[rooms] Destroyed room: ${roomId}`);
}

/** Find the room a given WebSocket belongs to */
export function getRoomByWs(ws) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.host === ws || room.guest === ws) return { roomId, room };
  }
  return null;
}
