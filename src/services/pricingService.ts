import { PricingRule, VehicleCategory } from '../types';

export const DEFAULT_PRICING_RULES: Record<VehicleCategory, PricingRule> = {
  okada: {
    category: 'okada',
    name: 'Motorbike Express (Okada)',
    baseFare: 10,
    perKmRate: 4,
    perMinuteRate: 0.5,
    minimumFare: 15,
    surgeMultiplier: 1.0,
  },
  kekeh: {
    category: 'kekeh',
    name: 'Tricycle (Kekeh)',
    baseFare: 15,
    perKmRate: 6,
    perMinuteRate: 0.8,
    minimumFare: 20,
    surgeMultiplier: 1.0,
  },
  economy: {
    category: 'economy',
    name: 'Standard Taxi Cab',
    baseFare: 25,
    perKmRate: 10,
    perMinuteRate: 1.2,
    minimumFare: 35,
    surgeMultiplier: 1.0,
  },
  comfort: {
    category: 'comfort',
    name: 'Air Conditioned Comfort',
    baseFare: 40,
    perKmRate: 15,
    perMinuteRate: 1.8,
    minimumFare: 60,
    surgeMultiplier: 1.0,
  },
  suv: {
    category: 'suv',
    name: 'Executive 4x4 SUV',
    baseFare: 80,
    perKmRate: 25,
    perMinuteRate: 3.0,
    minimumFare: 120,
    surgeMultiplier: 1.0,
  },
  minibus: {
    category: 'minibus',
    name: 'Passenger Minibus / Group',
    baseFare: 100,
    perKmRate: 30,
    perMinuteRate: 3.5,
    minimumFare: 150,
    surgeMultiplier: 1.0,
  },
  cargo: {
    category: 'cargo',
    name: 'Freight & Cargo Truck',
    baseFare: 150,
    perKmRate: 45,
    perMinuteRate: 4.0,
    minimumFare: 250,
    surgeMultiplier: 1.0,
  },
};

export class PricingEngine {
  private rules: Record<VehicleCategory, PricingRule>;

  constructor(rules: Record<VehicleCategory, PricingRule> = DEFAULT_PRICING_RULES) {
    this.rules = rules;
  }

  calculateEstimate(
    category: VehicleCategory,
    distanceKm: number,
    durationMinutes: number,
    surge: number = 1.0
  ): {
    estimatedFare: number;
    breakdown: {
      base: number;
      distanceFare: number;
      timeFare: number;
      surgeAmount: number;
    };
  } {
    const rule = this.rules[category] || this.rules.economy;
    const base = rule.baseFare;
    const distanceFare = distanceKm * rule.perKmRate;
    const timeFare = durationMinutes * rule.perMinuteRate;
    const subtotal = base + distanceFare + timeFare;
    const effectiveSurge = Math.max(1.0, surge || rule.surgeMultiplier);
    const surgeAmount = subtotal * (effectiveSurge - 1.0);
    const total = Math.max(rule.minimumFare, Math.round(subtotal + surgeAmount));

    return {
      estimatedFare: total,
      breakdown: {
        base,
        distanceFare: Math.round(distanceFare),
        timeFare: Math.round(timeFare),
        surgeAmount: Math.round(surgeAmount),
      },
    };
  }
}
