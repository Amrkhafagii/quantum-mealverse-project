import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkAwareContainer } from '@/components/network/NetworkAwareContainer';
import AdaptiveImage from '@/components/network/AdaptiveImage';
import AdaptivePolling from '@/components/network/AdaptivePolling';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useRequestBatching, useContentAdaptation } from '@/utils/networkAdaptation';

// Demo data for API requests
const demoItems = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `This is item ${i + 1}`,
  complex: Math.random() > 0.5
}));

const NetworkAdaptationDemo = () => {
  const [activeTab, setActiveTab] = useState('quality');
  const { quality, isLowQuality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  const [processedItems, setProcessedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { contentQuality, shouldEnableAnimations } = useContentAdaptation();
  
  // Demo polling data
  const [pollingData, setPollingData] = useState<Array<{ id: number; value: number }>>([]);
  
  // Simulate API request processing
  const processItem = async (item: typeof demoItems[0]) => {
    // Simulate network request
    const delay = item.complex ? 1000 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    return `Processed ${item.name}`;
  };
  
  // Use our batching hook to process requests
  const { processBatch, batchSize, adaptiveInterval } = useRequestBatching(
    demoItems,
    processItem
  );
  
  // Handle batch processing
  const handleProcessBatch = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessedItems([]);
    
    try {
      // Process in chunks due to the large number
      const totalItems = demoItems.length;
      let processed = 0;
      
      while (processed < totalItems) {
        const chunk = demoItems.slice(processed, processed + batchSize);
        const results = await Promise.all(chunk.map(processItem));
        setProcessedItems(prev => [...prev, ...results]);
        processed += chunk.length;
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Simulated polling function
  const handlePoll = async () => {
    // Simulate fetching new data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate some random data
    const newDataPoint = {
      id: Date.now(),
      value: Math.floor(Math.random() * 100)
    };
    
    setPollingData(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only the last 10 data points
      return updated.slice(Math.max(0, updated.length - 10));
    });
    
    return newDataPoint;
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Network Quality Adaptation</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Current Content Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground">Network Quality</p>
              <p className="text-sm font-medium capitalize">{quality}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground">Content Quality</p>
              <p className="text-sm font-medium capitalize">{contentQuality}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground">Animations</p>
              <p className="text-sm font-medium">{shouldEnableAnimations ? 'Enabled' : 'Reduced'}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground">Batch Size</p>
              <p className="text-sm font-medium">{batchSize} items</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="quality">Image Quality</TabsTrigger>
          <TabsTrigger value="polling">Adaptive Polling</TabsTrigger>
          <TabsTrigger value="batching">Request Batching</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Image Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Images automatically adjust in quality based on your network connection.
                Currently using <strong className="capitalize">{contentQuality}</strong> quality.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { width: 600, height: 400, title: "High-Resolution Image" },
                  { width: 300, height: 200, title: "Medium-Resolution Image" }
                ].map((image, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="text-sm font-medium">{image.title}</h3>
                    <NetworkAwareContainer>
                      <AdaptiveImage
                        src={`https://picsum.photos/${image.width}/${image.height}?random=${i}`}
                        alt={`Sample adaptive image ${i+1}`}
                        width={image.width}
                        height={image.height}
                        className="w-full h-auto rounded-md"
                        enableLqip={true}
                      />
                    </NetworkAwareContainer>
                    <p className="text-xs text-muted-foreground">
                      Original: {image.width}x{image.height}, 
                      Adapted based on {quality} network quality
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="polling">
          <AdaptivePolling
            baseInterval={5000}
            onPoll={handlePoll}
            title="Adaptive Polling Demo"
          >
            <div className="space-y-4">
              <p className="text-sm">
                Polling interval automatically adjusts based on network quality.
                Current interval: <strong>{Math.round(adaptiveInterval / 1000)}s</strong>
              </p>
              
              <div className="h-40 border rounded-lg p-3 overflow-y-auto">
                {pollingData.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm pt-12">
                    Polling data will appear here
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pollingData.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm p-1 border-b">
                        <span>{new Date(item.id).toLocaleTimeString()}</span>
                        <span>Value: {item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AdaptivePolling>
        </TabsContent>
        
        <TabsContent value="batching">
          <Card>
            <CardHeader>
              <CardTitle>Request Batching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Requests are batched based on network quality. Current batch size: <strong>{batchSize}</strong>
              </p>
              
              <div className="mb-4">
                <Button 
                  onClick={handleProcessBatch} 
                  disabled={isProcessing || !isOnline}
                  className="w-full"
                >
                  {isProcessing ? `Processing... (${processedItems.length}/${demoItems.length})` : 'Process All Items'}
                </Button>
              </div>
              
              <div className="border rounded-lg p-3 h-64 overflow-y-auto">
                {processedItems.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm pt-24">
                    {isOnline ? 'Click the button to start processing' : 'Connect to the internet to process items'}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {processedItems.map((item, index) => (
                      <div key={index} className="text-xs p-1 border-b">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkAdaptationDemo;
