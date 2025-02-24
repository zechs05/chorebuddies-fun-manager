
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Trophy,
  Star,
  Gift,
  Settings,
  Bell,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Chore,
  FamilyMember,
  Reward,
  ChoreStats,
  LeaderboardEntry,
} from '@/types/chores';

export function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats } = useQuery({
    queryKey: ['chore-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_chore_stats');
      if (error) throw error;
      return data as ChoreStats;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
  });

  const { data: rewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_cost', { ascending: true });
      if (error) throw error;
      return (data || []).map(reward => ({
        ...reward,
        type: reward.type || 'custom'
      })) as Reward[];
    },
  });

  const { data: familyMembers } = useQuery<FamilyMember[]>({
    queryKey: ['family-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Chores</p>
                    <p className="text-2xl font-semibold">
                      {stats?.completed_chores || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Total Points</p>
                    <p className="text-2xl font-semibold">
                      {stats?.total_points || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Completion Rate</p>
                    <p className="text-2xl font-semibold">
                      {stats?.completion_rate || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Family Members</p>
                    <p className="text-2xl font-semibold">
                      {familyMembers?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="member_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed_chores" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Family Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(leaderboard || []).map((entry, index) => (
                  <div
                    key={entry.member_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{entry.member_name}</p>
                        <p className="text-sm text-gray-500">
                          {entry.completed_chores} chores completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        {entry.total_points} points
                      </p>
                      <p className="text-sm text-gray-500">
                        {entry.streak_days} day streak
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(rewards || []).map((reward) => (
                  <Card key={reward.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{reward.title}</h3>
                          <p className="text-sm text-gray-500">
                            {reward.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            {reward.points_cost} points
                          </p>
                          <Button variant="outline" size="sm">
                            <Gift className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add settings UI here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
