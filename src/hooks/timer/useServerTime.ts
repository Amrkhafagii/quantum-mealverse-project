
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useServerTime = () => {
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  useEffect(() => {
    const getServerTime = async () => {
      try {
        const response = await supabase.functions.invoke('get-server-time', {
          method: 'POST',
        });
        
        if (response.error) {
          console.error('Error getting server time:', response.error);
          return;
        }
        
        if (response.data && response.data.timestamp) {
          try {
            const serverTimeDate = new Date(response.data.timestamp);
            console.log('Server time:', serverTimeDate.toISOString());
            console.log('Local time:', new Date().toISOString());
            setServerTime(serverTimeDate);
            
            const offset = serverTimeDate.getTime() - new Date().getTime();
            console.log('Server time offset (ms):', offset);
            setServerTimeOffset(offset);
          } catch (parseError) {
            console.error('Error parsing server time:', parseError);
          }
        }
      } catch (error) {
        console.error('Failed to get server time:', error);
      }
    };

    getServerTime();
  }, []);

  return { serverTime, serverTimeOffset };
};
