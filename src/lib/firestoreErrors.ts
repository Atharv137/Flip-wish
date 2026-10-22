export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'list';

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  operation: OperationType;
  path?: string;
  userMessage: string;
}

/**
 * Normalizes Firestore errors into descriptive diagnostics and user-friendly messages.
 */
export function handleFirestoreError(
  error: any,
  operation: OperationType,
  path?: string
): FirestoreErrorInfo {
  const code = error?.code || 'unknown';
  const rawMessage = error?.message || 'Unknown Firestore error occurred';

  let userMessage = 'An unexpected database error occurred. Please try again.';

  if (code === 'permission-denied') {
    userMessage = 'Permission denied. You do not have access to perform this action.';
  } else if (code === 'not-found') {
    userMessage = 'The requested resource was not found.';
  } else if (code === 'already-exists') {
    userMessage = 'This record already exists.';
  } else if (code === 'failed-precondition') {
    userMessage = 'Database index or schema condition not met.';
  } else if (code === 'resource-exhausted') {
    userMessage = 'Quota exceeded. Please try again shortly.';
  } else if (code === 'unavailable') {
    userMessage = 'Network connection issue. Operating in offline/cached mode.';
  } else if (code === 'unauthenticated') {
    userMessage = 'Please sign in to access your account data.';
  }

  const errInfo: FirestoreErrorInfo = {
    code,
    message: rawMessage,
    operation,
    path,
    userMessage
  };

  console.warn(`Firestore Error [${operation}] on ${path || 'unknown'}:`, errInfo);
  return errInfo;
}
