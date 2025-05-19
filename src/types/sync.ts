
// Create a new file to define the sync types referenced in syncService.ts
export interface SyncOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  filters?: Record<string, any>;
  createdAt: string;
  retries: number;
  lastError?: string;
  nextRetry?: string;
  localStorageKey?: string;
}

export interface SyncQueue {
  operations: SyncOperation[];
  lastSync: string | null;
}
