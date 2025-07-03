import { useState, useEffect } from "react";
import { attachmentManager } from "@/lib/mockAttachments";

export type EntityType = 
  | 'users' 
  | 'providers' 
  | 'companies' 
  | 'locations'
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

// Function to clear cache for a specific entity
export function clearAttachmentCache(entityType: EntityType, entityId: number) {
  // No cache in this simplified version
}

// Function to clear all cache
export function clearAllAttachmentCache() {
  // No cache in this simplified version
}

export function useAttachments(entityType: EntityType, entityId: number) {
  const [attachments, setAttachments] = useState(() => 
    attachmentManager.getAttachments(entityType, entityId)
  );

  useEffect(() => {
    // Get initial data
    const initialAttachments = attachmentManager.getAttachments(entityType, entityId);
    setAttachments(initialAttachments);

    // Subscribe to updates
    const unsubscribe = attachmentManager.subscribe(entityType, entityId, () => {
      const updatedAttachments = attachmentManager.getAttachments(entityType, entityId);
      setAttachments(updatedAttachments);
    });

    return unsubscribe;
  }, [entityType, entityId]);

  return attachments;
} 