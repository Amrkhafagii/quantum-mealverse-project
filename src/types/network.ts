
// Create a new file to define the network types referenced in syncService.ts
export interface NetworkStatus {
  isOnline: boolean;
  connectionType?: string | null;
  isMetered?: boolean;
  downlinkSpeed?: number;
}
