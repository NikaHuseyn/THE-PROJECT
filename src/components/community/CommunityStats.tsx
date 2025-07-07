
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Heart, MessageSquare } from 'lucide-react';

interface CommunityStatsProps {
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    activeUsers: number;
  };
}

const CommunityStats = ({ stats }: CommunityStatsProps) => {
  const statItems = [
    {
      label: 'Active Users',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100'
    },
    {
      label: 'Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommunityStats;
