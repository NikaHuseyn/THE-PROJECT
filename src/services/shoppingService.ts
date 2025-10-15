
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
    },
    {
      id: '7',
      title: 'Elegant Vintage Witch Costume',
      description: 'Feminine black velvet dress with lace details, perfect for Halloween parties',
      price: 85,
      rentalPrice: 28,
      image: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400',
      brand: 'ASOS',
      category: 'Costumes',
      retailerUrl: 'https://www.asos.com/halloween',
      sizes: ['6', '8', '10', '12', '14', '16'],
      colors: ['Black', 'Purple']
    },
    {
      id: '8',
      title: 'Fairy Princess Costume',
      description: 'Delicate tulle dress with floral embellishments, ethereal and feminine',
      price: 95,
      rentalPrice: 32,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      brand: 'H&M',
      category: 'Costumes',
      retailerUrl: 'https://www2.hm.com/en_gb/halloween',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Pastel Pink', 'Lavender', 'White']
    },
    {
      id: '9',
      title: 'Classic Vampire Costume',
      description: 'Sophisticated burgundy velvet gown with Victorian styling',
      price: 110,
      rentalPrice: 38,
      image: 'https://images.unsplash.com/photo-1542779283-429940ce8336?w=400',
      brand: 'Next',
      category: 'Costumes',
      retailerUrl: 'https://www.next.co.uk/halloween',
      sizes: ['8', '10', '12', '14', '16'],
      colors: ['Burgundy', 'Black']
    },
    {
      id: '10',
      title: 'Mystical Fortune Teller Outfit',
      description: 'Flowing bohemian dress with coin details and shawl, modest and feminine',
      price: 75,
      rentalPrice: 25,
      image: 'https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=400',
      brand: 'Zara',
      category: 'Costumes',
      retailerUrl: 'https://www.zara.com/uk/halloween',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Deep Purple', 'Teal', 'Gold']
    },
    {
      id: '11',
      title: 'Garden Fairy Costume',
      description: 'Romantic floral dress with butterfly wings, sweet and feminine',
      price: 68,
      rentalPrice: 22,
      image: 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400',
      brand: 'Topshop',
      category: 'Costumes',
      retailerUrl: 'https://www.topshop.com/halloween',
      sizes: ['6', '8', '10', '12', '14'],
      colors: ['Pink', 'Green', 'White']
    },
    {
      id: '12',
      title: 'Elegant Black Cat Costume',
      description: 'Chic black midi dress with cat ear headband, sophisticated and playful',
      price: 58,
      rentalPrice: 20,
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      brand: 'COS',
      category: 'Costumes',
      retailerUrl: 'https://www.cosstores.com/en_gbp/halloween',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black']
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
  
  // Return empty array if no items found
  if (items.length === 0) {
    return [];
  }

  // Create outfit combinations (for costumes, show individual items as separate options)
  const outfits: OutfitRecommendation[] = items.slice(0, 3).map((item, index) => ({
    id: `${index + 1}`,
    title: item.title,
    description: item.description,
    items: [item],
    totalPrice: item.price,
    totalRentalPrice: item.rentalPrice || 0,
    occasion: eventDescription,
    dressCode: eventAnalysis.dressCode
  }));

  return outfits;
};

const analyzeEvent = (eventDescription: string) => {
  const description = eventDescription.toLowerCase();
  
  if (description.includes('halloween') || description.includes('costume') || description.includes('fancy dress')) {
    return { dressCode: 'Costume', style: 'costume', category: 'Costumes' };
  } else if (description.includes('interview') || description.includes('business') || description.includes('meeting')) {
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
