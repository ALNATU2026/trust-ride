import { CityServiceAvailability, LocationPoint, PricingRule, VehicleCategory } from '../types';

export const SIERRA_LEONE_CITIES: Record<string, LocationPoint> = {
  Freetown: { lat: 8.4844, lng: -13.2344, name: 'Freetown Central', address: 'Cotton Tree, Freetown', city: 'Freetown' },
  Waterloo: { lat: 8.3389, lng: -13.0714, name: 'Waterloo Hub', address: 'Main Motor Road, Waterloo', city: 'Waterloo' },
  Bo: { lat: 7.9647, lng: -11.7383, name: 'Bo City Center', address: 'Tikonko Road, Bo', city: 'Bo' },
  Kenema: { lat: 7.8767, lng: -11.1875, name: 'Kenema Commercial Center', address: 'Hangha Road, Kenema', city: 'Kenema' },
  Makeni: { lat: 8.8833, lng: -12.05, name: 'Makeni Central Market', address: 'Rogbaneh Road, Makeni', city: 'Makeni' },
};

export const POPULAR_LOCATIONS: LocationPoint[] = [
  { lat: 8.4871, lng: -13.2355, name: 'Cotton Tree / State House', address: 'Siaka Stevens St, Freetown', city: 'Freetown' },
  { lat: 8.4721, lng: -13.2798, name: 'Lumley Beach Promenade', address: 'Lumley Beach Road, Aberdeen', city: 'Freetown' },
  { lat: 8.4682, lng: -13.2621, name: 'Wilkinson Road Business Corridor', address: 'Wilkinson Road, Freetown', city: 'Freetown' },
  { lat: 8.4912, lng: -13.2389, name: 'Aberdeen Sea Coach Terminal', address: 'Aberdeen Ferry Terminal, Freetown', city: 'Freetown' },
  { lat: 8.4801, lng: -13.2189, name: 'Kissy Ferry Terminal', address: 'Kissy Dockyard, Freetown', city: 'Freetown' },
  { lat: 8.4611, lng: -13.2399, name: 'Congo Cross Interchange', address: 'Congo Cross, Freetown', city: 'Freetown' },
  { lat: 8.4412, lng: -13.2089, name: 'Jui Junction / Hospital', address: 'Jui Junction, Freetown', city: 'Freetown' },
  { lat: 8.6144, lng: -13.1955, name: 'Freetown International Airport (Lungi)', address: 'Lungi Airport Terminal, Lungi', city: 'Lungi' },
];

export const SEED_VEHICLES_FOR_HIRE = [
  {
    id: 'vh_01',
    category: 'suv' as VehicleCategory,
    make: 'Toyota',
    model: 'Land Cruiser Prado TX',
    year: 2023,
    plateNumber: 'SL 7821 AA',
    dailyRate: 1500,
    hourlyRate: 180,
    available: true,
    withChauffeur: true,
    fuelType: 'Diesel',
    transmission: 'Automatic' as const,
    seats: 7,
    features: ['Air Conditioning', '4x4 Off-Road All-Terrain', 'Chauffeur Included', 'SLRSA GPS Tracking'],
    rating: 5.0,
    totalTrips: 18,
  },
  {
    id: 'vh_02',
    category: 'comfort' as VehicleCategory,
    make: 'Toyota',
    model: 'Camry Executive',
    year: 2022,
    plateNumber: 'SL 9423 BB',
    dailyRate: 900,
    hourlyRate: 120,
    available: true,
    withChauffeur: true,
    fuelType: 'Petrol',
    transmission: 'Automatic' as const,
    seats: 5,
    features: ['Leather Seats', 'Tinted Windows', 'Climate Control', 'SLRSA Certified Driver'],
    rating: 4.9,
    totalTrips: 34,
  },
  {
    id: 'vh_03',
    category: 'minibus' as VehicleCategory,
    make: 'Toyota',
    model: 'HiAce Passenger Minibus',
    year: 2022,
    plateNumber: 'SL 3110 CC',
    dailyRate: 1800,
    hourlyRate: 220,
    available: true,
    withChauffeur: true,
    fuelType: 'Diesel',
    transmission: 'Manual' as const,
    seats: 15,
    features: ['High Roof', 'Luggage Compartment', 'Inter-District Permit', 'Speed Governor Installed'],
    rating: 4.8,
    totalTrips: 42,
  },
  {
    id: 'vh_04',
    category: 'suv' as VehicleCategory,
    make: 'Mitsubishi',
    model: 'Pajero Sport 4WD',
    year: 2021,
    plateNumber: 'SL 5542 DD',
    dailyRate: 1200,
    hourlyRate: 150,
    available: true,
    withChauffeur: true,
    fuelType: 'Diesel',
    transmission: 'Automatic' as const,
    seats: 7,
    features: ['Rugged All-Weather', 'Roof Rack', 'Dual A/C', 'Emergency First Aid Kit'],
    rating: 4.9,
    totalTrips: 29,
  },
];

export const SEED_PROMO_CODES = [
  { code: 'TRUSTSL', discountPercent: 20, maxDiscount: 50, description: 'Welcome 20% off your first ride' },
  { code: 'ORANGE25', discountPercent: 25, maxDiscount: 60, description: 'Orange Money SL Special Promo' },
  { code: 'AFRIFREE', discountPercent: 15, maxDiscount: 40, description: 'Afrimoney weekend commute rebate' },
];

export const SEED_CITY_AVAILABILITY: CityServiceAvailability[] = [
  {
    city: 'Freetown',
    services: { rides: true, kekeh: true, okada: true, delivery: true, logistics: true, hire: true },
  },
  {
    city: 'Waterloo',
    services: { rides: true, kekeh: true, okada: true, delivery: true, logistics: true, hire: true },
  },
  {
    city: 'Bo',
    services: { rides: true, kekeh: true, okada: true, delivery: true, logistics: true, hire: true },
  },
  {
    city: 'Kenema',
    services: { rides: true, kekeh: true, okada: true, delivery: true, logistics: true, hire: true },
  },
  {
    city: 'Makeni',
    services: { rides: true, kekeh: true, okada: true, delivery: true, logistics: true, hire: true },
  },
];
