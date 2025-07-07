
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  postId: string;
  reportType: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';
  reportReason?: string;
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
          post_id: reportData.postId,
          report_type: reportData.reportType,
          report_reason: reportData.reportReason,
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
