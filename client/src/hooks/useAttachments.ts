import { useSyncExternalStore } from "react";
import { attachmentManager, setAttachmentCache } from "@/lib/mockAttachments";

export type EntityType = 
  | 'users' 
  | 'providers' 
  | 'companies' 
  | 'locations'
  | 'provider'
  | 'cabinets'
  | 'invoices'
  | 'legal-documents'
  | 'legal_document'
  | 'onjn_notification'
  | 'onjn_report'
  | 'onjn-report'
  | 'rent-agreements'
  | 'slots'
  | 'game-mixes';

// Cache for stable references with localStorage persistence
const snapshotCache = new Map<string, any[]>();

// Load cache from localStorage on initialization
const loadCacheFromStorage = () => {
  try {
    const savedCache = localStorage.getItem('cashpot_attachments_cache');
    if (savedCache) {
      const parsedCache = JSON.parse(savedCache);
      for (const [key, value] of Object.entries(parsedCache)) {
        snapshotCache.set(key, value as any[]);
      }
      console.log('[useAttachments] Loaded cache from localStorage:', snapshotCache.size, 'entries');
    }
  } catch (error) {
    console.error('[useAttachments] Error loading cache from localStorage:', error);
  }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheObject: { [key: string]: any[] } = {};
    snapshotCache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    localStorage.setItem('cashpot_attachments_cache', JSON.stringify(cacheObject));
  } catch (error) {
    console.error('[useAttachments] Error saving cache to localStorage:', error);
  }
};

// Initialize cache from localStorage
loadCacheFromStorage();

// Set the cache reference in attachmentManager
setAttachmentCache(snapshotCache);

function getSnapshotKey(entityType: EntityType, entityId: number): string {
  return `${entityType}-${entityId}`;
}

// Function to clear cache for a specific entity
export function clearAttachmentCache(entityType: EntityType, entityId: number) {
  const key = getSnapshotKey(entityType, entityId);
  snapshotCache.delete(key);
  saveCacheToStorage();
  console.log(`[useAttachments] Cleared cache for ${key}`);
}

// Function to clear all cache
export function clearAllAttachmentCache() {
  snapshotCache.clear();
  localStorage.removeItem('cashpot_attachments_cache');
  console.log('[useAttachments] Cleared all cache');
}

export function useAttachments(entityType: EntityType, entityId: number) {
  const snapshotKey = getSnapshotKey(entityType, entityId);
  
  return useSyncExternalStore(
    (callback) => attachmentManager.subscribe(entityType, entityId, callback),
    () => {
      const attachments = attachmentManager.getAttachments(entityType, entityId);
      const cached = snapshotCache.get(snapshotKey);
      
      // If no attachments found and no cache, return empty array
      if (!attachments.length && !cached) {
        return [];
      }

      // If we have cached data and it matches current data, return cached
      if (cached && cached.length === attachments.length) {
        const hasChanged = cached.some((cachedAtt, index) => {
          const newAtt = attachments[index];
          return !newAtt || cachedAtt.id !== newAtt.id || cachedAtt.url !== newAtt.url;
        });
        if (!hasChanged) {
          return cached;
        }
      }
      
      // Update cache and save to localStorage
      const newAttachments = [...attachments];
      snapshotCache.set(snapshotKey, newAttachments);
      saveCacheToStorage();
      
      return newAttachments;
    }
  );
} 