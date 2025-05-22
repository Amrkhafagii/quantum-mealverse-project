
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRequestQueue } from '@/components/network/RequestQueue';
import { useAdaptiveSyncQueue } from '@/hooks/useAdaptiveSyncQueue';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { ConflictStrategy } from '@/utils/conflictResolution';

export const ResilientNetworkDemo = () => {
  const { toast } = useToast();
  const { queueRequest } = useRequestQueue();
  const { queueSync, addToBatch, processBatch, syncStatus } = useAdaptiveSyncQueue();
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality } = useNetworkQuality();
  
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [payload, setPayload] = useState('{"title":"Example","body":"This is a test"}');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [maxRetries, setMaxRetries] = useState(3);
  const [enableCompression, setEnableCompression] = useState(true);
  const [batchKey, setBatchKey] = useState('demo-batch');
  const [batchItems, setBatchItems] = useState('1');
  
  // Single request example
  const handleSendRequest = useCallback(() => {
    try {
      const parsedPayload = JSON.parse(payload);
      
      const requestId = queueRequest({
        execute: async () => {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(parsedPayload)
          });
          
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          
          return response.json();
        },
        priority,
        maxRetries,
        description: `POST to ${url.split('/').pop()}`,
        data: parsedPayload,
        compressionEnabled: enableCompression
      });
      
      toast({
        title: 'Request queued',
        description: `Request ID: ${requestId}`,
      });
    } catch (error) {
      toast({
        title: 'Invalid JSON',
        description: 'Please check your payload format',
        variant: 'destructive'
      });
    }
  }, [url, payload, priority, maxRetries, enableCompression, queueRequest, toast]);
  
  // Add item to batch
  const handleAddToBatch = useCallback(() => {
    try {
      // Generate some test items
      const count = parseInt(batchItems, 10) || 1;
      
      for (let i = 0; i < count; i++) {
        const item = {
          id: Date.now() + i,
          title: `Batch item ${i + 1}`,
          value: Math.random().toString(36).substring(2)
        };
        
        addToBatch(batchKey, item);
      }
      
      toast({
        title: 'Added to batch',
        description: `${count} item${count > 1 ? 's' : ''} added to "${batchKey}" batch`,
      });
    } catch (error) {
      toast({
        title: 'Error adding to batch',
        description: String(error),
        variant: 'destructive'
      });
    }
  }, [batchKey, batchItems, addToBatch, toast]);
  
  // Process batch
  const handleProcessBatch = useCallback(() => {
    const requestId = processBatch(
      batchKey,
      async (items) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items })
        });
        
        if (!response.ok) {
          throw new Error(`Batch request failed with status ${response.status}`);
        }
        
        return response.json();
      },
      {
        priority,
        maxRetries,
        compressionEnabled: enableCompression,
        conflictResolutionStrategy: ConflictStrategy.MERGE,
        description: `Process batch "${batchKey}"`
      }
    );
    
    if (requestId) {
      toast({
        title: 'Batch queued for processing',
        description: `Request ID: ${requestId}`,
      });
    } else {
      toast({
        title: 'No items in batch',
        description: `Batch "${batchKey}" is empty`,
        variant: 'destructive'
      });
    }
  }, [batchKey, url, priority, maxRetries, enableCompression, processBatch, toast]);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Resilient Network Demo</span>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant="outline">
              {connectionType || 'Unknown'} - {quality}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Test the resilient network features with automatic retries, compression, and batching
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="single">Single Request</TabsTrigger>
            <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            <TabsTrigger value="status">Sync Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="url">API Endpoint</Label>
                <Input 
                  id="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="payload">Payload (JSON)</Label>
                <textarea
                  id="payload"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority" 
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="retries">Max Retries</Label>
                  <Input 
                    id="retries" 
                    type="number" 
                    min={0}
                    max={10}
                    value={maxRetries} 
                    onChange={(e) => setMaxRetries(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="compression" 
                  checked={enableCompression}
                  onCheckedChange={setEnableCompression}
                />
                <Label htmlFor="compression">Enable compression for large payloads</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch-key">Batch Key</Label>
                <Input 
                  id="batch-key" 
                  value={batchKey} 
                  onChange={(e) => setBatchKey(e.target.value)} 
                  placeholder="my-batch"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="batch-items">Number of Items to Add</Label>
                <Input 
                  id="batch-items" 
                  type="number"
                  min={1}
                  max={100}
                  value={batchItems} 
                  onChange={(e) => setBatchItems(e.target.value)} 
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleAddToBatch} className="flex-1">
                  Add to Batch
                </Button>
                <Button onClick={handleProcessBatch} className="flex-1">
                  Process Batch
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="status">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Sync Mode</h3>
                <p className="text-sm text-muted-foreground">{syncStatus.mode}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Active Strategies</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {syncStatus.activeStrategies.map(strategy => (
                    <Badge key={strategy} variant="secondary">
                      {strategy}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Network Status</h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Connected' : 'Disconnected'} - 
                  Type: {connectionType || 'Unknown'} - 
                  Quality: {quality}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSendRequest}>
          Queue Request
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResilientNetworkDemo;
