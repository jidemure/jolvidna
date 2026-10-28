// ============================================================================
// GOOGLE MAPS / GBP HIGH-TICKET HOME SERVICES & SPECIALTY CONTRACTORS
// Sole Source of Truth: Dalton Luka GBP Category Directory (https://daltonluka.com/blog/google-my-business-categories)
// Strict Agency Qualification Filters:
// 1. One-time Setup: $5,000 to $15,000 capacity ($15k–$250k+ average project value)
// 2. Monthly Retainer: $2,500 to $3,500 recurring fee capacity
// 3. Direct Contact: Direct access to business owner / trade principal (no corporate bureaucracy)
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
  // 1. Kitchen, Bath & Whole-Home Remodeling
  { value: 'Kitchen remodeler', label: 'Kitchen Remodeler', avgTicket: '$45,000–$125,000+', cluster: 'Kitchen & Bath', underservedMultiplier: 'Medium' },
  { value: 'Bathroom remodeler', label: 'Bathroom Remodeler', avgTicket: '$25,000–$65,000', cluster: 'Kitchen & Bath', underservedMultiplier: 'Medium' },
  { value: 'Remodeler', label: 'Full-Service Remodeler', avgTicket: '$60,000–$180,000+', cluster: 'Kitchen & Bath', underservedMultiplier: 'High' },
  { value: 'Cabinet maker', label: 'Cabinet Maker (Custom Architectural Millwork)', avgTicket: '$18,000–$55,000', cluster: 'Kitchen & Bath', underservedMultiplier: 'High' },
  { value: 'Countertop contractor', label: 'Countertop Contractor (Quartzite & Marble)', avgTicket: '$12,000–$35,000', cluster: 'Kitchen & Bath', underservedMultiplier: 'Medium' },

  // 2. General Contracting & Luxury Construction
  { value: 'General contractor', label: 'General Contractor (Design-Build & Additions)', avgTicket: '$85,000–$350,000+', cluster: 'Construction & Framing', underservedMultiplier: 'Medium' },
  { value: 'Custom home builder', label: 'Custom Home Builder', avgTicket: '$350,000–$2,000,000+', cluster: 'Construction & Framing', underservedMultiplier: 'Very High' },
  { value: 'Home builder', label: 'Home Builder & Structural Additions', avgTicket: '$100,000–$400,000+', cluster: 'Construction & Framing', underservedMultiplier: 'High' },
  { value: 'Garage builder', label: 'Garage Builder & ADU Construction', avgTicket: '$35,000–$95,000', cluster: 'Construction & Framing', underservedMultiplier: 'Very High' },
  { value: 'Interior construction contractor', label: 'Interior Construction Contractor', avgTicket: '$40,000–$120,000', cluster: 'Construction & Framing', underservedMultiplier: 'High' },

  // 3. Outdoor Living, Pools & Architectural Hardscapes
  { value: 'Swimming pool contractor', label: 'Swimming Pool Contractor (Luxury Gunite & Spa)', avgTicket: '$75,000–$225,000+', cluster: 'Outdoor Living', underservedMultiplier: 'Very High' },
  { value: 'Landscape designer', label: 'Landscape Designer (Outdoor Living & Kitchens)', avgTicket: '$35,000–$110,000', cluster: 'Outdoor Living', underservedMultiplier: 'High' },
  { value: 'Landscape architect', label: 'Landscape Architect (Estate Master Plans)', avgTicket: '$50,000–$150,000+', cluster: 'Outdoor Living', underservedMultiplier: 'Very High' },
  { value: 'Deck builder', label: 'Deck Builder (Custom Composite & Hardwood)', avgTicket: '$25,000–$75,000', cluster: 'Outdoor Living', underservedMultiplier: 'High' },
  { value: 'Sunroom contractor', label: 'Sunroom Contractor (Glass Enclosures & Patios)', avgTicket: '$30,000–$85,000', cluster: 'Outdoor Living', underservedMultiplier: 'Very High' },
  { value: 'Paving contractor', label: 'Paving Contractor (Cobblestone & Driveways)', avgTicket: '$20,000–$60,000', cluster: 'Outdoor Living', underservedMultiplier: 'Medium' },
  { value: 'Fence contractor', label: 'Fence Contractor (Architectural Iron & Cedar)', avgTicket: '$15,000–$45,000', cluster: 'Outdoor Living', underservedMultiplier: 'Medium' },

  // 4. Roofing, Siding & Exterior Building Envelope
  { value: 'Roofing contractor', label: 'Roofing Contractor (Standing Seam, Tile & Slate)', avgTicket: '$22,000–$75,000', cluster: 'Exterior Envelope', underservedMultiplier: 'Medium' },
  { value: 'Siding contractor', label: 'Siding Contractor (James Hardie & Engineered Wood)', avgTicket: '$20,000–$55,000', cluster: 'Exterior Envelope', underservedMultiplier: 'High' },
  { value: 'Window installation service', label: 'Window Installation Service (Custom Architectural)', avgTicket: '$25,000–$85,000', cluster: 'Exterior Envelope', underservedMultiplier: 'High' },
  { value: 'Stucco contractor', label: 'Stucco Contractor (Exterior Remediation & Plaster)', avgTicket: '$18,000–$48,000', cluster: 'Exterior Envelope', underservedMultiplier: 'High' },
  { value: 'Solar energy company', label: 'Solar Energy Company (Residential Solar & Storage)', avgTicket: '$25,000–$70,000', cluster: 'Exterior Envelope', underservedMultiplier: 'Medium' },

  // 5. Emergency Restoration, Structural & Foundation
  { value: 'Water damage restoration service', label: 'Water Damage Restoration Service', avgTicket: '$18,000–$65,000', cluster: 'Restoration & Disaster', underservedMultiplier: 'Very High' },
  { value: 'Fire damage restoration service', label: 'Fire Damage Restoration Service', avgTicket: '$30,000–$120,000+', cluster: 'Restoration & Disaster', underservedMultiplier: 'Very High' },
  { value: 'Foundation', label: 'Foundation Contractor (Helical Piering & Underpinning)', avgTicket: '$15,000–$55,000', cluster: 'Structural & Concrete', underservedMultiplier: 'Very High' },
  { value: 'Waterproofing service', label: 'Waterproofing Service (Basement Encapsulation)', avgTicket: '$14,000–$45,000', cluster: 'Structural & Concrete', underservedMultiplier: 'Very High' },
  { value: 'Concrete contractor', label: 'Concrete Contractor (Decorative & Structural Slabs)', avgTicket: '$16,000–$50,000', cluster: 'Structural & Concrete', underservedMultiplier: 'Medium' },
  { value: 'Masonry contractor', label: 'Masonry Contractor (Natural Stone & Retaining Walls)', avgTicket: '$20,000–$65,000', cluster: 'Structural & Concrete', underservedMultiplier: 'High' },
  { value: 'Excavating contractor', label: 'Excavating Contractor (Site Prep & Grading)', avgTicket: '$20,000–$70,000', cluster: 'Structural & Concrete', underservedMultiplier: 'High' },
  { value: 'Demolition contractor', label: 'Demolition Contractor (Structural & Interior Tear-Out)', avgTicket: '$15,000–$45,000', cluster: 'Structural & Concrete', underservedMultiplier: 'Medium' },

  // 6. Mechanical, Energy & High-End Interior Finishing
  { value: 'HVAC contractor', label: 'HVAC Contractor (Multi-Zone & Inverter Replacement)', avgTicket: '$16,000–$40,000', cluster: 'Mechanical & Comfort', underservedMultiplier: 'Medium' },
  { value: 'Heating contractor', label: 'Heating Contractor (Boiler & Radiant In-Floor Systems)', avgTicket: '$15,000–$38,000', cluster: 'Mechanical & Comfort', underservedMultiplier: 'Medium' },
  { value: 'Air conditioning contractor', label: 'Air Conditioning Contractor', avgTicket: '$15,000–$36,000', cluster: 'Mechanical & Comfort', underservedMultiplier: 'Medium' },
  { value: 'Insulation contractor', label: 'Insulation Contractor (Closed-Cell Spray Foam)', avgTicket: '$12,000–$32,000', cluster: 'Mechanical & Comfort', underservedMultiplier: 'High' },
  { value: 'Flooring contractor', label: 'Flooring Contractor (Custom Hardwood & Terrazzo)', avgTicket: '$16,000–$48,000', cluster: 'Finishing Trades', underservedMultiplier: 'High' },
  { value: 'Tile contractor', label: 'Tile Contractor (Large-Format Porcelain & Stone)', avgTicket: '$14,000–$42,000', cluster: 'Finishing Trades', underservedMultiplier: 'High' },
  { value: 'Marble contractor', label: 'Marble Contractor (Slab Fabrication & Bookmatching)', avgTicket: '$22,000–$65,000', cluster: 'Finishing Trades', underservedMultiplier: 'Very High' },
  { value: 'Dry wall contractor', label: 'Dry Wall Contractor (Level 5 Smooth Finish & Framing)', avgTicket: '$14,000–$38,000', cluster: 'Finishing Trades', underservedMultiplier: 'Medium' },
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
    const stateObj = ALL_US_STATES[pocket.state];
    return {
      niche: niche.value,
      state: pocket.state,
      city: pocket.city,
      timezone: stateObj?.timezone || 'America/Chicago',
      reason: pocket.reason,
    };
  }

  // 30% chance to target a random state/city from the exhaustive 50-state database
  const stateKeys = Object.keys(ALL_US_STATES);
  const randomStateKey = stateKeys[Math.floor(Math.random() * stateKeys.length)];
  const randomState = ALL_US_STATES[randomStateKey];
  const randomCity = randomState.cities[Math.floor(Math.random() * randomState.cities.length)] || 'Metro Area';

  return {
    niche: niche.value,
    state: randomState.code,
    city: randomCity,
    timezone: randomState.timezone,
    reason: `Targeting high-intent ${niche.label} in ${randomCity}, ${randomState.code}.`,
  };
}
