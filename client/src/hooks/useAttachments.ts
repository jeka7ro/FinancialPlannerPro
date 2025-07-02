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

// Simple cache without complex logic
const attachmentCache = new Map<string, any[]>();

function getCacheKey(entityType: EntityType, entityId: number): string {
  return `${entityType}-${entityId}`;
}

// Function to clear cache for a specific entity
export function clearAttachmentCache(entityType: EntityType, entityId: number) {
  const key = getCacheKey(entityType, entityId);
  attachmentCache.delete(key);
}

// Function to clear all cache
export function clearAllAttachmentCache() {
  attachmentCache.clear();
}

export function useAttachments(entityType: EntityType, entityId: number) {
  return useSyncExternalStore(
    (callback) => attachmentManager.subscribe(entityType, entityId, callback),
    () => {
      const key = getCacheKey(entityType, entityId);
      const attachments = attachmentManager.getAttachments(entityType, entityId);
      
      // Simple caching - just return the same array reference if data hasn't changed
      const existing = attachmentCache.get(key);
      if (existing && existing.length === attachments.length) {
        // Quick check - if lengths match and first item is same, assume no change
        if (attachments.length === 0 || 
           (existing[0] && attachments[0] && existing[0].id === attachments[0].id)) {
          return existing;
        }
      }
      
      // Cache and return new array
      const newArray = [...attachments];
      attachmentCache.set(key, newArray);
      return newArray;
    }
  );
} 