/**
 * Women's Month Double Loyalty Points Bonus
 * 
 * This module handles the automatic doubling of loyalty points for all purchases
 * made during March 2026 as part of the International Women's Month promotion.
 * 
 * The bonus is automatically enabled for the entire month of March 2026 and
 * automatically disables at midnight (00:00) on April 1st, 2026, South African Time (SAST - UTC+2).
 */

/**
 * Check if the current date/time is within the Women's Month promotion period
 * @returns {boolean} True if we are in March 2026 (SAST), false otherwise
 */
export function isWomensMonthBonusActive(): boolean {
  // Get current date in South African Time (SAST = UTC+2)
  const now = new Date();
  const sastOffset = 2 * 60; // SAST is UTC+2 (120 minutes)
  const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes (negative for ahead of UTC)
  const sastTime = new Date(now.getTime() + (sastOffset + localOffset) * 60 * 1000);
  
  const year = sastTime.getFullYear();
  const month = sastTime.getMonth(); // 0-indexed: March = 2
  
  // Active only during March 2026
  return year === 2026 && month === 2; // March (0-indexed)
}

/**
 * Calculate loyalty points with Women's Month bonus if applicable
 * @param {number} basePoints - The base points earned before any bonus
 * @returns {number} The final points amount (doubled if bonus is active)
 */
export function calculatePointsWithWomensMonthBonus(basePoints: number): number {
  if (isWomensMonthBonusActive()) {
    return basePoints * 2; // Double points during Women's Month
  }
  return basePoints;
}

/**
 * Get a description for the points transaction including Women's Month bonus info if applicable
 * @param {number} basePoints - The base points before bonus
 * @param {number} finalPoints - The final points after bonus
 * @param {string} baseDescription - The base description
 * @returns {string} The complete description with bonus info if applicable
 */
export function getPointsDescription(basePoints: number, finalPoints: number, baseDescription: string): string {
  if (isWomensMonthBonusActive() && finalPoints > basePoints) {
    return `${baseDescription} (2x Women's Month Bonus: ${basePoints} × 2 = ${finalPoints} points)`;
  }
  return baseDescription;
}

/**
 * Get Women's Month bonus status info
 * @returns {object} Status information about the bonus
 */
export function getWomensMonthBonusStatus() {
  const isActive = isWomensMonthBonusActive();
  
  return {
    isActive,
    message: isActive 
      ? '🎁 Women\'s Month Bonus Active: Earning 2x loyalty points on all purchases!' 
      : 'Women\'s Month bonus is not currently active',
    multiplier: isActive ? 2 : 1,
    activeMonths: 'March 2026',
    timezone: 'South African Time (SAST - UTC+2)'
  };
}
