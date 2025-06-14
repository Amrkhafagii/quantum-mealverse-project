
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target_value: number;
  start_date: string;
  end_date: string;
  participants_count: number;
  is_active: boolean;
}

interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  fitness_challenge_participants_user_id: string;
  current_progress: number;
  is_completed: boolean;
  joined_at: string;
}

export const ChallengesList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userParticipations, setUserParticipations] = useState<ChallengeParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchChallenges();
      fetchUserParticipations();
    }
  }, [user?.id]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserParticipations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('fitness_challenge_participants')
        .select('*')
        .eq('fitness_challenge_participants_user_id', user.id);

      if (error) throw error;
      setUserParticipations(data || []);
    } catch (error) {
      console.error('Error fetching user participations:', error);
    }
  };

  const getUserParticipation = (challengeId: string) => {
    return userParticipations.find(p => p.challenge_id === challengeId);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('fitness_challenge_participants')
        .insert({
          challenge_id: challengeId,
          fitness_challenge_participants_user_id: user.id,
          current_progress: 0,
          is_completed: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the challenge!",
      });

      fetchUserParticipations();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = (participation: ChallengeParticipant, challenge: Challenge) => {
    if (!participation || !challenge.target_value) return 0;
    return Math.min((participation.current_progress / challenge.target_value) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-cyan mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading challenges...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-quantum-cyan" />
          Fitness Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
            <p className="text-gray-400">
              Check back later for new fitness challenges!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const participation = getUserParticipation(challenge.id);
              const isParticipating = !!participation;
              const progressPercentage = participation ? getProgressPercentage(participation, challenge) : 0;

              return (
                <div
                  key={challenge.id}
                  className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        <Badge variant={isParticipating ? "default" : "outline"}>
                          {isParticipating ? "Joined" : "Available"}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {challenge.participants_count} participants
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(challenge.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!isParticipating && (
                      <Button
                        onClick={() => joinChallenge(challenge.id)}
                        className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                  
                  {isParticipating && participation && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Your Progress</span>
                        <span>
                          {participation.current_progress} / {challenge.target_value}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-gray-400">
                        {progressPercentage.toFixed(1)}% complete
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
