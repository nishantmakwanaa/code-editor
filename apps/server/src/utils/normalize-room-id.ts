/**
 * Utility function for normalizing room IDs by removing hyphens.
 * Features:
 * - Hyphen removal
 * - Room ID formatting
 *
 */

export const normalizeRoomId = (roomId: string): string => {
  return roomId.replace(/-/g, '');
};
