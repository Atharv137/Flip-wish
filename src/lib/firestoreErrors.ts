export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'list';

export interface DatabaseErrorInfo {
  code: string;
  message: string;
  operation: OperationType;
  path?: string;
  userMessage: string;
}

/**
 * Normalizes Firebase Realtime Database and auth errors into descriptive diagnostics and user-friendly messages.
 */
export function handleDatabaseError(
  error: any,
  operation: OperationType,
  path?: string
): DatabaseErrorInfo {
  const code = String(error?.code || error?.name || 'unknown');
  const rawMessage = String(error?.message || 'Database operation failed');

  let userMessage = 'A database error occurred. Operating with local data.';

  if (code.includes('PERMISSION_DENIED') || code === 'permission-denied') {
    userMessage = 'Permission denied. Please verify you are signed in.';
  } else if (code.includes('DISCONNECTED') || code === 'unavailable') {
    userMessage = 'Network connection issue. Operating in offline/cached mode.';
  } else if (code === 'unauthenticated') {
    userMessage = 'Please sign in to access your account data.';
  }

  const errInfo: DatabaseErrorInfo = {
    code,
    message: rawMessage,
    operation,
    path,
    userMessage
  };

  console.warn(`Realtime Database Notice [${operation}] on ${path || 'unknown'}:`, errInfo);
  return errInfo;
}

// Backwards-compatible alias for existing imports
export const handleFirestoreError = handleDatabaseError;
export type FirestoreErrorInfo = DatabaseErrorInfo;
