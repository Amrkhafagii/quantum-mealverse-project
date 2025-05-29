
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Target, 
  Calendar,
  Plus,
  UserPlus,
  LogOut,
  Crown
} from 'lucide-react';
import { useTeamChallenges } from '@/hooks/useTeamChallenges';
import { CreateTeamModal } from './CreateTeamModal';
import { JoinTeamModal } from './JoinTeamModal';
import { format } from 'date-fns';

export const TeamChallenges: React.FC = () => {
  const {
    teams,
    userTeam,
    teamMembers,
    teamChallenges,
    teamProgress,
    isLoading,
    joinTeam,
    leaveTeam,
    createTeam
  } = useTeamChallenges();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'workout_count':
        return <Target className="h-4 w-4" />;
      case 'calorie_burn':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400">Loading team challenges...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-quantum-cyan" />
          <h2 className="text-3xl font-bold text-quantum-cyan">Team Challenges</h2>
        </div>
        
        <div className="flex gap-2">
          {!userTeam && (
            <>
              <Button 
                onClick={() => setShowJoinModal(true)}
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Team
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </>
          )}
        </div>
      </div>

      {userTeam ? (
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="bg-quantum-darkBlue/50">
            <TabsTrigger value="progress">Team Progress</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="challenges">Available Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-quantum-cyan flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      {userTeam.name}
                    </CardTitle>
                    <p className="text-gray-400 mt-1">{userTeam.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={leaveTeam}
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {teamProgress.length > 0 ? (
                teamProgress.map((progress) => (
                  <Card key={progress.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getChallengeTypeIcon(progress.challenge?.type || '')}
                          <div>
                            <CardTitle className="text-lg text-white">
                              {progress.challenge?.title}
                            </CardTitle>
                            <p className="text-sm text-gray-400 mt-1">
                              {progress.challenge?.description}
                            </p>
                          </div>
                        </div>
                        {progress.completed && (
                          <Badge className="bg-green-500 text-white">
                            Completed!
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">
                            {progress.total_progress.toLocaleString()} / {progress.target_value.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={getProgressPercentage(progress.total_progress, progress.target_value)}
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(progress.challenge?.start_date || '')} - {formatDate(progress.challenge?.end_date || '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          <span>{progress.challenge?.reward_points} points</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                  <CardContent className="p-8 text-center">
                    <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Active Challenges</h3>
                    <p className="text-gray-400">
                      Your team hasn't started any challenges yet. Check out available challenges!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4">
              {teamMembers.map((member) => (
                <Card key={member.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-quantum-cyan/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-quantum-cyan" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Member</p>
                          <p className="text-sm text-gray-400">
                            Joined {formatDate(member.joined_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={member.role === 'admin' ? 'default' : 'outline'}
                          className={member.role === 'admin' ? 'bg-quantum-purple' : ''}
                        >
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                        <p className="text-sm text-gray-400 mt-1">
                          {member.points_contributed} points contributed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div className="grid gap-4">
              {teamChallenges.map((challenge) => (
                <Card key={challenge.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getChallengeTypeIcon(challenge.type)}
                        <div>
                          <CardTitle className="text-lg text-white">
                            {challenge.title}
                          </CardTitle>
                          <p className="text-sm text-gray-400 mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-quantum-cyan text-quantum-cyan">
                        Team Challenge
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>Target: {challenge.target_value.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>{challenge.reward_points} points</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Join a Team</h3>
            <p className="text-gray-400 mb-6">
              Team up with other fitness enthusiasts to tackle challenges together and achieve more!
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setShowJoinModal(true)}
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Existing Team
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateTeamModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onTeamCreated={createTeam}
      />

      <JoinTeamModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        teams={teams}
        onTeamJoined={joinTeam}
      />
    </div>
  );
};
