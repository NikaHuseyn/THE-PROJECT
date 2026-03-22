// Patterns that suggest a venue mention — internationally, not UK-only
export const VENUE_INDICATORS = [
  // "at / going to / dinner at ... [Venue Type]"
  /\b(?:at|going to|dinner at|lunch at|drinks at|visiting|booked|reservation at|table at|staying at|checked into)\s+(?:the\s+)?([A-Z][A-Za-z''&\-\s]{2,30}(?:Hotel|Restaurant|Bar|Club|Lounge|Grill|Bistro|Brasserie|Café|Cafe|Tavern|Inn|House|Kitchen|Room|Rooms|Terrace|Rooftop|Resort|Palace|Chateau|Palazzo|Ristorante|Trattoria|Izakaya|Ryokan))/i,
  // "Venue's restaurant / bar / etc"
  /\b([A-Z][A-Za-z''&\-]{2,30}(?:'s)?)\s+(?:restaurant|bar|club|hotel|lounge|rooftop|bistro|brasserie|pub|cocktail bar|wine bar|speakeasy|supper club|beach club|pool club|sky bar|penthouse|steakhouse|pizzeria|tapas bar)/i,
  // "Venue in [Any City]" — matches any capitalised location, not just UK
  /\b(?:The\s+)?([A-Z][A-Za-z''&\-\s]{2,35})\s+in\s+([A-Z][A-Za-z\s\-'']{2,30})\b/i,
];

// Well-known standalone venue names — detected even without a city or venue-type suffix
export const KNOWN_STANDALONE_VENUES: string[] = [
  'Nobu', 'Sketch', 'Zuma', "Annabel's", 'Chiltern Firehouse', 'Soho House',
  'Berners Tavern', 'The Wolseley', 'Cecconi\'s', 'Sexy Fish', 'Hakkasan',
  'Momofuku', 'Carbone', 'Noma', 'El Celler de Can Roca', 'Mirazur',
  'Geranium', 'Eleven Madison Park', 'Alinea', 'The French Laundry',
  'Gaggan', 'Narisawa', 'Osteria Francescana', 'Steirereck', 'Dinner by Heston',
  'The Ivy', 'Le Bernardin', 'Per Se', 'Robuchon', 'Cipriani', 'Langan\'s',
  'China Tang', 'Mr Chow', 'Chez Janou', 'Le Jules Verne', 'Buddha-Bar',
  'Catch', 'Komodo', 'LPM', 'Amazonico', 'COYA', 'Tatel', 'Sumosan',
  'Novikov', 'Bagatelle', 'Nammos', 'Nikki Beach', 'Twiga', 'Billionaire',
];

// Venues known to exist in multiple cities worldwide
export const MULTI_CITY_VENUES: Record<string, string[]> = {
  'Nobu': ['London', 'New York', 'Los Angeles', 'Miami', 'Dubai', 'Tokyo', 'Malibu', 'Ibiza', 'Las Vegas', 'Monte Carlo'],
  'Zuma': ['London', 'Dubai', 'Miami', 'New York', 'Hong Kong', 'Istanbul', 'Bangkok', 'Rome', 'Abu Dhabi'],
  'Soho House': ['London', 'New York', 'Miami', 'Los Angeles', 'Berlin', 'Barcelona', 'Amsterdam', 'Istanbul', 'Hong Kong', 'Mumbai'],
  'Hakkasan': ['London', 'Dubai', 'Miami', 'Las Vegas', 'Abu Dhabi', 'Jakarta', 'Mumbai'],
  'Cipriani': ['New York', 'London', 'Milan', 'Venice', 'Dubai', 'Miami', 'Ibiza', 'Monte Carlo'],
  "Cecconi's": ['London', 'New York', 'Los Angeles', 'Miami', 'Berlin', 'Istanbul', 'Barcelona'],
  'Sexy Fish': ['London', 'Dubai', 'Miami', 'Manchester'],
  'Buddha-Bar': ['Paris', 'London', 'Dubai', 'Monte Carlo', 'Budapest', 'Prague', 'Marrakech'],
  'Bagatelle': ['New York', 'London', 'Miami', 'Dubai', 'St. Tropez', 'St. Barths', 'Tulum'],
  'LPM': ['London', 'Dubai', 'Miami', 'Hong Kong', 'Abu Dhabi', 'Riyadh'],
  'Amazonico': ['London', 'Madrid', 'Dubai'],
  'COYA': ['London', 'Dubai', 'Abu Dhabi', 'Monte Carlo', 'Mykonos', 'Paris'],
  'Nammos': ['Mykonos', 'Dubai', 'Monte Carlo'],
  'Nikki Beach': ['Miami', 'St. Tropez', 'Ibiza', 'Dubai', 'Monte Carlo', 'Marbella', 'Phuket'],
  'Novikov': ['London', 'Dubai', 'Miami', 'Moscow'],
  'Momofuku': ['New York', 'Toronto', 'Las Vegas', 'Los Angeles'],
  'Carbone': ['New York', 'Miami', 'Las Vegas', 'Dallas', 'Hong Kong'],
  'Mr Chow': ['London', 'New York', 'Los Angeles', 'Miami', 'Las Vegas'],
  'Catch': ['New York', 'Los Angeles', 'Las Vegas', 'Playa del Carmen'],
  'Tatel': ['Madrid', 'Miami', 'Ibiza', 'Beverly Hills', 'Riyadh'],
  'Sumosan': ['London', 'Dubai', 'Moscow', 'St. Moritz'],
  'Twiga': ['London', 'Monte Carlo', 'Porto Cervo'],
  'Komodo': ['Miami', 'Las Vegas'],
};

// Patterns that suggest a named event — internationally
export const EVENT_INDICATORS = [
  /\b(?:going to|attending|tickets? (?:for|to)|invited to|registered for|signed up for|heading to)\s+(?:the\s+)?([A-Z][A-Za-z''&\-\s]{3,50}(?:Festival|Fest|Gala|Ball|Awards?|Ceremony|Conference|Summit|Expo|Exhibition|Show|Concert|Premiere|Launch|Party|Benefit|Fundraiser|Marathon|Cup|Open|Prix|Week|Fashion Week|Carnival|Carnaval|Biennale|Derby|Regatta|Fête|Fiesta))/i,
  /\b(?:the\s+)?([A-Z][A-Za-z''&\-\s]{3,40}(?:Festival|Fest|Gala|Ball|Awards?|Ceremony|Conference|Summit|Expo|Exhibition|Show|Concert|Premiere|Launch|Benefit|Fundraiser|Fashion Week|Carnival|Carnaval|Biennale|Derby|Regatta|Fête|Fiesta))\b/i,
  /\b(?:going to|attending|tickets? (?:for|to)|invited to)\s+(?:the\s+)?([A-Z][A-Za-z''&\-\s]{3,50})\s+(?:festival|gala|ball|awards?|ceremony|conference|summit|expo|exhibition|concert|premiere|event|carnival|biennale|derby|regatta)\b/i,
];

const FALSE_POSITIVE_NAMES = [
  'I', 'My', 'The', 'A', 'An', 'We', 'They', 'He', 'She', 'It',
  'This', 'That', 'What', 'How', 'Going', 'Looking',
];

export interface VenueDetectionResult {
  venueName: string;
  city: string | null;
  isMultiCity: boolean;
  possibleCities: string[];
}

/**
 * Detect a venue name from a user message.
 * Returns structured result with city info and multi-city flag.
 */
export function detectVenue(message: string): VenueDetectionResult | null {
  // 1. Check regex patterns
  for (const pattern of VENUE_INDICATORS) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 2 && !FALSE_POSITIVE_NAMES.includes(name)) {
        // The 3rd pattern captures a city in group 2
        const city = match[2]?.trim() || null;
        return buildResult(name, city);
      }
    }
  }

  // 2. Check known standalone venues (no regex suffix needed)
  for (const venue of KNOWN_STANDALONE_VENUES) {
    // Word-boundary match, case-sensitive for proper nouns
    const escaped = venue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(message)) {
      // Try to extract a city from context: "Nobu in Dubai" / "Nobu Dubai"
      const cityMatch = message.match(new RegExp(`${escaped}\\s+(?:in\\s+)?([A-Z][A-Za-z\\s\\-'']{2,25})`, 'i'));
      const city = cityMatch?.[1]?.trim() || null;
      return buildResult(venue, city);
    }
  }

  return null;
}

function buildResult(name: string, city: string | null): VenueDetectionResult {
  // Normalize name for lookup
  const lookupKey = Object.keys(MULTI_CITY_VENUES).find(
    k => k.toLowerCase() === name.toLowerCase()
  );

  const isMultiCity = !!lookupKey && !city;
  const possibleCities = lookupKey ? MULTI_CITY_VENUES[lookupKey] : [];

  return {
    venueName: lookupKey || name,
    city,
    isMultiCity,
    possibleCities,
  };
}

/**
 * Detect a named event from a user message.
 */
export function detectEvent(message: string): string | null {
  for (const pattern of EVENT_INDICATORS) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 3 && !FALSE_POSITIVE_NAMES.includes(name)) {
        return name;
      }
    }
  }
  return null;
}
