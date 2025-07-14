import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Brain, 
  Target, 
  BarChart3,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { useEnhancedAIRecommendations } from '@/hooks/useEnhancedAIRecommendations';

const AIRecommendationAnalytics = () => {
  const { getRecommendationAnalytics, getUserPreferenceInsights } = useEnhancedAIRecommendations();
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [analyticsData, insightsData] = await Promise.all([
          getRecommendationAnalytics(),
          getUserPreferenceInsights(),
        ]);
        setAnalytics(analyticsData);
        setInsights(insightsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getRecommendationAnalytics, getUserPreferenceInsights]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available yet. Start using AI recommendations to see insights!</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (score: string) => {
    switch (score) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (score: string) => {
    switch (score) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">AI Recommendation Intelligence</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
                <p className="text-2xl font-bold">{analytics.totalRecommendations}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Trend</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${getTrendColor(analytics.improvementScore)}`}>
                    {analytics.recentTrend.toFixed(1)}
                  </p>
                  {getTrendIcon(analytics.improvementScore)}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={analytics.improvementScore === 'improving' ? 'default' : 'secondary'}>
                  {analytics.improvementScore}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learned Insights</p>
                <p className="text-2xl font-bold">
                  {String(Object.values(insights).reduce((sum: number, arr: unknown) => sum + (Array.isArray(arr) ? arr.length : 0), 0))}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
          <TabsTrigger value="insights">Learned Preferences</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Positive (4-5 stars)</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.sentimentBreakdown.positive} recommendations
                  </span>
                </div>
                <Progress 
                  value={(analytics.sentimentBreakdown.positive / analytics.totalRecommendations) * 100} 
                  className="h-2 bg-green-100"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Neutral (3 stars)</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.sentimentBreakdown.neutral} recommendations
                  </span>
                </div>
                <Progress 
                  value={(analytics.sentimentBreakdown.neutral / analytics.totalRecommendations) * 100} 
                  className="h-2 bg-yellow-100"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Negative (1-2 stars)</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.sentimentBreakdown.negative} recommendations
                  </span>
                </div>
                <Progress 
                  value={(analytics.sentimentBreakdown.negative / analytics.totalRecommendations) * 100} 
                  className="h-2 bg-red-100"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">No Feedback</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.sentimentBreakdown.no_feedback} recommendations
                  </span>
                </div>
                <Progress 
                  value={(analytics.sentimentBreakdown.no_feedback / analytics.totalRecommendations) * 100} 
                  className="h-2 bg-gray-100"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(insights).map(([type, typeInsights]: [string, any]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {type.replace('_', ' ')} Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeInsights.slice(0, 5).map((insight: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {(insight.insight_data as any).liked_aspects?.join(', ') || 
                             (insight.insight_data as any).disliked_aspects?.join(', ') ||
                             JSON.stringify(insight.insight_data)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Confirmed {insight.times_confirmed} times
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(insight.confidence_score * 100)}%
                        </Badge>
                      </div>
                    ))}
                    {typeInsights.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No {type.replace('_', ' ')} insights yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Recommendation Accuracy</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((analytics.averageRating / 5) * 100)}%
                    </span>
                  </div>
                  <Progress value={(analytics.averageRating / 5) * 100} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">User Engagement</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(((analytics.totalRecommendations - analytics.sentimentBreakdown.no_feedback) / analytics.totalRecommendations) * 100)}% feedback rate
                    </span>
                  </div>
                  <Progress 
                    value={((analytics.totalRecommendations - analytics.sentimentBreakdown.no_feedback) / analytics.totalRecommendations) * 100} 
                    className="h-3" 
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">AI Improvement Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.sentimentBreakdown.positive}
                      </p>
                      <p className="text-sm text-muted-foreground">Successful Recommendations</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {String(Object.values(insights).reduce((sum: number, arr: unknown) => sum + (Array.isArray(arr) ? arr.length : 0), 0))}
                      </p>
                      <p className="text-sm text-muted-foreground">Preference Patterns Learned</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIRecommendationAnalytics;