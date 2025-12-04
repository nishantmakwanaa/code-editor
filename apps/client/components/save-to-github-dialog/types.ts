/**
 * Type definitions for GitHub commit form data.
 * Includes:
 * - File name field
 * - Commit message field
 *
 */

export type CommitForm = {
  fileName: string;
  commitSummary: string;
};
