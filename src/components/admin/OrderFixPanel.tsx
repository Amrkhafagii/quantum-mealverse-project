
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { OrderFixService } from '@/services/orders/orderFixService';
import { Badge } from '@/components/ui/badge';

export const OrderFixPanel = () => {
  const [orderId, setOrderId] = useState('55be4a0c-1da0-42e5-a66e-efaec2ff331a');
  const [isFixing, setIsFixing] = useState(false);
  const [brokenAssignments, setBrokenAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFixOrder = async () => {
    if (!orderId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an order ID',
        variant: 'destructive'
      });
      return;
    }

    setIsFixing(true);
    try {
      const result = await OrderFixService.fixOrder(orderId.trim());
      
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      
      if (result.success) {
        // Refresh the broken assignments list
        loadBrokenAssignments();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fix order',
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };

  const loadBrokenAssignments = async () => {
    setIsLoading(true);
    try {
      const assignments = await OrderFixService.getBrokenAssignments();
      setBrokenAssignments(assignments);
    } catch (error) {
      console.error('Error loading broken assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupAllBroken = async () => {
    setIsLoading(true);
    try {
      const deletedCount = await OrderFixService.cleanupBrokenAssignments();
      toast({
        title: 'Cleanup Complete',
        description: `Deleted ${deletedCount} broken assignments`,
      });
      loadBrokenAssignments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cleanup broken assignments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadBrokenAssignments();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fix Order Assignment</CardTitle>
          <CardDescription>
            Fix orders with broken restaurant assignments (NULL restaurant_id)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <Button onClick={handleFixOrder} disabled={isFixing}>
              {isFixing ? 'Fixing...' : 'Fix Order'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Broken Assignments</CardTitle>
            <CardDescription>
              Assignments with NULL restaurant_id that need fixing
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={cleanupAllBroken}
            disabled={isLoading}
          >
            {isLoading ? 'Cleaning...' : 'Cleanup All'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : brokenAssignments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No broken assignments found
            </div>
          ) : (
            <div className="space-y-2">
              {brokenAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Order: {assignment.order_id}</div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {assignment.orders?.customer_name} | 
                      Total: ${assignment.orders?.total} |
                      Status: <Badge variant="secondary">{assignment.status}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setOrderId(assignment.order_id);
                      handleFixOrder();
                    }}
                  >
                    Fix
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
