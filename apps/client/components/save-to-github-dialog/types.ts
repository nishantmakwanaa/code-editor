/**
 * Type definitions for GitHub commit form data.
 * Includes:
 * - File name field
 * - Commit message field
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

export type CommitForm = {
  fileName: string;
  commitSummary: string;
};
