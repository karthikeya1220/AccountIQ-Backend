/**
 * Supabase Storage Initialization
 * Run this during app startup to ensure all storage buckets exist
 */

import { storageService } from './storage';

export const initializeStorageBuckets = async () => {
  try {
    console.log('🔄 Initializing Supabase Storage buckets...');
    await storageService.initializeBuckets();
    console.log('✅ Storage buckets ready');
  } catch (error) {
    console.error('❌ Failed to initialize storage buckets:', error);
    // Don't throw - storage bucket creation might fail on first run
    // but the app should still start
  }
};

export default initializeStorageBuckets;
