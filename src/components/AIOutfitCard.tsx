import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Lightbulb, Users, ShoppingBag, MapPin, Shirt, ExternalLink, Tag } from 'lucide-react';

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  recommended_items: any;
  occasion?: string;
  weather_context?: any;
  confidence_score?: number;
  reasoning?: string;
  ai_insights?: {
    styling_tips?: string[];
    alternative_options?: any;
    color_analysis?: string;
    fit_guidance?: string;
    wardrobe_analysis?: {
      items_used?: string[];
      gaps_identified?: string[];
      coverage_score?: number;
    };
    shopping_suggestions?: {
      priority_items?: string[];
      total_investment_needed?: string;
      wardrobe_utilization?: string;
      recommended_approach?: string;
      uk_shopping_guide?: {
        high_street_stores?: any;
        rental_platforms?: any;
        vintage_and_period?: any;
        department_stores?: any;
      };
      costume_and_theatrical?: any;
    };
  };
}

interface AIOutfitCardProps {
  recommendation: AIRecommendation;
  title: string;
  description: string;
  aiInsights?: any;
}

const AIOutfitCard = ({ recommendation, title, description }: AIOutfitCardProps) => {
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            AI Powered
          </Badge>
        </div>
        {recommendation.confidence_score && (
          <Badge className={getConfidenceColor(recommendation.confidence_score)}>
            {Math.round(recommendation.confidence_score * 100)}% confidence
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600">{description}</p>

        {recommendation.occasion && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-purple-700">Occasion:</span>
            <span className="text-sm text-gray-600">{recommendation.occasion}</span>
          </div>
        )}

        {recommendation.weather_context && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-700">Weather:</span>
            <span className="text-sm text-gray-600">
              {recommendation.weather_context.temperature}°F, {recommendation.weather_context.condition}
            </span>
          </div>
        )}

{/* Character Suggestions for Themed Events */}
        {recommendation.recommended_items?.character_suggestions && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Character Inspirations:
            </h4>
            <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg p-4 space-y-3 border border-rose-100">
              {recommendation.recommended_items.character_suggestions.map((character: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-rose-700">{character.name}</h5>
                    <Badge className={`text-xs ${character.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                      character.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {character.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">From:</span> {character.source}
                  </p>
                  <p className="text-sm text-gray-600">{character.description}</p>
                  <p className="text-xs text-purple-600 italic">{character.why_perfect}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wardrobe Analysis */}
        {recommendation.ai_insights?.wardrobe_analysis && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Wardrobe Analysis:
            </h4>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3 border border-blue-200">
              {recommendation.ai_insights.wardrobe_analysis.coverage_score !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Wardrobe Coverage:</span>
                  <Badge className={recommendation.ai_insights.wardrobe_analysis.coverage_score >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {Math.round(recommendation.ai_insights.wardrobe_analysis.coverage_score * 100)}%
                  </Badge>
                </div>
              )}
              {recommendation.ai_insights.wardrobe_analysis.items_used && recommendation.ai_insights.wardrobe_analysis.items_used.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-green-700">Using from your wardrobe:</span>
                  <ul className="text-sm text-gray-600 ml-4 mt-1">
                    {recommendation.ai_insights.wardrobe_analysis.items_used.map((item: string, index: number) => (
                      <li key={index} className="flex items-center gap-1">✓ {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendation.ai_insights.wardrobe_analysis.gaps_identified && recommendation.ai_insights.wardrobe_analysis.gaps_identified.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-orange-700">Items to purchase or rent:</span>
                  <ul className="text-sm text-gray-600 ml-4 mt-1">
                    {recommendation.ai_insights.wardrobe_analysis.gaps_identified.map((gap: string, index: number) => (
                      <li key={index}>• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {recommendation.recommended_items && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              AI-Styled Outfit:
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-3 border border-purple-100">
              {Object.entries(recommendation.recommended_items).filter(([key]) => !['character_suggestions', 'wardrobe_analysis'].includes(key)).map(([category, item]: [string, any]) => {
                if (Array.isArray(item)) {
                  return (
                    <div key={category} className="space-y-2">
                      <span className="capitalize font-medium text-purple-700">{category}:</span>
                      {item.map((accessory: any, index: number) => (
                        <div key={index} className="ml-4 text-sm space-y-1 border-l-2 border-purple-200 pl-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">{accessory.name || JSON.stringify(accessory)}</span>
                            {accessory.source && (
                              <Badge className={accessory.source === 'from_wardrobe' ? 'bg-green-100 text-green-700' : 
                                accessory.source === 'needs_rental' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}>
                                {accessory.source === 'from_wardrobe' ? '👕 Your wardrobe' : 
                                 accessory.source === 'needs_rental' ? '🔄 Rental' : '🛒 Purchase'}
                              </Badge>
                            )}
                          </div>
                          {accessory.wardrobe_item_id && (
                            <p className="text-xs text-green-600 italic">Using: {accessory.wardrobe_item_id}</p>
                          )}
                          {accessory.character_connection && (
                            <p className="text-xs text-rose-600 italic">🎭 {accessory.character_connection}</p>
                          )}
                          {accessory.reasoning && (
                            <p className="text-xs text-gray-500 italic">{accessory.reasoning}</p>
                          )}
                          {accessory.purchase_options && (accessory.purchase_options.uk_retailers?.length > 0 || accessory.purchase_options.rental_platforms?.length > 0) && (
                            <div className="mt-2 space-y-1">
                              {accessory.purchase_options.uk_retailers?.slice(0, 2).map((retailer: any, ridx: number) => (
                                <Button key={ridx} variant="outline" size="sm" className="text-xs" asChild>
                                  <a href={retailer.url} target="_blank" rel="noopener noreferrer">
                                    <ShoppingBag className="h-3 w-3 mr-1" />
                                    {retailer.store} ({retailer.price_range})
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              ))}
                              {accessory.purchase_options.rental_platforms?.slice(0, 1).map((platform: any, pidx: number) => (
                                <Button key={pidx} variant="outline" size="sm" className="text-xs bg-blue-50" asChild>
                                  <a href={platform.url} target="_blank" rel="noopener noreferrer">
                                    <Tag className="h-3 w-3 mr-1" />
                                    Rent from {platform.platform} ({platform.price_range})
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="capitalize font-medium text-purple-700">{category}:</span>
                      <div className="flex-1 ml-2">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-700">{item.name || JSON.stringify(item)}</span>
                          {item.source && (
                            <Badge className={item.source === 'from_wardrobe' ? 'bg-green-100 text-green-700' : 
                              item.source === 'needs_rental' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}>
                              {item.source === 'from_wardrobe' ? '👕 Wardrobe' : 
                               item.source === 'needs_rental' ? '🔄 Rental' : '🛒 Purchase'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {item.wardrobe_item_id && (
                      <p className="text-xs text-green-600 italic ml-auto text-right">Using: {item.wardrobe_item_id}</p>
                    )}
                    {item.character_connection && (
                      <p className="text-xs text-rose-600 italic">🎭 {item.character_connection}</p>
                    )}
                    {item.reasoning && (
                      <p className="text-xs text-gray-500 italic">{item.reasoning}</p>
                    )}
                    {item.purchase_options && (item.purchase_options.uk_retailers?.length > 0 || item.purchase_options.rental_platforms?.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.purchase_options.uk_retailers?.slice(0, 2).map((retailer: any, ridx: number) => (
                          <Button key={ridx} variant="outline" size="sm" className="text-xs" asChild>
                            <a href={retailer.url} target="_blank" rel="noopener noreferrer">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              {retailer.store} ({retailer.price_range})
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        ))}
                        {item.purchase_options.rental_platforms?.slice(0, 1).map((platform: any, pidx: number) => (
                          <Button key={pidx} variant="outline" size="sm" className="text-xs bg-blue-50" asChild>
                            <a href={platform.url} target="_blank" rel="noopener noreferrer">
                              <Tag className="h-3 w-3 mr-1" />
                              Rent from {platform.platform} ({platform.price_range})
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

{/* Shopping and Costume Sources */}
        {recommendation.ai_insights?.shopping_suggestions && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shopping & Rental Guide:
            </h4>
            
            {/* Summary */}
            {(recommendation.ai_insights.shopping_suggestions.total_investment_needed || recommendation.ai_insights.shopping_suggestions.wardrobe_utilization) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                {recommendation.ai_insights.shopping_suggestions.wardrobe_utilization && (
                  <p className="text-sm font-medium text-green-700 mb-2">
                    ✓ {recommendation.ai_insights.shopping_suggestions.wardrobe_utilization}
                  </p>
                )}
                {recommendation.ai_insights.shopping_suggestions.total_investment_needed && (
                  <p className="text-sm text-gray-600">
                    Investment needed: {recommendation.ai_insights.shopping_suggestions.total_investment_needed}
                  </p>
                )}
                {recommendation.ai_insights.shopping_suggestions.recommended_approach && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    {recommendation.ai_insights.shopping_suggestions.recommended_approach}
                  </p>
                )}
              </div>
            )}

            {/* UK Shopping Guide */}
            {recommendation.ai_insights.shopping_suggestions.uk_shopping_guide && (
              <div className="space-y-3">
                {/* High Street Stores */}
                {recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.high_street_stores && (
                  <div>
                    <h5 className="font-medium text-purple-700 text-sm mb-2">High Street Stores:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.high_street_stores).map(([storeName, storeInfo]: [string, any]) => (
                        <Button key={storeName} variant="outline" size="sm" className="justify-start" asChild>
                          <a href={storeInfo.url} target="_blank" rel="noopener noreferrer">
                            <ShoppingBag className="h-3 w-3 mr-2" />
                            <div className="text-left flex-1">
                              <div className="font-medium">{storeName}</div>
                              <div className="text-xs text-muted-foreground">{storeInfo.best_for}</div>
                            </div>
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rental Platforms */}
                {recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.rental_platforms && (
                  <div>
                    <h5 className="font-medium text-blue-700 text-sm mb-2">Rental Platforms:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.rental_platforms).map(([platformName, platformInfo]: [string, any]) => (
                        <Button key={platformName} variant="outline" size="sm" className="justify-start bg-blue-50" asChild>
                          <a href={platformInfo.url} target="_blank" rel="noopener noreferrer">
                            <Tag className="h-3 w-3 mr-2" />
                            <div className="text-left flex-1">
                              <div className="font-medium">{platformName}</div>
                              <div className="text-xs text-muted-foreground">{platformInfo.price_range}</div>
                            </div>
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vintage & Period */}
                {recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.vintage_and_period && (
                  <div>
                    <h5 className="font-medium text-amber-700 text-sm mb-2">Vintage & Period Pieces:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.vintage_and_period).map(([shopName, shopInfo]: [string, any]) => (
                        <Button key={shopName} variant="outline" size="sm" className="justify-start bg-amber-50" asChild>
                          <a href={shopInfo.url} target="_blank" rel="noopener noreferrer">
                            <MapPin className="h-3 w-3 mr-2" />
                            <div className="text-left flex-1">
                              <div className="font-medium">{shopName}</div>
                              <div className="text-xs text-muted-foreground">{shopInfo.best_for}</div>
                            </div>
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Department Stores */}
                {recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.department_stores && (
                  <div>
                    <h5 className="font-medium text-rose-700 text-sm mb-2">Department Stores:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(recommendation.ai_insights.shopping_suggestions.uk_shopping_guide.department_stores).map(([storeName, storeInfo]: [string, any]) => (
                        <Button key={storeName} variant="outline" size="sm" className="justify-start" asChild>
                          <a href={storeInfo.url} target="_blank" rel="noopener noreferrer">
                            <ShoppingBag className="h-3 w-3 mr-2" />
                            <div className="text-left flex-1">
                              <div className="font-medium">{storeName}</div>
                              <div className="text-xs text-muted-foreground">{storeInfo.best_for}</div>
                            </div>
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Costume & Theatrical */}
            {recommendation.ai_insights.shopping_suggestions.costume_and_theatrical && (
              <div>
                <h5 className="font-medium text-pink-700 text-sm mb-2">Costume & Theatrical:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(recommendation.ai_insights.shopping_suggestions.costume_and_theatrical).map(([shopName, shopInfo]: [string, any]) => (
                    <Button key={shopName} variant="outline" size="sm" className="justify-start bg-pink-50" asChild>
                      <a href={shopInfo.url} target="_blank" rel="noopener noreferrer">
                        <Users className="h-3 w-3 mr-2" />
                        <div className="text-left flex-1">
                          <div className="font-medium">{shopName}</div>
                          <div className="text-xs text-muted-foreground">{shopInfo.best_for}</div>
                        </div>
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {recommendation.reasoning && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Stylist's Reasoning:
            </h4>
            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
              {recommendation.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIOutfitCard;