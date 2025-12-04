/**
 * Type definitions for editor option configurations.
 * Features:
 * - Option metadata
 * - Type constraints
 * - Value definitions
 *
 */

export type EditorOption = {
  title: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'text';
  options?: string[];
  currentValue: unknown;
};
