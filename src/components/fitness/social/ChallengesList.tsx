
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Calendar, Target, Plus, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  max_participants?: number;
  prize_description?: string;
  created_by: string;
  is_public: boolean;
  user_progress?: number;
  is_participant?: boolean;
  is_completed?: boolean;
}

export const ChallengesList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'joined' | 'available'>('all');

  useEffect(() => {
    fetchChallenges();
  }, [user, filter]);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('fitness_challenges')
        .select(`
          *,
          fitness_challenge_participants!inner (
            current_progress,
            is_completed,
            user_id
          )
        `)
        .eq('is_public', true)
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (filter === 'joined') {
        query = query.eq('fitness_challenge_participants.user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChallenges = data?.map(challenge => ({
        ...challenge,
        user_progress: challenge.fitness_challenge_participants?.find(
          (p: any) => p.user_id === user.id
        )?.current_progress || 0,
        is_participant: challenge.fitness_challenge_participants?.some(
          (p: any) => p.user_id === user.id
        ) || false,
        is_completed: challenge.fitness_challenge_participants?.find(
          (p: any) => p.user_id === user.id
        )?.is_completed || false
      })) || [];

      if (filter === 'available') {
        setChallenges(formattedChallenges.filter(c => !c.is_participant));
      } else {
        setChallenges(formattedChallenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error loading challenges",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('fitness_challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: 0
        });

      if (error) throw error;

      // Update participants count
      await supabase.rpc('increment_challenge_participants', {
        challenge_id: challengeId
      });

      toast({
        title: "Challenge joined!",
        description: "Good luck achieving your goal!",
      });

      fetchChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error joining challenge",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'distance':
        return '🏃';
      case 'duration':
        return '⏱️';
      case 'frequency':
        return '📅';
      case 'weight':
        return '🏋️';
      default:
        return '🎯';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'distance':
        return 'bg-blue-500/20 text-blue-400';
      case 'duration':
        return 'bg-green-500/20 text-green-400';
      case 'frequency':
        return 'bg-purple-500/20 text-purple-400';
      case 'weight':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-quantum-darkBlue/30 border-quantum-cyan/20 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['all', 'joined', 'available'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
            className={filter === filterType ? 'bg-quantum-cyan text-quantum-black' : ''}
          >
            {filterType === 'all' && 'All Challenges'}
            {filterType === 'joined' && 'My Challenges'}
            {filterType === 'available' && 'Available'}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {challenges.length === 0 ? (
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Challenges Found</h3>
              <p className="text-gray-400">
                {filter === 'joined' 
                  ? "You haven't joined any challenges yet"
                  : "No challenges available at the moment"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-colors ${
                challenge.is_completed ? 'border-green-400/30 bg-green-400/10' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getChallengeTypeIcon(challenge.challenge_type)}</span>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        {challenge.is_completed && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{challenge.description}</p>
                    </div>
                    <Badge className={getChallengeTypeColor(challenge.challenge_type)}>
                      {challenge.challenge_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Target</div>
                      <div className="font-semibold text-quantum-cyan">
                        {challenge.target_value} {challenge.target_unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="font-semibold">
                        {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                      </div>
                    </div>
                  </div>

                  {challenge.is_participant && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Your Progress</span>
                        <span>{challenge.user_progress}/{challenge.target_value} {challenge.target_unit}</span>
                      </div>
                      <Progress 
                        value={(challenge.user_progress / challenge.target_value) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.participants_count}
                        {challenge.max_participants && ` / ${challenge.max_participants}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {getDaysRemaining(challenge.end_date)} days left
                      </div>
                    </div>

                    {!challenge.is_participant && (
                      <Button
                        onClick={() => joinChallenge(challenge.id)}
                        size="sm"
                        className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}

                    {challenge.is_completed && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        Completed!
                      </Badge>
                    )}
                  </div>

                  {challenge.prize_description && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
                        <Trophy className="w-4 h-4" />
                        Prize
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{challenge.prize_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
