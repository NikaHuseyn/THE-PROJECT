
interface ShoppingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  rentalPrice?: number;
  image: string;
  brand: string;
  category: string;
  retailerUrl: string;
  affiliate_url?: string;
  sizes: string[];
  colors: string[];
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

// Mock function to simulate API calls to UK retailers
// In a real implementation, you would integrate with actual retailer APIs
const fetchUKBrandItems = async (query: string, category: string): Promise<ShoppingItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockItems: ShoppingItem[] = [
    {
      id: '1',
      title: 'Professional Tailored Blazer',
      description: 'Sharp, modern blazer perfect for business meetings',
      price: 189,
      rentalPrice: 45,
      image: '/placeholder-blazer.jpg',
      brand: 'Reiss',
      category: 'Blazers',
      retailerUrl: 'https://www.reiss.com/p/womens-blazer',
      sizes: ['8', '10', '12', '14', '16'],
      colors: ['Navy', 'Black', 'Charcoal']
    },
    {
      id: '2',
      title: 'Midi Shirt Dress',
      description: 'Versatile dress suitable for work or dinner',
      price: 89,
      rentalPrice: 25,
      image: '/placeholder-dress.jpg',
      brand: 'COS',
      category: 'Dresses',
      retailerUrl: 'https://www.cosstores.com/en_gbp/women/dresses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Navy', 'Khaki', 'White']
    },
    {
      id: '3',
      title: 'Smart Casual Trousers',
      description: 'High-waisted trousers in premium fabric',
      price: 65,
      rentalPrice: 18,
      image: '/placeholder-trousers.jpg',
      brand: 'Next',
      category: 'Trousers',
      retailerUrl: 'https://www.next.co.uk/style/st-trousers',
      sizes: ['6', '8', '10', '12', '14', '16', '18'],
      colors: ['Black', 'Navy', 'Grey']
    },
    {
      id: '4',
      title: 'Silk Blouse',
      description: 'Elegant silk blouse for sophisticated occasions',
      price: 125,
      rentalPrice: 35,
      image: '/placeholder-blouse.jpg',
      brand: 'Ted Baker',
      category: 'Tops',
      retailerUrl: 'https://www.tedbaker.com/uk/womens/clothing/tops',
      sizes: ['6', '8', '10', '12', '14', '16'],
      colors: ['Cream', 'Blush', 'Navy']
    },
    {
      id: '5',
      title: 'Designer Heeled Boots',
      description: 'Comfortable yet stylish ankle boots',
      price: 145,
      rentalPrice: 40,
      image: '/placeholder-boots.jpg',
      brand: 'John Lewis',
      category: 'Shoes',
      retailerUrl: 'https://www.johnlewis.com/browse/women/shoes',
      sizes: ['3', '4', '5', '6', '7', '8'],
      colors: ['Black', 'Tan', 'Navy']
    },
    {
      id: '6',
      title: 'Casual Weekend Jumper',
      description: 'Cozy cashmere blend perfect for relaxed occasions',
      price: 78,
      rentalPrice: 22,
      image: '/placeholder-jumper.jpg',
      brand: 'M&S',
      category: 'Knitwear',
      retailerUrl: 'https://www.marksandspencer.com/c/women/clothing/knitwear',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Camel', 'Grey', 'Navy', 'Cream']
    }
  ];

  // Filter items based on query and category
  return mockItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(category.toLowerCase())
  );
};

const generateOutfitRecommendations = async (eventDescription: string): Promise<OutfitRecommendation[]> => {
  console.log('Generating outfit recommendations for:', eventDescription);
  
  // Analyze the event to determine appropriate dress code and style
  const eventAnalysis = analyzeEvent(eventDescription);
  
  // Fetch relevant items from UK brands
  const items = await fetchUKBrandItems(eventAnalysis.style, eventAnalysis.category);
  
  // Create outfit combinations
  const outfits: OutfitRecommendation[] = [
    {
      id: '1',
      title: `Professional ${eventAnalysis.dressCode} Outfit`,
      description: `Perfect for ${eventDescription.toLowerCase()}`,
      items: items.slice(0, 3),
      totalPrice: items.slice(0, 3).reduce((sum, item) => sum + item.price, 0),
      totalRentalPrice: items.slice(0, 3).reduce((sum, item) => sum + (item.rentalPrice || 0), 0),
      occasion: eventDescription,
      dressCode: eventAnalysis.dressCode
    },
    {
      id: '2',
      title: `Elegant ${eventAnalysis.dressCode} Look`,
      description: `Sophisticated styling for ${eventDescription.toLowerCase()}`,
      items: [items[1], items[3], items[4]].filter(Boolean),
      totalPrice: [items[1], items[3], items[4]].filter(Boolean).reduce((sum, item) => sum + item.price, 0),
      totalRentalPrice: [items[1], items[3], items[4]].filter(Boolean).reduce((sum, item) => sum + (item.rentalPrice || 0), 0),
      occasion: eventDescription,
      dressCode: eventAnalysis.dressCode
    },
    {
      id: '3',
      title: `Smart Casual Option`,
      description: `Versatile pieces that work perfectly for ${eventDescription.toLowerCase()}`,
      items: [items[2], items[5], items[4]].filter(Boolean),
      totalPrice: [items[2], items[5], items[4]].filter(Boolean).reduce((sum, item) => sum + item.price, 0),
      totalRentalPrice: [items[2], items[5], items[4]].filter(Boolean).reduce((sum, item) => sum + (item.rentalPrice || 0), 0),
      occasion: eventDescription,
      dressCode: 'Smart Casual'
    }
  ];

  return outfits;
};

const analyzeEvent = (eventDescription: string) => {
  const description = eventDescription.toLowerCase();
  
  if (description.includes('interview') || description.includes('business') || description.includes('meeting')) {
    return { dressCode: 'Business Formal', style: 'professional', category: 'business' };
  } else if (description.includes('wedding') || description.includes('cocktail') || description.includes('formal')) {
    return { dressCode: 'Cocktail', style: 'elegant', category: 'formal' };
  } else if (description.includes('date') || description.includes('dinner') || description.includes('restaurant')) {
    return { dressCode: 'Smart Casual', style: 'sophisticated', category: 'dinner' };
  } else if (description.includes('casual') || description.includes('brunch') || description.includes('friends')) {
    return { dressCode: 'Casual', style: 'relaxed', category: 'casual' };
  } else {
    return { dressCode: 'Smart Casual', style: 'versatile', category: 'general' };
  }
};

export { generateOutfitRecommendations, UK_RETAILERS };
export type { OutfitRecommendation, ShoppingItem };
