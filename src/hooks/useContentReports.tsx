
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  postId?: string;
  userId?: string;
  reason: string;
  description?: string;
}

export const useContentReports = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitReport = async (reportData: ReportData) => {
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          reported_post_id: reportData.postId || null,
          reported_user_id: reportData.userId || null,
          reason: reportData.reason,
          description: reportData.description,
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe. We'll review your report.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitReport,
    submitting
  };
};
