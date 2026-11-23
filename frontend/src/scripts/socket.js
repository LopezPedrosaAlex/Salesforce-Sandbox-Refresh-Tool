import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

/**
 * Shared socket.io connection to the backend. The backend emits refresh
 * progress events: `log`, `step-start`, `step-end`, `step-skip`, `error`,
 * `done`.
 */
export const socket = io(API_BASE, { autoConnect: true });
