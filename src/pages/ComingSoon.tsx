import React, { useState } from 'react';
import { Sparkles, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Missing information",
        description: "Please provide both your name and email",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, name }]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you when we launch.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Something Special is Coming
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            We're crafting an extraordinary fashion experience powered by AI. 
            Be the first to know when we launch.
          </p>
          
          <Link 
            to="/app" 
            className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
          >
            Already have access? Enter the app →
          </Link>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base bg-background/50 backdrop-blur border-border"
                disabled={isSubmitting}
              />
              
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base bg-background/50 backdrop-blur border-border"
                disabled={isSubmitting}
              />
            </div>

            <Button 
              type="submit" 
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Joining..."
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Join the Waitlist
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground">You're In!</h3>
            <p className="text-muted-foreground">
              We'll send you an exclusive invite when we're ready to launch.
            </p>
          </div>
        )}

        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            AI-powered styling • Personalized recommendations • Fashion trends
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;