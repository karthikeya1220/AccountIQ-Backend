/**
 * Supabase Storage Initialization
 * Run this during app startup to ensure all storage buckets exist
 */

import { storageService } from './storage';

export const initializeStorageBuckets = async () => {
  try {
    console.log('🔄 Initializing Supabase Storage buckets...');
    const initFn = (storageService as any).initializeBuckets;
    if (typeof initFn === 'function') {
      await initFn.call(storageService);
      console.log('✅ Storage buckets ready');
    } else {
      console.log('⚠️ storageService.initializeBuckets is not available; skipping storage initialization');
    }
  } catch (error) {
    console.error('❌ Failed to initialize storage buckets:', error);
    // Don't throw - storage bucket creation might fail on first run
    // but the app should still start
  }
};

export default initializeStorageBuckets;
