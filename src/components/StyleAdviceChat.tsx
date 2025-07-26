import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const StyleAdviceChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your personal style advisor. Ask me anything about fashion, styling tips, outfit ideas, color combinations, or fashion trends. How can I help you look your best today?",
      timestamp: new Date()
    }]);
  }, []);

  const sampleQuestions = [
    "What colors look best with my skin tone?",
    "How can I style a basic white shirt differently?",
    "What are the must-have pieces for this season?",
    "How do I dress for my body type?",
    "What's the difference between smart casual and business casual?"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: {
          recommendationType: 'style_advice',
          styleQuestion: userMessage.content,
          conversationHistory: messages.slice(-6) // Last 6 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.advice || data.recommendation?.reasoning || "I'd be happy to help with your style question! Could you provide a bit more detail so I can give you the best advice?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting style advice:', error);
      toast.error('Sorry, I had trouble getting your style advice. Please try again.');
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now, but I'd love to help with your style question! In the meantime, feel free to browse our trending styles and recommendations above.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="card-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personal Style Advisor
          </CardTitle>
          <p className="text-muted-foreground">
            Get personalized fashion advice, styling tips, and expert recommendations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Questions */}
          {messages.length <= 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
                    onClick={() => handleSampleQuestion(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border shadow-sm rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking about your style...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about style, fashion, or outfits..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleAdviceChat;