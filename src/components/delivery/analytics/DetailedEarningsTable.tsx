
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { DeliveryEarningsDetailed } from '@/types/delivery-analytics';
import { DollarSign, Search, Filter } from 'lucide-react';

interface DetailedEarningsTableProps {
  earnings: DeliveryEarningsDetailed[];
  loading: boolean;
}

export const DetailedEarningsTable: React.FC<DetailedEarningsTableProps> = ({ 
  earnings, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'paid' | 'disputed'>('all');

  if (loading) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Detailed Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = searchTerm === '' || 
      earning.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.assignment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || earning.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { variant: 'default' as const, color: 'text-green-400' };
      case 'processing':
        return { variant: 'secondary' as const, color: 'text-blue-400' };
      case 'pending':
        return { variant: 'outline' as const, color: 'text-yellow-400' };
      case 'disputed':
        return { variant: 'destructive' as const, color: 'text-red-400' };
      default:
        return { variant: 'outline' as const, color: 'text-gray-400' };
    }
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-quantum-cyan" />
            Detailed Earnings
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex rounded-lg border border-quantum-cyan/20 overflow-hidden">
              {['all', 'pending', 'processing', 'paid', 'disputed'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(status as any)}
                  className="rounded-none capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEarnings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No earnings records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-quantum-cyan/20">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Order</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Base</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Distance</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Tips</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Bonus</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Total</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEarnings.map((earning) => {
                  const statusBadge = getStatusBadge(earning.status);
                  return (
                    <tr 
                      key={earning.id} 
                      className="border-b border-quantum-cyan/10 hover:bg-quantum-darkBlue/20"
                    >
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {new Date(earning.earned_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(earning.earned_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          {earning.order_id && (
                            <div className="text-sm font-mono">
                              {earning.order_id.slice(-8)}
                            </div>
                          )}
                          {earning.surge_multiplier > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {earning.surge_multiplier}x surge
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        ${earning.base_fee.toFixed(2)}
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        ${earning.distance_fee.toFixed(2)}
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-yellow-400">
                        ${earning.tip_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-purple-400">
                        ${earning.bonus_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-green-400">
                        ${earning.total_earnings.toFixed(2)}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge variant={statusBadge.variant} className="capitalize">
                          {earning.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
