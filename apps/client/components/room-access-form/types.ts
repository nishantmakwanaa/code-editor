/**
 * Type definitions for room access form data.
 * Includes:
 * - Create room form types
 * - Join room form types
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

export interface CreateRoomForm {
  name: string;
}

export interface JoinRoomForm {
  name: string;
  roomId: string;
}
