// ============================================================================
// GOOGLE MAPS / GBP HIGH-TICKET HOME SERVICES CATEGORIES
// Curated from Dalton Luka GBP Category Directory & Google Maps Trade Taxonomy
// Qualified for $10,000 Setup + $2,500/mo Retainer Capacity ($15k–$100k+ Jobs)
// ============================================================================

import usStatesCitiesData from './us_states_cities.json';

export interface GbpHomeServiceNiche {
  value: string;
  label: string;
  avgTicket: string;
  cluster: string;
  underservedMultiplier: 'High' | 'Very High' | 'Medium';
}

export const GOOGLE_MAPS_NICHES: GbpHomeServiceNiche[] = [
  // 1. Kitchen, Bath & Interior Remodeling ($20k–$150k+ jobs)
  { value: 'Kitchen Remodeler', label: 'Kitchen Remodeler', avgTicket: '$45,000–$120,000+', cluster: 'Kitchen & Bath', underservedMultiplier: 'Medium' },
  { value: 'Bathroom Remodeler', label: 'Bathroom Remodeler', avgTicket: '$20,000–$55,000', cluster: 'Kitchen & Bath', underservedMultiplier: 'Medium' },
  { value: 'Cabinet Maker', label: 'Cabinet Maker & Custom Woodworking', avgTicket: '$18,000–$48,000', cluster: 'Kitchen & Bath', underservedMultiplier: 'High' },
  { value: 'Countertop Store', label: 'Countertop Fabricator & Installer (Quartz/Granite)', avgTicket: '$12,000–$30,000', cluster: 'Kitchen & Bath', underservedMultiplier: 'Medium' },
  { value: 'Interior Designer', label: 'High-End Interior Remodeling & Design Firm', avgTicket: '$35,000–$100,000+', cluster: 'Kitchen & Bath', underservedMultiplier: 'High' },

  // 2. Structural, General Contracting & Additions ($75k–$350k+ jobs)
  { value: 'General Contractor', label: 'General Contractor (Design-Build & Additions)', avgTicket: '$85,000–$300,000+', cluster: 'Full Home / Additions', underservedMultiplier: 'Medium' },
  { value: 'Custom Home Builder', label: 'Custom Home Builder & Luxury Estates', avgTicket: '$250,000–$1,000,000+', cluster: 'Full Home / Additions', underservedMultiplier: 'Very High' },
  { value: 'Home Builder', label: 'Home Additions & ADU Builder', avgTicket: '$70,000–$180,000', cluster: 'Full Home / Additions', underservedMultiplier: 'High' },
  { value: 'Basement Finishing Contractor', label: 'Basement Finishing & Remodeling Contractor', avgTicket: '$35,000–$90,000', cluster: 'Full Home / Additions', underservedMultiplier: 'Very High' },
  { value: 'Building Restoration Service', label: 'Historic Home & Structural Restoration Service', avgTicket: '$50,000–$200,000+', cluster: 'Full Home / Additions', underservedMultiplier: 'Very High' },

  // 3. Outdoor Living, Pools & Hardscapes ($30k–$200k+ jobs)
  { value: 'Swimming Pool Contractor', label: 'Custom Swimming Pool Builder & Contractor', avgTicket: '$65,000–$190,000+', cluster: 'Outdoor Living', underservedMultiplier: 'Very High' },
  { value: 'Landscape Designer', label: 'Luxury Hardscape & Outdoor Kitchen Contractor', avgTicket: '$30,000–$95,000', cluster: 'Outdoor Living', underservedMultiplier: 'High' },
  { value: 'Deck Builder', label: 'Custom Architectural Deck & Pergola Builder', avgTicket: '$22,000–$65,000', cluster: 'Outdoor Living', underservedMultiplier: 'High' },
  { value: 'Sunroom Contractor', label: 'Sunroom, Patio Enclosure & Glasshouse Contractor', avgTicket: '$28,000–$75,000', cluster: 'Outdoor Living', underservedMultiplier: 'Very High' },
  { value: 'Paving Contractor', label: 'Custom Stone Paver & Driveway Contractor', avgTicket: '$18,000–$50,000', cluster: 'Outdoor Living', underservedMultiplier: 'Medium' },

  // 4. Roofing, Solar & Exterior Envelope ($20k–$85k+ jobs)
  { value: 'Roofing Contractor', label: 'Luxury Standing-Seam, Slate & Tile Roofing Contractor', avgTicket: '$20,000–$65,000', cluster: 'Exterior Envelope', underservedMultiplier: 'Medium' },
  { value: 'Solar Energy Contractor', label: 'Solar Energy & Whole-Home Battery Installer', avgTicket: '$25,000–$70,000', cluster: 'Exterior Envelope', underservedMultiplier: 'Medium' },
  { value: 'Siding Contractor', label: 'James Hardie & Engineered Siding Contractor', avgTicket: '$18,000–$45,000', cluster: 'Exterior Envelope', underservedMultiplier: 'High' },
  { value: 'Window Installation Service', label: 'Architectural Window & Fleetwood Door Specialist', avgTicket: '$25,000–$80,000', cluster: 'Exterior Envelope', underservedMultiplier: 'High' },

  // 5. Mechanical, Foundation & Specialized Trades ($15k–$50k+ jobs)
  { value: 'Foundation Contractor', label: 'Foundation Repair & Concrete Leveling Contractor', avgTicket: '$15,000–$50,000', cluster: 'Specialized Trades', underservedMultiplier: 'Very High' },
  { value: 'Waterproofing Service', label: 'Basement & Structural Waterproofing Service', avgTicket: '$14,000–$40,000', cluster: 'Specialized Trades', underservedMultiplier: 'Very High' },
  { value: 'HVAC Contractor', label: 'High-End Geothermal & Multi-Zone HVAC Contractor', avgTicket: '$16,000–$38,000', cluster: 'Specialized Trades', underservedMultiplier: 'Medium' },
  { value: 'Electrician', label: 'Whole-Home Commercial Generator & EV Infrastructure', avgTicket: '$12,000–$32,000', cluster: 'Specialized Trades', underservedMultiplier: 'High' },
  { value: 'Flooring Contractor', label: 'Hardwood Floor Refinishing & Italian Marble Specialist', avgTicket: '$15,000–$42,000', cluster: 'Specialized Trades', underservedMultiplier: 'High' },
  { value: 'Masonry Contractor', label: 'Custom Natural Stone Masonry & Fireplace Builder', avgTicket: '$20,000–$60,000', cluster: 'Specialized Trades', underservedMultiplier: 'Very High' },
];

export interface StateRecord {
  code: string;
  name: string;
  timezone: string;
  cities: string[];
}

// Complete 50 States + DC dataset containing every city
export const ALL_US_STATES: Record<string, StateRecord> = usStatesCitiesData as Record<string, StateRecord>;

// Curated list of high-value affluent/underserved markets known for high-ticket home remodeling
export const HIGH_VALUE_POCKETS: Array<{ state: string; city: string; reason: string }> = [
  { state: 'AZ', city: 'Paradise Valley', reason: 'Highest median household income in AZ ($250k+). Average kitchen/bath project exceeds $100k.' },
  { state: 'AZ', city: 'Scottsdale', reason: 'High concentration of luxury remodelers with active Google Ads budgets and high customer LTV.' },
  { state: 'AZ', city: 'Fountain Hills', reason: 'Underserved hillside estate market with weak local SEO competition.' },
  { state: 'TX', city: 'Southlake', reason: 'Dallas affluent corridor with heavy spend on outdoor kitchens, pools, and high-end additions.' },
  { state: 'TX', city: 'The Woodlands', reason: 'Houston master-planned enclave where home remodeling contractors have huge margins.' },
  { state: 'TX', city: 'Westlake', reason: 'Ultra-luxury market ($2M+ homes); contractors need immediate AI callback and visual proof.' },
  { state: 'FL', city: 'Naples', reason: 'Premier coastal retirement market. Average kitchen and bathroom renovation exceeds $75k.' },
  { state: 'FL', city: 'Boca Raton', reason: 'High-density luxury condo & estate market spending heavily on interior modernization.' },
  { state: 'FL', city: 'Ponte Vedra Beach', reason: 'Jacksonville luxury coast with very few agencies targeting local contractors.' },
  { state: 'CA', city: 'Newport Beach', reason: 'Coastal Orange County where custom design-build jobs routinely exceed $200k.' },
  { state: 'CA', city: 'Walnut Creek', reason: 'East Bay suburban wealth; high demand for full-home and ADU construction.' },
  { state: 'CO', city: 'Cherry Hills Village', reason: 'Denver luxury estate corridor with high average project values and zero price resistance.' },
  { state: 'GA', city: 'Milton', reason: 'North Atlanta horse country and luxury estates; underserved by digital growth agencies.' },
  { state: 'NC', city: 'Waxhaw', reason: 'Charlotte luxury suburb booming with high-end custom home additions and pools.' },
  { state: 'TN', city: 'Brentwood', reason: 'Nashville music & healthcare executive enclave with high remodeling demand.' },
  { state: 'IL', city: 'Hinsdale', reason: 'Historic Chicago western suburb where historic preservation & custom kitchens thrive.' },
  { state: 'WA', city: 'Mercer Island', reason: 'Seattle tech wealth; homeowners prioritize fast turnaround and AI chat response.' },
  { state: 'VA', city: 'Great Falls', reason: 'Northern Virginia executive corridor with the highest median income in the nation.' },
];

/**
 * 1-Click Underserved Opportunity Algorithm
 */
export function pickRandomOpportunity(): {
  niche: string;
  state: string;
  city: string;
  timezone: string;
  reason: string;
} {
  const niche = GOOGLE_MAPS_NICHES[Math.floor(Math.random() * GOOGLE_MAPS_NICHES.length)];

  // 70% chance to target a verified high-value affluent market pocket
  if (Math.random() < 0.7 && HIGH_VALUE_POCKETS.length > 0) {
    const pocket = HIGH_VALUE_POCKETS[Math.floor(Math.random() * HIGH_VALUE_POCKETS.length)];
    const stateData = ALL_US_STATES[pocket.state];
    return {
      niche: niche.value,
      state: pocket.state,
      city: pocket.city,
      timezone: stateData ? stateData.timezone : 'America/Phoenix',
      reason: `${pocket.reason} High demand for ${niche.label} (${niche.avgTicket}).`,
    };
  }

  // Otherwise, pick randomly across any of the 50 US states and its full city database
  const stateKeys = Object.keys(ALL_US_STATES);
  const randomStateCode = stateKeys[Math.floor(Math.random() * stateKeys.length)];
  const stateData = ALL_US_STATES[randomStateCode];
  const randomCity = stateData.cities[Math.floor(Math.random() * stateData.cities.length)] || 'Capital';

  return {
    niche: niche.value,
    state: randomStateCode,
    city: randomCity,
    timezone: stateData.timezone,
    reason: `Underserved market in ${randomCity}, ${randomStateCode}. High-ticket ${niche.label} services (${niche.avgTicket}) with minimal agency saturation.`,
  };
}
