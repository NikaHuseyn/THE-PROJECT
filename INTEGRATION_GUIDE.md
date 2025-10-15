# Production Shopping API Integration Guide

Your app currently uses mock data. To handle ANY user query with real products and images, you need to integrate with real shopping APIs.

## Current State
- ✅ AI recommendations work (powered by OpenAI GPT-4)
- ✅ Handles any search query intelligently
- ❌ Returns mock products with placeholder data
- ❌ No real shopping integration

## Recommended Shopping APIs for UK Market

### 1. **Klarna Shopping API** (Recommended)
- **Coverage**: Major UK retailers (ASOS, Next, Zara, H&M, etc.)
- **Features**: Real-time product data, images, prices, availability
- **Cost**: Free tier available
- **Setup**: https://docs.klarna.com/shopping-api/

```typescript
// Example integration in edge function
const response = await fetch('https://api.klarna.com/v1/search', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(Deno.env.get('KLARNA_USERNAME') + ':' + Deno.env.get('KLARNA_PASSWORD'))}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: searchQuery,
    size: 20,
    filters: {
      'category': category,
      'price_range': { min: 0, max: 500 }
    }
  })
});
```

### 2. **Adzuna Product Search API**
- **Coverage**: UK retailers
- **Features**: Product search, price comparisons
- **Cost**: Paid service
- **Setup**: https://developer.adzuna.com/

### 3. **Google Shopping API**
- **Coverage**: Global including UK
- **Features**: Comprehensive product data
- **Cost**: Pay per query
- **Setup**: https://developers.google.com/shopping-content/v2

### 4. **RapidAPI Fashion Hub**
- Multiple fashion APIs aggregated
- ASOS API, Zara API available
- **Setup**: https://rapidapi.com/hub

## Implementation Steps

### Step 1: Choose Your API
Recommend starting with **Klarna Shopping API** - it's free and covers major UK retailers.

### Step 2: Get API Credentials
1. Sign up for the API service
2. Get your API keys
3. Store them as Supabase secrets (not in code!)

### Step 3: Update Shopping Service
Replace `src/services/shoppingService.ts` with real API calls:

```typescript
// src/services/shoppingService.ts
export const fetchRealProducts = async (query: string, category?: string) => {
  const { data } = await supabase.functions.invoke('search-products', {
    body: { query, category }
  });
  return data;
};
```

### Step 4: Create Edge Function
```typescript
// supabase/functions/search-products/index.ts
serve(async (req) => {
  const { query, category } = await req.json();
  
  // Call Klarna/Google Shopping/etc.
  const products = await fetch('https://api.shopping-provider.com/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SHOPPING_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      category: category,
      country: 'GB',
      language: 'en-GB'
    })
  });
  
  return new Response(JSON.stringify(products), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

### Step 5: Update UI Components
The existing components (`UKBrandOutfitCard.tsx`, etc.) will automatically work with real data once the API is integrated - they just need valid image URLs and prices.

## Alternative: Affiliate Integration

### Option A: ASOS Affiliate Program
- Sign up: https://www.asos.com/partners/
- Use their product feed
- Earn commission on sales

### Option B: Commission Factory (UK)
- Aggregates multiple UK retailers
- Single integration, multiple brands
- Setup: https://www.commissionfactory.com/

## Cost Considerations

| API | Free Tier | Paid Plans |
|-----|-----------|------------|
| Klarna Shopping | Yes (limited) | Pay per API call |
| Google Shopping | No | $0.00025 per query |
| RapidAPI | Varies | $10-100/month |
| Affiliate Feeds | Free | Commission-based |

## Next Steps

1. **Quick Fix** (Current): AI recommendations work, mock products provide structure
2. **MVP** (Week 1): Integrate Klarna Shopping API for real UK products
3. **Production** (Week 2-3): Add affiliate tracking, optimize performance
4. **Scale** (Month 1+): Multi-API fallbacks, caching, personalization

## Questions?

The app architecture is already set up to handle real APIs:
- ✅ AI analyzes any user query intelligently
- ✅ Edge functions can securely call external APIs
- ✅ UI components render product data dynamically
- ✅ Rate limiting and error handling in place

You just need to:
1. Pick a shopping API
2. Get credentials
3. Replace the mock `fetchUKBrandItems` function with real API calls

**Estimated Integration Time**: 2-4 hours for basic Klarna integration
