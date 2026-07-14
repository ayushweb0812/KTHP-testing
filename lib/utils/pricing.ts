export interface PricingNode {
  base_price?: number;
  discounted_rate?: number;
  total_price?: number;
  discounted_price?: number;
}

export interface ComboData {
  price_per_night?: number;
  pricing?: PricingNode;
  rooms?: RoomData[];
  // Legacy
  total_price?: number;
  discounted_price?: number;
  price?: number;
}

export interface RoomData {
  price?: number;
  pricing?: PricingNode;
  discount?: number;
  // Legacy
  total_price?: number;
}

/**
 * Resolves the numeric price for a combo based on the expected backend contract.
 *
 * Priority:
 * 1. combo.price_per_night
 * 2. combo.pricing.base_price
 * 3. combo.pricing.total_price
 *
 * Legacy fallback only:
 * 4. combo.rooms[0].pricing.base_price
 * 5. combo.rooms[0].pricing.total_price
 * 6. combo.rooms[0].price
 * 
 * Returns null if no price is found, instead of defaulting to 0.
 */
export function getComboPrice(combo: any): number | null {
  if (!combo) return null;

  const price =
    combo.price_per_night ??
    combo.pricing?.base_price ??
    combo.pricing?.total_price ??
    combo.rooms?.[0]?.pricing?.base_price ??
    combo.rooms?.[0]?.pricing?.total_price ??
    combo.rooms?.[0]?.price ??
    null;

  if (process.env.NODE_ENV === "development" && price === null) {
    console.warn("Unable to resolve combo price", combo);
  }

  return price;
}

/**
 * Resolves the numeric discounted price for a combo if available.
 */
export function getComboDiscountedPrice(combo: any): number | null {
  if (!combo) return null;

  const price = 
    combo.pricing?.discounted_price ?? 
    combo.discounted_price ?? 
    null;

  return price;
}

/**
 * Resolves the numeric price for a single room based on the expected backend contract.
 *
 * Priority:
 * 1. room.pricing.base_price
 * 2. room.pricing.discounted_rate
 * 3. room.pricing.total_price
 * 4. room.price
 * 
 * Returns null if no price is found.
 */
export function getRoomPrice(room: any): number | null {
  if (!room) return null;

  const price =
    room.pricing?.base_price ??
    room.pricing?.discounted_rate ??
    room.pricing?.total_price ??
    room.price ??
    null;

  if (process.env.NODE_ENV === "development" && price === null) {
    console.warn("Unable to resolve room price", room);
  }

  return price;
}

/**
 * Formats a numeric price into a currency string (e.g. ₹23,000).
 * Should only be used for UI presentation, not business logic.
 *
 * Returns "Price unavailable" if the input is null.
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "Price unavailable";
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
