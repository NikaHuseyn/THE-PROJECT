// API-compatible structure matching ShopStyle, Zalando, and other fashion APIs
interface ShoppingItem {
  id: string;
  name: string;
  brand: {
    name: string;
    id?: string;
  };
  price: {
    current: number;
    currency: string;
    original?: number;
    discountPercent?: number;
  };
  rental?: {
    price: number;
    duration: string;
  };
  images: {
    small: string;
    medium: string;
    large: string;
    additional?: string[];
  };
  categories: string[];
  colors: Array<{
    name: string;
    hex?: string;
  }>;
  sizes: Array<{
    value: string;
    inStock: boolean;
  }>;
  retailer: {
    name: string;
    productUrl: string;
    affiliateUrl?: string;
  };
  description: string;
  inStock: boolean;
  ageGroups?: string[];
  gender?: string;
  condition?: string;
}

interface WeatherContext {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
}

interface CalendarContext {
  eventType: string;
  dressCode?: string;
  location?: string;
  startTime: string;
  duration?: number;
}

interface OutfitRecommendation {
  id: string;
  title: string;
  description: string;
  items: ShoppingItem[];
  totalPrice: number;
  totalRentalPrice: number;
  occasion: string;
  dressCode: string;
  weatherContext?: WeatherContext;
  styling_tips: string[];
  color_palette: string[];
  confidence_score: number;
}

// Popular UK fashion brands and retailers
const UK_RETAILERS = [
  { name: 'ASOS', baseUrl: 'https://www.asos.com' },
  { name: 'Next', baseUrl: 'https://www.next.co.uk' },
  { name: 'Zara', baseUrl: 'https://www.zara.com/uk' },
  { name: 'H&M', baseUrl: 'https://www2.hm.com/en_gb' },
  { name: 'John Lewis', baseUrl: 'https://www.johnlewis.com' },
  { name: 'Marks & Spencer', baseUrl: 'https://www.marksandspencer.com' },
  { name: 'Topshop', baseUrl: 'https://www.topshop.com' },
  { name: 'COS', baseUrl: 'https://www.cosstores.com/en_gbp' },
  { name: 'Reiss', baseUrl: 'https://www.reiss.com' },
  { name: 'Ted Baker', baseUrl: 'https://www.tedbaker.com' }
];

// Mock function to simulate API calls to fashion retailers
// In production, replace this with actual API calls to:
// - ShopStyle API: https://api.shopstyle.com/api/v2/products
// - Zalando Partner API
// - ASOS API (requires partnership)
// - Other retail partner APIs
const fetchFashionItems = async (
  query: string, 
  category: string,
  weatherContext?: WeatherContext,
  priceRange?: { min: number; max: number }
): Promise<ShoppingItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // REPLACE THIS SECTION with actual API call:
  // const response = await fetch(`https://api.shopstyle.com/api/v2/products?pid=YOUR_API_KEY&fts=${query}&cat=${category}`);
  // const data = await response.json();
  // return data.products.map(transformApiResponseToShoppingItem);
  
  const mockItems: ShoppingItem[] = [
    {
      id: 'mock_001',
      name: 'Professional Tailored Blazer',
      brand: {
        name: 'Reiss',
        id: 'reiss_uk'
      },
      price: {
        current: 189,
        currency: 'GBP',
        original: 229,
        discountPercent: 17
      },
      rental: {
        price: 45,
        duration: '4 days'
      },
      images: {
        small: '/placeholder-blazer.jpg',
        medium: '/placeholder-blazer.jpg',
        large: '/placeholder-blazer.jpg'
      },
      categories: ['Blazers', 'Workwear', 'Outerwear'],
      colors: [
        { name: 'Navy', hex: '#001f3f' },
        { name: 'Black', hex: '#000000' },
        { name: 'Charcoal', hex: '#36454F' }
      ],
      sizes: [
        { value: '8', inStock: true },
        { value: '10', inStock: true },
        { value: '12', inStock: true },
        { value: '14', inStock: false },
        { value: '16', inStock: true }
      ],
      retailer: {
        name: 'Reiss',
        productUrl: 'https://www.reiss.com/p/womens-blazer',
        affiliateUrl: 'https://www.reiss.com/p/womens-blazer?aff=partner'
      },
      description: 'Sharp, modern blazer perfect for business meetings. Single-breasted design with structured shoulders.',
      inStock: true,
      gender: 'Women',
      ageGroups: ['Adult']
    },
    {
      id: 'mock_002',
      name: 'Midi Shirt Dress',
      brand: {
        name: 'COS',
        id: 'cos_uk'
      },
      price: {
        current: 89,
        currency: 'GBP'
      },
      rental: {
        price: 25,
        duration: '4 days'
      },
      images: {
        small: '/placeholder-dress.jpg',
        medium: '/placeholder-dress.jpg',
        large: '/placeholder-dress.jpg'
      },
      categories: ['Dresses', 'Smart Casual', 'Workwear'],
      colors: [
        { name: 'Navy', hex: '#001f3f' },
        { name: 'Khaki', hex: '#C3B091' },
        { name: 'White', hex: '#FFFFFF' }
      ],
      sizes: [
        { value: 'XS', inStock: true },
        { value: 'S', inStock: true },
        { value: 'M', inStock: true },
        { value: 'L', inStock: true },
        { value: 'XL', inStock: true }
      ],
      retailer: {
        name: 'COS',
        productUrl: 'https://www.cosstores.com/en_gbp/women/dresses',
        affiliateUrl: 'https://www.cosstores.com/en_gbp/women/dresses?aff=partner'
      },
      description: 'Versatile shirt dress in premium cotton. Perfect for work or dinner occasions.',
      inStock: true,
      gender: 'Women',
      ageGroups: ['Adult']
    }
  ];

  // Filter items based on query, category, weather, and price range
  let filteredItems = mockItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
  );

  // Weather-based filtering (for production, this would be done via API parameters)
  if (weatherContext) {
    if (weatherContext.temperature < 10) {
      // Prefer warm items for cold weather
      filteredItems = filteredItems.filter(item =>
        item.categories.some(cat => 
          ['Outerwear', 'Knitwear', 'Boots'].some(warm => cat.includes(warm))
        )
      );
    } else if (weatherContext.temperature > 25) {
      // Prefer light items for warm weather
      filteredItems = filteredItems.filter(item =>
        !item.categories.some(cat => ['Outerwear', 'Heavy'].some(heavy => cat.includes(heavy)))
      );
    }
  }

  // Price range filtering
  if (priceRange) {
    filteredItems = filteredItems.filter(item =>
      item.price.current >= priceRange.min && item.price.current <= priceRange.max
    );
  }

  return filteredItems;
};

// Generate context-based outfit recommendations using weather and calendar data
const generateOutfitRecommendations = async (
  eventDescription: string,
  weatherContext?: WeatherContext,
  calendarContext?: CalendarContext
): Promise<OutfitRecommendation[]> => {
  console.log('Generating outfit recommendations for:', eventDescription);
  
  // Analyze the event to determine appropriate dress code and style
  const eventAnalysis = analyzeEvent(eventDescription, calendarContext);
  
  // Determine price range based on occasion formality
  const priceRange = getPriceRangeForOccasion(eventAnalysis.dressCode);
  
  // Fetch relevant items with context
  const items = await fetchFashionItems(
    eventAnalysis.style, 
    eventAnalysis.category,
    weatherContext,
    priceRange
  );
  
  // Return empty array if no items found
  if (items.length === 0) {
    return [];
  }

  // Generate styling tips based on weather and occasion
  const stylingTips = generateStylingTips(eventAnalysis, weatherContext);
  
  // Extract color palette from items
  const colorPalette = extractColorPalette(items);

  // Create outfit combinations with context
  const outfits: OutfitRecommendation[] = items.slice(0, 3).map((item, index) => ({
    id: `outfit_${Date.now()}_${index}`,
    title: item.name,
    description: item.description,
    items: [item],
    totalPrice: item.price.current,
    totalRentalPrice: item.rental?.price || 0,
    occasion: eventDescription,
    dressCode: eventAnalysis.dressCode,
    weatherContext,
    styling_tips: stylingTips,
    color_palette: colorPalette,
    confidence_score: calculateConfidenceScore(item, eventAnalysis, weatherContext)
  }));

  return outfits;
};

// Helper function to determine price range based on occasion
const getPriceRangeForOccasion = (dressCode: string): { min: number; max: number } => {
  const ranges: Record<string, { min: number; max: number }> = {
    'Business Formal': { min: 80, max: 300 },
    'Cocktail': { min: 100, max: 400 },
    'Smart Casual': { min: 50, max: 200 },
    'Casual': { min: 30, max: 150 },
    'Costume': { min: 40, max: 150 }
  };
  
  return ranges[dressCode] || { min: 30, max: 250 };
};

// Generate weather and occasion-specific styling tips
const generateStylingTips = (eventAnalysis: any, weatherContext?: WeatherContext): string[] => {
  const tips: string[] = [];
  
  // Weather-based tips
  if (weatherContext) {
    if (weatherContext.temperature < 10) {
      tips.push('Layer with a warm coat or cardigan');
      tips.push('Consider wearing boots for warmth');
    } else if (weatherContext.temperature > 25) {
      tips.push('Choose breathable, lightweight fabrics');
      tips.push('Opt for lighter colors to reflect heat');
    }
    
    if (weatherContext.condition.toLowerCase().includes('rain')) {
      tips.push('Bring an umbrella and consider waterproof footwear');
    }
  }
  
  // Occasion-based tips
  if (eventAnalysis.dressCode === 'Business Formal') {
    tips.push('Pair with closed-toe shoes');
    tips.push('Keep accessories minimal and professional');
  } else if (eventAnalysis.dressCode === 'Cocktail') {
    tips.push('Add statement jewelry for elegance');
    tips.push('Heels recommended for formal occasions');
  } else if (eventAnalysis.dressCode === 'Casual') {
    tips.push('Comfortable footwear is key');
    tips.push('Mix and match for a relaxed look');
  }
  
  return tips;
};

// Extract dominant color palette from items
const extractColorPalette = (items: ShoppingItem[]): string[] => {
  const colors = new Set<string>();
  items.forEach(item => {
    item.colors.forEach(color => colors.add(color.name));
  });
  return Array.from(colors).slice(0, 5);
};

// Calculate confidence score based on context matching
const calculateConfidenceScore = (
  item: ShoppingItem, 
  eventAnalysis: any, 
  weatherContext?: WeatherContext
): number => {
  let score = 70; // Base score
  
  // Category match bonus
  if (item.categories.includes(eventAnalysis.category)) {
    score += 15;
  }
  
  // Weather appropriateness bonus
  if (weatherContext) {
    if (weatherContext.temperature < 10 && item.categories.some(cat => ['Outerwear', 'Knitwear'].includes(cat))) {
      score += 10;
    } else if (weatherContext.temperature > 25 && !item.categories.includes('Outerwear')) {
      score += 10;
    }
  }
  
  // In-stock bonus
  if (item.inStock) {
    score += 5;
  }
  
  return Math.min(score, 100);
};

// Analyze event with calendar context
const analyzeEvent = (eventDescription: string, calendarContext?: CalendarContext) => {
  const description = eventDescription.toLowerCase();
  
  // Use calendar dress code if available
  if (calendarContext?.dressCode) {
    return {
      dressCode: calendarContext.dressCode,
      style: calendarContext.dressCode.toLowerCase().replace(/\s+/g, '_'),
      category: calendarContext.eventType || 'general'
    };
  }
  
  // Event type analysis
  if (description.includes('halloween') || description.includes('costume') || description.includes('fancy dress')) {
    return { dressCode: 'Costume', style: 'costume', category: 'Costumes' };
  } else if (description.includes('interview') || description.includes('business') || description.includes('meeting')) {
    return { dressCode: 'Business Formal', style: 'professional', category: 'Workwear' };
  } else if (description.includes('wedding') || description.includes('cocktail') || description.includes('formal')) {
    return { dressCode: 'Cocktail', style: 'elegant', category: 'Dresses' };
  } else if (description.includes('date') || description.includes('dinner') || description.includes('restaurant')) {
    return { dressCode: 'Smart Casual', style: 'sophisticated', category: 'Smart Casual' };
  } else if (description.includes('casual') || description.includes('brunch') || description.includes('friends')) {
    return { dressCode: 'Casual', style: 'relaxed', category: 'Casual' };
  } else if (description.includes('gym') || description.includes('workout') || description.includes('fitness')) {
    return { dressCode: 'Activewear', style: 'athletic', category: 'Activewear' };
  } else {
    return { dressCode: 'Smart Casual', style: 'versatile', category: 'Smart Casual' };
  }
};

export { 
  generateOutfitRecommendations, 
  fetchFashionItems,
  UK_RETAILERS 
};
export type { 
  OutfitRecommendation, 
  ShoppingItem,
  WeatherContext,
  CalendarContext
};
