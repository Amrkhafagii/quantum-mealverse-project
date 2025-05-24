
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { exportLocationLogs } from '@/utils/locationDebug';

interface LogDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogDisplayModal: React.FC<LogDisplayModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const logData = exportLocationLogs();
      setLogs(logData);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Location Debug Logs</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
              {logs}
            </pre>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDisplayModal;
