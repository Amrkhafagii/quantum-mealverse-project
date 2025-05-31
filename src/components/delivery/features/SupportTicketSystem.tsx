
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupportTickets } from '@/hooks/delivery/useSupportTickets';
import { createNotificationHook } from '@/utils/common/notificationUtils';
import { validateTicketForm, getFieldError, type TicketFormData, type ValidationError } from '@/utils/validation/ticketValidation';
import { formatTicketDate, formatRelativeTime } from '@/utils/common/dateUtils';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface SupportTicketSystemProps {
  orderId?: string;
  deliveryAssignmentId?: string;
}

export const SupportTicketSystem: React.FC<SupportTicketSystemProps> = ({
  orderId,
  deliveryAssignmentId
}) => {
  const { tickets, loading, createTicket } = useSupportTickets();
  const { showSuccess, showError } = createNotificationHook();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState<TicketFormData>({
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  });

  const resetForm = () => {
    setFormData({
      category: '',
      subject: '',
      description: '',
      priority: 'medium'
    });
    setValidationErrors([]);
  };

  const handleFormChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific validation error when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleCreateTicket = async () => {
    // Validate form
    const errors = validateTicketForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      showError('Validation Error', 'Please fix the errors below before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createTicket(
        formData.category as any,
        formData.subject.trim(),
        formData.description.trim(),
        formData.priority,
        orderId,
        deliveryAssignmentId
      );

      if (ticket) {
        setShowCreateForm(false);
        resetForm();
        showSuccess(
          'Ticket Created Successfully',
          `Your support ticket #${ticket.ticket_number} has been created. We'll get back to you soon.`
        );
      } else {
        showError(
          'Failed to Create Ticket',
          'There was an error creating your support ticket. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showError(
        'Unexpected Error',
        'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setSubmitting(false);
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
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const TicketSkeleton = () => (
    <Card className="border border-quantum-cyan/10">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="holographic-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-quantum-cyan" />
            Support Tickets
            {tickets.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {tickets.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            disabled={showCreateForm}
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
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the following errors:
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleFormChange('category', value)}
                  disabled={submitting}
                >
                  <SelectTrigger className={getFieldError(validationErrors, 'category') ? 'border-red-500' : ''}>
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
                {getFieldError(validationErrors, 'category') && (
                  <p className="text-sm text-red-500">{getFieldError(validationErrors, 'category')}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => handleFormChange('priority', value)}
                  disabled={submitting}
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                  maxLength={100}
                  disabled={submitting}
                  className={getFieldError(validationErrors, 'subject') ? 'border-red-500' : ''}
                />
                <div className="flex justify-between items-center">
                  {getFieldError(validationErrors, 'subject') && (
                    <p className="text-sm text-red-500">{getFieldError(validationErrors, 'subject')}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">{formData.subject.length}/100</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Provide detailed information about your issue..."
                  rows={4}
                  maxLength={1000}
                  disabled={submitting}
                  className={getFieldError(validationErrors, 'description') ? 'border-red-500' : ''}
                />
                <div className="flex justify-between items-center">
                  {getFieldError(validationErrors, 'description') && (
                    <p className="text-sm text-red-500">{getFieldError(validationErrors, 'description')}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">{formData.description.length}/1000</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets list */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <TicketSkeleton key={i} />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Card className="border border-dashed border-gray-300">
              <CardContent className="text-center py-12">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
                <p className="text-gray-400 mb-4">
                  You haven't created any support tickets yet.
                </p>
                {!showCreateForm && (
                  <Button onClick={() => setShowCreateForm(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="border border-quantum-cyan/10 hover:border-quantum-cyan/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          #{ticket.ticket_number}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ticket.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-lg mb-1">{ticket.subject}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created {formatRelativeTime(ticket.created_at)}</span>
                        <span>•</span>
                        <span>{formatTicketDate(ticket.created_at)}</span>
                        {ticket.updated_at !== ticket.created_at && (
                          <>
                            <span>•</span>
                            <span>Updated {formatRelativeTime(ticket.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(ticket.status)}
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
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
