import { dashboardService } from './dashboard.service';

/**
 * Cache Invalidation Service
 * Handles cache invalidation when data changes in bills, expenses, budgets, etc.
 */

/**
 * Invalidate dashboard cache when bills change
 */
export async function invalidateDashboardOnBillChange(userId?: string): Promise<void> {
  try {
    await dashboardService.invalidateDashboardCache(userId);
    console.log('Dashboard cache invalidated - bill changed', { userId });
  } catch (error) {
    console.warn('Failed to invalidate dashboard cache on bill change:', error);
  }
}

/**
 * Invalidate dashboard cache when expenses change
 */
export async function invalidateDashboardOnExpenseChange(userId?: string): Promise<void> {
  try {
    await dashboardService.invalidateDashboardCache(userId);
    console.log('Dashboard cache invalidated - expense changed', { userId });
  } catch (error) {
    console.warn('Failed to invalidate dashboard cache on expense change:', error);
  }
}

/**
 * Invalidate dashboard cache when budgets change
 */
export async function invalidateDashboardOnBudgetChange(userId?: string): Promise<void> {
  try {
    await dashboardService.invalidateDashboardCache(userId);
    console.log('Dashboard cache invalidated - budget changed', { userId });
  } catch (error) {
    console.warn('Failed to invalidate dashboard cache on budget change:', error);
  }
}

/**
 * Invalidate dashboard cache when cards change
 */
export async function invalidateDashboardOnCardChange(userId?: string): Promise<void> {
  try {
    await dashboardService.invalidateDashboardCache(userId);
    console.log('Dashboard cache invalidated - card changed', { userId });
  } catch (error) {
    console.warn('Failed to invalidate dashboard cache on card change:', error);
  }
}

/**
 * Invalidate dashboard cache when salary data changes
 */
export async function invalidateDashboardOnSalaryChange(userId?: string): Promise<void> {
  try {
    await dashboardService.invalidateDashboardCache(userId);
    console.log('Dashboard cache invalidated - salary changed', { userId });
  } catch (error) {
    console.warn('Failed to invalidate dashboard cache on salary change:', error);
  }
}

/**
 * Invalidate all dashboard caches (use when doing bulk operations)
 */
export async function invalidateDashboardCache(userId?: string): Promise<void> {
  try {
    await dashboardService.invalidateDashboardCache(userId);
    console.log('Dashboard cache invalidated', { userId });
  } catch (error) {
    console.warn('Failed to invalidate dashboard cache:', error);
  }
}
