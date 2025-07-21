import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGDPRCompliance = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('export_user_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your personal data has been downloaded as a JSON file.",
      });

      return true;
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('delete_user_data', {
        target_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "All your data has been permanently deleted.",
      });

      // Sign out the user after deletion
      await supabase.auth.signOut();
      
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your data. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    exportUserData,
    deleteAllUserData,
    loading
  };
};