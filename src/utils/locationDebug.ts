

export function logLocationDebug(event: string, data: any): void {
  console.log(`[Location Debug] ${event}:`, data);
}

export function clearLocationStorage(): void {
  // Clear location-related localStorage items
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('location') || key.includes('tracking')) {
      localStorage.removeItem(key);
    }
  });
  console.log('[Location Debug] Cleared location storage');
}

export function exportLocationLogs(): string {
  // Export location logs as JSON string
  const logs = {
    timestamp: new Date().toISOString(),
    localStorage: {},
    platform: navigator.userAgent,
    online: navigator.onLine
  };
  
  // Collect location-related localStorage items
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('location') || key.includes('tracking')) {
      try {
        (logs.localStorage as any)[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        (logs.localStorage as any)[key] = localStorage.getItem(key);
      }
    }
  });
  
  console.log('[Location Debug] Exported location logs:', logs);
  return JSON.stringify(logs, null, 2);
}

