import { getComboPrice, getComboDiscountedPrice, getRoomPrice, formatPrice } from "./pricing";
import { describe, it, expect } from "@jest/globals";

describe("Pricing Utility", () => {
  describe("getComboPrice", () => {
    it("should resolve price_per_night if it exists", () => {
      const combo = { price_per_night: 23000, pricing: { base_price: 15000 } };
      expect(getComboPrice(combo)).toBe(23000);
    });

    it("should resolve pricing.base_price if price_per_night is missing", () => {
      const combo = { pricing: { base_price: 15000, total_price: 16000 } };
      expect(getComboPrice(combo)).toBe(15000);
    });
    
    it("should resolve pricing.total_price if base_price is missing", () => {
      const combo = { pricing: { total_price: 16000 } };
      expect(getComboPrice(combo)).toBe(16000);
    });

    it("should fallback to legacy room[0] pricing", () => {
      const combo = { rooms: [{ pricing: { base_price: 12000 } }] };
      expect(getComboPrice(combo)).toBe(12000);
    });

    it("should return null if no price is found", () => {
      const combo = { rooms: [{}] };
      expect(getComboPrice(combo)).toBeNull();
    });

    it("should return null for null input", () => {
      expect(getComboPrice(null)).toBeNull();
    });
  });

  describe("getRoomPrice", () => {
    it("should resolve pricing.base_price if it exists", () => {
      const room = { pricing: { base_price: 10000, discounted_rate: 9000 } };
      expect(getRoomPrice(room)).toBe(10000);
    });

    it("should resolve pricing.discounted_rate if base_price is missing", () => {
      const room = { pricing: { discounted_rate: 9000, total_price: 11000 } };
      expect(getRoomPrice(room)).toBe(9000);
    });

    it("should resolve legacy room.price", () => {
      const room = { price: 15000 };
      expect(getRoomPrice(room)).toBe(15000);
    });

    it("should return null if no price is found", () => {
      const room = { discount: 10 };
      expect(getRoomPrice(room)).toBeNull();
    });
  });

  describe("formatPrice", () => {
    it("should format valid prices", () => {
      expect(formatPrice(23000)).toBe("₹23,000");
      expect(formatPrice(37500)).toBe("₹37,500");
    });

    it("should handle null and undefined", () => {
      expect(formatPrice(null)).toBe("Price unavailable");
      expect(formatPrice(undefined)).toBe("Price unavailable");
    });
  });
});
