
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, User, Shield } from 'lucide-react';
import type { DeliveryEmergencyContact } from '@/types/availability';

interface EmergencyContactSettingsProps {
  emergencyContacts: DeliveryEmergencyContact[];
  createEmergencyContact: (contact: Omit<DeliveryEmergencyContact, 'id' | 'created_at' | 'updated_at'>) => Promise<DeliveryEmergencyContact | undefined>;
  isProcessing: boolean;
}

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Colleague',
  'Manager',
  'Other'
];

export const EmergencyContactSettings: React.FC<EmergencyContactSettingsProps> = ({
  emergencyContacts,
  createEmergencyContact,
  isProcessing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    relationship: '',
    is_primary: false,
    contact_priority: 1
  });

  const handleCreateContact = async () => {
    if (!newContact.contact_name || !newContact.contact_phone || !newContact.relationship) {
      return;
    }

    const contact = await createEmergencyContact({
      delivery_user_id: '', // Will be set by the service
      contact_name: newContact.contact_name,
      contact_phone: newContact.contact_phone,
      contact_email: newContact.contact_email || undefined,
      relationship: newContact.relationship,
      is_primary: newContact.is_primary,
      contact_priority: newContact.contact_priority,
      is_active: true
    });

    if (contact) {
      setShowAddForm(false);
      setNewContact({
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        relationship: '',
        is_primary: false,
        contact_priority: 1
      });
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Emergency Contact Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure emergency contacts for safety and support
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {showAddForm && (
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardHeader>
            <CardTitle>Add Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name *</Label>
                <Input
                  value={newContact.contact_name}
                  onChange={(e) => setNewContact({ ...newContact, contact_name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={newContact.contact_phone}
                  onChange={(e) => setNewContact({ ...newContact, contact_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={newContact.contact_email}
                  onChange={(e) => setNewContact({ ...newContact, contact_email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Select
                  value={newContact.relationship}
                  onValueChange={(value) => setNewContact({ ...newContact, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map(relationship => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select
                  value={newContact.contact_priority.toString()}
                  onValueChange={(value) => setNewContact({ ...newContact, contact_priority: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Highest Priority</SelectItem>
                    <SelectItem value="2">2 - High Priority</SelectItem>
                    <SelectItem value="3">3 - Medium Priority</SelectItem>
                    <SelectItem value="4">4 - Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Primary Contact</Label>
                <p className="text-sm text-muted-foreground">
                  This contact will be called first in emergencies
                </p>
              </div>
              <Switch
                checked={newContact.is_primary}
                onCheckedChange={(checked) => setNewContact({ ...newContact, is_primary: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateContact} disabled={isProcessing}>
                Save Contact
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {emergencyContacts.length === 0 ? (
          <Card className="border border-quantum-cyan/20 bg-transparent">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emergency contacts configured</p>
                <p className="text-sm">Add your first emergency contact for safety</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          emergencyContacts.map((contact) => (
            <Card key={contact.id} className="border border-quantum-cyan/20 bg-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-quantum-cyan/20">
                      <User className="h-4 w-4 text-quantum-cyan" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{contact.contact_name}</div>
                        {contact.is_primary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                        <Badge variant="outline">
                          Priority {contact.contact_priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contact.relationship}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {formatPhoneNumber(contact.contact_phone)}
                        </div>
                        {contact.contact_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {contact.contact_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
