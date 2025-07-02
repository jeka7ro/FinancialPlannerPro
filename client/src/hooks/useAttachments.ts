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

// Cache for stable references
const snapshotCache = new Map<string, any[]>();

// Set the cache reference in attachmentManager
setAttachmentCache(snapshotCache);

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
      
      console.log(`[useAttachments] ${entityType}:${entityId}`, {
        attachments: attachments.length,
        cached: cached?.length || 0,
        hasChanged: cached && cached.length === attachments.length ? 
          cached.some((cachedAtt, index) => {
            const newAtt = attachments[index];
            return !newAtt || cachedAtt.id !== newAtt.id;
          }) : true,
        attachmentIds: attachments.map(a => a.id),
        cachedIds: cached?.map(a => a.id) || []
      });
      
      // Check if the attachments have actually changed
      if (cached && cached.length === attachments.length) {
        const hasChanged = cached.some((cachedAtt, index) => {
          const newAtt = attachments[index];
          return !newAtt || cachedAtt.id !== newAtt.id;
        });
        if (!hasChanged) {
          console.log(`[useAttachments] ${entityType}:${entityId} - returning cached result`);
          return cached;
        }
      }
      
      // Update cache and return new reference
      const newAttachments = [...attachments];
      snapshotCache.set(snapshotKey, newAttachments);
      console.log(`[useAttachments] ${entityType}:${entityId} - returning new result:`, newAttachments.length, newAttachments.map(a => a.id));
      return newAttachments;
    }
  );
} 