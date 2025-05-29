
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: (teamData: { name: string; description?: string; image_url?: string }) => Promise<boolean>;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onOpenChange,
  onTeamCreated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    
    const success = await onTeamCreated({
      name: formData.name,
      description: formData.description || undefined,
      image_url: formData.image_url || undefined
    });
    
    if (success) {
      setFormData({ name: '', description: '', image_url: '' });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-quantum-darkBlue border-quantum-cyan/20">
        <DialogHeader>
          <DialogTitle className="text-quantum-cyan">Create New Team</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name"
              className="bg-quantum-black/50 border-quantum-cyan/20 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your team's goals and vibe"
              className="bg-quantum-black/50 border-quantum-cyan/20 text-white"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-white">Team Image URL (optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/team-logo.jpg"
              className="bg-quantum-black/50 border-quantum-cyan/20 text-white"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-quantum-cyan/20 text-white hover:bg-quantum-cyan/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/90 text-black"
            >
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
