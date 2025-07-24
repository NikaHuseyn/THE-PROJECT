import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { AlertTriangle, Eye, Check, X, Shield } from 'lucide-react';

interface ContentReport {
  id: string;
  post_id: string;
  report_type: string;
  report_reason: string;
  status: string;
  created_at: string;
  posts: {
    id: string;
    caption: string;
    image_urls: string[];
    is_flagged: boolean;
    flag_reason: string;
    user_id: string;
  };
  reporter: {
    display_name: string;
  };
}

interface FlaggedPost {
  id: string;
  caption: string;
  image_urls: string[];
  is_flagged: boolean;
  flag_reason: string;
  created_at: string;
  user_id: string;
  social_profiles: {
    display_name: string;
  };
}

const ContentModerationPanel = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isModerator, hasRole, loading: adminLoading } = useAdminAccess();

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      
      // Fetch content reports (simplified query first)
      const { data: reportsData, error: reportsError } = await supabase
        .from('content_reports')
        .select(`
          id,
          post_id,
          report_type,
          report_reason,
          status,
          created_at,
          posts (
            id,
            caption,
            image_urls,
            is_flagged,
            flag_reason,
            user_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportsError) throw reportsError;

      // Fetch flagged posts with user info from posts table only
      const { data: flaggedData, error: flaggedError } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          image_urls,
          is_flagged,
          flag_reason,
          created_at,
          user_id
        `)
        .eq('is_flagged', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (flaggedError) throw flaggedError;

      // Transform the data to match our interfaces
      const transformedReports: ContentReport[] = (reportsData || []).map(report => ({
        ...report,
        reporter: { display_name: 'Unknown User' } // Simplified for now
      }));

      const transformedFlagged: FlaggedPost[] = (flaggedData || []).map(post => ({
        ...post,
        social_profiles: { display_name: 'Unknown User' } // Simplified for now
      }));

      setReports(transformedReports);
      setFlaggedPosts(transformedFlagged);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ status: action === 'approve' ? 'resolved' : 'dismissed' })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: action === 'approve' ? "Report Approved" : "Report Dismissed",
        description: `The report has been ${action === 'approve' ? 'approved' : 'dismissed'}.`,
      });

      fetchModerationData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    }
  };

  const handlePostAction = async (postId: string, action: 'unflag' | 'delete') => {
    try {
      if (action === 'unflag') {
        const { error } = await supabase
          .from('posts')
          .update({ is_flagged: false, flag_reason: null })
          .eq('id', postId);

        if (error) throw error;

        toast({
          title: "Post Unflagged",
          description: "The post has been restored to the community.",
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;

        toast({
          title: "Post Deleted",
          description: "The post has been permanently removed.",
        });
      }

      fetchModerationData();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post status.",
        variant: "destructive",
      });
    }
  };

  if (adminLoading || loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading moderation panel...</div>
        </CardContent>
      </Card>
    );
  }

  // Check if user has moderator or admin access
  if (!hasRole('moderator') && !hasRole('admin')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need moderator or admin privileges to access the content moderation panel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Content Moderation Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports" className="w-full">
          <TabsList>
            <TabsTrigger value="reports">
              Reports ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged Posts ({flaggedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {reports.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending reports
              </div>
            ) : (
              reports
                .filter(r => r.status === 'pending')
                .map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="destructive">{report.report_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{report.report_reason}</p>
                          {report.posts && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-medium">Reported Post:</p>
                              <p className="text-sm">{report.posts.caption}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'reject')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReportAction(report.id, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="flagged" className="space-y-4">
            {flaggedPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No flagged posts
              </div>
            ) : (
              flaggedPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="destructive">Flagged</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {post.social_profiles?.display_name || 'Unknown User'}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{post.caption}</p>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">
                            Flag Reason: {post.flag_reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePostAction(post.id, 'unflag')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handlePostAction(post.id, 'delete')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentModerationPanel;