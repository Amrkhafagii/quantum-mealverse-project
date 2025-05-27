
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSupportTickets } from '@/hooks/delivery/useSupportTickets';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SupportTicketSystemProps {
  orderId?: string;
  deliveryAssignmentId?: string;
}

export const SupportTicketSystem: React.FC<SupportTicketSystemProps> = ({
  orderId,
  deliveryAssignmentId
}) => {
  const { tickets, loading, createTicket } = useSupportTickets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const handleCreateTicket = async () => {
    if (!formData.category || !formData.subject || !formData.description) return;

    const ticket = await createTicket(
      formData.category as any,
      formData.subject,
      formData.description,
      formData.priority,
      orderId,
      deliveryAssignmentId
    );

    if (ticket) {
      setShowCreateForm(false);
      setFormData({
        category: '',
        subject: '',
        description: '',
        priority: 'medium'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-red-400" />;
      case 'in_progress':
        return <MessageSquare className="h-4 w-4 text-yellow-400" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 text-red-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-quantum-cyan" />
            Support Tickets
          </CardTitle>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create ticket form */}
        {showCreateForm && (
          <Card className="border border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-lg">Create Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery_issue">Delivery Issue</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="technical_issue">Technical Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject"
              />

              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your issue..."
                rows={4}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={!formData.category || !formData.subject || !formData.description || loading}
                  className="flex-1"
                >
                  Create Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets list */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No support tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="border border-quantum-cyan/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ticket.ticket_number}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{ticket.category.replace('_', ' ')}</span>
                        <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
