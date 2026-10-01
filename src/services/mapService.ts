import { LocationPoint } from '../types';
import { POPULAR_LOCATIONS, SIERRA_LEONE_CITIES } from '../data/seedData';

export class MapService {
  private static instance: MapService;

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  // Calculate Haversine distance in KM
  calculateDistance(from: LocationPoint, to: LocationPoint): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(to.lat - from.lat);
    const dLng = this.deg2rad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(from.lat)) *
        Math.cos(this.deg2rad(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    // Real roads in Sierra Leone average 1.35x detour factor
    return Math.max(1.0, Math.round(straightKm * 1.35 * 10) / 10);
  }

  calculateDurationMinutes(distanceKm: number, city: string = 'Freetown'): number {
    // Average urban speed in Freetown traffic: 20 km/h; intercity: 45 km/h
    const speedKmH = city === 'Freetown' ? 22 : 40;
    const hours = distanceKm / speedKmH;
    return Math.max(5, Math.round(hours * 60));
  }

  searchLocations(query: string, city: string = 'Freetown'): LocationPoint[] {
    const clean = query.toLowerCase().trim();
    if (!clean) return POPULAR_LOCATIONS.filter((l) => l.city === city);

    return POPULAR_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(clean) ||
        l.address.toLowerCase().includes(clean) ||
        l.city.toLowerCase().includes(clean)
    );
  }

  getCityCenter(city: string): LocationPoint {
    return SIERRA_LEONE_CITIES[city] || SIERRA_LEONE_CITIES['Freetown'];
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
