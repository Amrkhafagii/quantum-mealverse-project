
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown } from 'lucide-react';
import { Team } from '@/types/fitness/challenges';
import { format } from 'date-fns';

interface JoinTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  onTeamJoined: (teamId: string) => Promise<boolean>;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  open,
  onOpenChange,
  teams,
  onTeamJoined
}) => {
  const [isJoining, setIsJoining] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleJoinTeam = async (teamId: string) => {
    setIsJoining(true);
    setSelectedTeamId(teamId);
    
    const success = await onTeamJoined(teamId);
    
    if (success) {
      onOpenChange(false);
    }
    
    setIsJoining(false);
    setSelectedTeamId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-quantum-darkBlue border-quantum-cyan/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-quantum-cyan">Join a Team</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {teams.length > 0 ? (
            teams.map((team) => (
              <Card key={team.id} className="bg-quantum-black/30 border-quantum-cyan/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {team.image_url ? (
                        <img 
                          src={team.image_url} 
                          alt={team.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-quantum-cyan/20 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-quantum-cyan" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{team.name}</h3>
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {team.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Created {format(new Date(team.created_at), 'MMM dd, yyyy')}</span>
                          <Badge variant="outline" className="border-quantum-cyan/50 text-quantum-cyan">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinTeam(team.id)}
                      disabled={isJoining}
                      className="bg-quantum-purple hover:bg-quantum-purple/90"
                    >
                      {isJoining && selectedTeamId === team.id ? 'Joining...' : 'Join'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Teams Available</h3>
              <p className="text-gray-400">
                There are currently no teams to join. Why not create the first one?
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-quantum-cyan/20 text-white hover:bg-quantum-cyan/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
