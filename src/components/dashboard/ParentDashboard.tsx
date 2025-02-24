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
import type {
  Chore,
  FamilyMember,
  Reward,
  ChoreStats,
  LeaderboardEntry,
} from '@/types/chores';

export function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats } = useQuery<ChoreStats>({
    queryKey: ['chore-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_chore_stats');
      if (error) throw error;
      return JSON.parse(data);
    },
  });

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) throw error;
      return JSON.parse(data || '[]');
    },
  });

  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_cost', { ascending: true });
      if (error) throw error;
      return (data || []).map(reward => ({
        ...reward,
        type: (reward.type || 'custom') as Reward['type']
      }));
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                  Chores Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <p className="text-2xl font-semibold">{stats.completed_chores}</p>
                    <p className="text-sm text-muted-foreground">Chores Completed</p>
                  </>
                ) : (
                  <p>Loading stats...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-purple-500" />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <p className="text-2xl font-semibold">{stats.total_points}</p>
                    <p className="text-sm text-muted-foreground">Total Points Earned</p>
                  </>
                ) : (
                  <p>Loading stats...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <p className="text-2xl font-semibold">{stats.completion_rate}%</p>
                    <p className="text-sm text-muted-foreground">Chore Completion Rate</p>
                  </>
                ) : (
                  <p>Loading stats...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-green-500" />
                  Pending Chores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <>
                    <p className="text-2xl font-semibold">{stats.pending_chores}</p>
                    <p className="text-sm text-muted-foreground">Chores Pending</p>
                  </>
                ) : (
                  <p>Loading stats...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Chore Completion Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={leaderboard}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="member_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_points" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards ? (
                  rewards.map((reward) => (
                    <div key={reward.id} className="border rounded-md p-4">
                      <h3 className="font-semibold">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <p className="text-blue-500">{reward.points_cost} Points</p>
                    </div>
                  ))
                ) : (
                  <p>Loading rewards...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="family">
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Family members will be listed here */}
                <p>List of family members will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
