import { useSyncExternalStore } from "react";
import { attachmentManager } from "@/lib/mockAttachments";

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

// Cache for stable references
const snapshotCache = new Map<string, any[]>();

function getSnapshotKey(entityType: EntityType, entityId: number): string {
  return `${entityType}-${entityId}`;
}

// Function to clear cache for a specific entity
export function clearAttachmentCache(entityType: EntityType, entityId: number) {
  const key = getSnapshotKey(entityType, entityId);
  snapshotCache.delete(key);
  console.log(`[useAttachments] Cleared cache for ${key}`);
}

// Function to clear all cache
export function clearAllAttachmentCache() {
  snapshotCache.clear();
  console.log('[useAttachments] Cleared all cache');
}

export function useAttachments(entityType: EntityType, entityId: number) {
  const snapshotKey = getSnapshotKey(entityType, entityId);
  
  return useSyncExternalStore(
    (callback) => attachmentManager.subscribe(entityType, entityId, callback),
    () => {
      const attachments = attachmentManager.getAttachments(entityType, entityId);
      const cached = snapshotCache.get(snapshotKey);
      
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
      
      // Create new cached array if needed (don't modify cache in getSnapshot)
      const newAttachments = [...attachments];
      
      // Update cache outside of this function to avoid side effects in getSnapshot
      setTimeout(() => {
        snapshotCache.set(snapshotKey, newAttachments);
      }, 0);
      
      return newAttachments;
    }
  );
} 