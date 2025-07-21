import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Heart, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRecommendationFeedback } from '@/hooks/useRecommendationFeedback';

interface RecommendationFeedbackProps {
  recommendationId: string;
  isCompact?: boolean;
  onFeedbackSubmitted?: () => void;
}

const ASPECT_OPTIONS = [
  'Color combination',
  'Style appropriateness',
  'Comfort',
  'Fit guidance',
  'Trend relevance',
  'Weather suitability',
  'Occasion matching',
  'Personal style reflection',
  'Accessory suggestions',
  'Overall cohesiveness'
];

const RecommendationFeedback = ({ 
  recommendationId, 
  isCompact = false,
  onFeedbackSubmitted 
}: RecommendationFeedbackProps) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<'initial' | 'after_wear' | 'general'>('initial');
  const [likedAspects, setLikedAspects] = useState<string[]>([]);
  const [dislikedAspects, setDislikedAspects] = useState<string[]>([]);
  const [improvementSuggestions, setImprovementSuggestions] = useState('');
  const [alternativePreferences, setAlternativePreferences] = useState('');
  const [wouldWearAgain, setWouldWearAgain] = useState<boolean | null>(null);
  const [occasionRating, setOccasionRating] = useState<number>(0);
  const [comfortRating, setComfortRating] = useState<number>(0);
  const [styleRating, setStyleRating] = useState<number>(0);
  const [showDetailed, setShowDetailed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { submitFeedback, markAsWorn, isSubmitting } = useRecommendationFeedback();

  const handleAspectToggle = (aspect: string, isLiked: boolean) => {
    if (isLiked) {
      setLikedAspects(prev => 
        prev.includes(aspect) 
          ? prev.filter(a => a !== aspect)
          : [...prev, aspect]
      );
      setDislikedAspects(prev => prev.filter(a => a !== aspect));
    } else {
      setDislikedAspects(prev => 
        prev.includes(aspect) 
          ? prev.filter(a => a !== aspect)
          : [...prev, aspect]
      );
      setLikedAspects(prev => prev.filter(a => a !== aspect));
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    const success = await submitFeedback(recommendationId, {
      rating,
      feedbackType,
      likedAspects: likedAspects.length > 0 ? likedAspects : undefined,
      dislikedAspects: dislikedAspects.length > 0 ? dislikedAspects : undefined,
      improvementSuggestions: improvementSuggestions || undefined,
      alternativePreferences: alternativePreferences || undefined,
      wouldWearAgain: wouldWearAgain || undefined,
      occasionAppropriateness: occasionRating || undefined,
      comfortRating: comfortRating || undefined,
      styleSatisfaction: styleRating || undefined,
    });

    if (success) {
      setSubmitted(true);
      onFeedbackSubmitted?.();
    }
  };

  const handleMarkAsWorn = async () => {
    await markAsWorn(recommendationId);
    setFeedbackType('after_wear');
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Thank you for your feedback!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className="border-indigo-200">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate this recommendation:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsWorn}
                className="flex-1"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Wore This
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailed(true)}
                className="flex-1"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Detailed Feedback
              </Button>
            </div>

            {rating > 0 && (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="sm"
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          How was this recommendation?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feedback Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Feedback timing:</label>
          <div className="flex gap-2">
            {[
              { value: 'initial', label: 'Initial thoughts' },
              { value: 'after_wear', label: 'After wearing' },
              { value: 'general', label: 'General feedback' }
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={feedbackType === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType(value as any)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overall Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Overall rating:</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-colors hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Ratings */}
        {showDetailed && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Occasion fit:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 cursor-pointer ${
                        star <= occasionRating
                          ? 'fill-blue-400 text-blue-400'
                          : 'text-gray-300'
                      }`}
                      onClick={() => setOccasionRating(star)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Comfort:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 cursor-pointer ${
                        star <= comfortRating
                          ? 'fill-green-400 text-green-400'
                          : 'text-gray-300'
                      }`}
                      onClick={() => setComfortRating(star)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Style satisfaction:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 cursor-pointer ${
                        star <= styleRating
                          ? 'fill-purple-400 text-purple-400'
                          : 'text-gray-300'
                      }`}
                      onClick={() => setStyleRating(star)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Aspect Feedback */}
        {rating > 0 && (
          <>
            <div>
              <label className="text-sm font-medium mb-3 block">What did you like/dislike?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ASPECT_OPTIONS.map((aspect) => (
                  <div key={aspect} className="flex gap-1">
                    <Button
                      variant={likedAspects.includes(aspect) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAspectToggle(aspect, true)}
                      className="flex-1 text-xs"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {aspect}
                    </Button>
                    <Button
                      variant={dislikedAspects.includes(aspect) ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleAspectToggle(aspect, false)}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Would Wear Again */}
            {feedbackType === 'after_wear' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Would you wear this again?</label>
                <div className="flex gap-2">
                  <Button
                    variant={wouldWearAgain === true ? 'default' : 'outline'}
                    onClick={() => setWouldWearAgain(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Yes, loved it!
                  </Button>
                  <Button
                    variant={wouldWearAgain === false ? 'destructive' : 'outline'}
                    onClick={() => setWouldWearAgain(false)}
                  >
                    Not really
                  </Button>
                </div>
              </div>
            )}

            {/* Text Feedback */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Suggestions for improvement:
                </label>
                <Textarea
                  value={improvementSuggestions}
                  onChange={(e) => setImprovementSuggestions(e.target.value)}
                  placeholder="What could make this recommendation better?"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Alternative preferences:
                </label>
                <Textarea
                  value={alternativePreferences}
                  onChange={(e) => setAlternativePreferences(e.target.value)}
                  placeholder="What would you prefer instead?"
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        {rating > 0 && (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        )}

        {!showDetailed && (
          <Button
            variant="ghost"
            onClick={() => setShowDetailed(true)}
            className="w-full"
          >
            Show detailed feedback options
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationFeedback;