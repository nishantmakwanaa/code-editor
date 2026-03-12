/**
 * Type definitions for editor option configurations.
 * Features:
 * - Option metadata
 * - Type constraints
 * - Value definitions
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

export type EditorOption = {
  title: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'text';
  options?: string[];
  currentValue: unknown;
};
