// src/api/websocketClient.js
import config from '../config';

export function createRealtimeSocket(token) {
  const wsUrl = `${config.websocketUrl}/ws/realtime?token=${token}`;
  return new WebSocket(wsUrl);
}
