// Mock attachments data shared between components

interface Attachment {
  id: number;
  filename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  url: string;
}

interface EntityAttachments {
  [key: number]: Attachment[];
}

interface MockAttachments {
  users: EntityAttachments;
  companies: EntityAttachments;
  locations: EntityAttachments;
  providers: EntityAttachments;
  cabinets: EntityAttachments;
  invoices: EntityAttachments;
  'legal-documents': EntityAttachments;
  legal_document: EntityAttachments;
  onjn_notification: EntityAttachments;
  onjn_report: EntityAttachments;
  'onjn-report': EntityAttachments;
  'rent-agreements': EntityAttachments;
  slots: EntityAttachments;
  'game-mixes': EntityAttachments;
}

// Global state for attachments
let attachmentsState: MockAttachments = JSON.parse(localStorage.getItem('attachmentsState') || '{}');

// Initialize empty arrays if not present
const entityKeys: (keyof MockAttachments)[] = [
  'users', 'companies', 'locations', 'providers', 'cabinets', 'invoices',
  'legal-documents', 'legal_document', 'onjn_notification', 'onjn_report',
  'onjn-report', 'rent-agreements', 'slots', 'game-mixes'
];
entityKeys.forEach(key => {
  if (!attachmentsState[key]) attachmentsState[key] = {};
});

function saveState() {
  localStorage.setItem('attachmentsState', JSON.stringify(attachmentsState));
}

// Event listeners for live updates
const listeners: { [key: string]: Function[] } = {};

// Functions to manage attachments
export const attachmentManager = {
  // Get attachments for an entity
  getAttachments(entityType: keyof MockAttachments, entityId: number): Attachment[] {
    const entityAttachments = attachmentsState[entityType];
    if (!entityAttachments) {
      return [];
    }
    return entityAttachments[entityId] || [];
  },

  // Add attachment
  addAttachment(entityType: keyof MockAttachments, entityId: number, attachment: Attachment) {
    if (!attachmentsState[entityType]) {
      attachmentsState[entityType] = {};
    }
    if (!attachmentsState[entityType][entityId]) {
      attachmentsState[entityType][entityId] = [];
    }
    attachmentsState[entityType][entityId].push(attachment);
    saveState();
    this.emitUpdate(entityType, entityId);
  },

  // Remove attachment
  removeAttachment(entityType: keyof MockAttachments, entityId: number, attachmentId: number) {
    const entityAttachments = attachmentsState[entityType];
    if (!entityAttachments) {
      return;
    }
    const attachments = entityAttachments[entityId];
    if (attachments) {
      const index = attachments.findIndex(att => att.id === attachmentId);
      if (index > -1) {
        attachments.splice(index, 1);
        saveState();
        this.emitUpdate(entityType, entityId);
      }
    }
  },

  // Get first image attachment (for logo/avatar)
  getFirstImage(entityType: keyof MockAttachments, entityId: number): Attachment | null {
    const attachments = this.getAttachments(entityType, entityId);
    return attachments.find(att => att.mimeType.startsWith('image/')) || null;
  },

  // Subscribe to updates
  subscribe(entityType: keyof MockAttachments, entityId: number, callback: Function) {
    const key = `${entityType}-${entityId}`;
    if (!listeners[key]) {
      listeners[key] = [];
    }
    listeners[key].push(callback);
    // Return unsubscribe function
    return () => {
      if (listeners[key]) {
        const index = listeners[key].indexOf(callback);
        if (index > -1) {
          listeners[key].splice(index, 1);
        }
      }
    };
  },

  // Emit update event
  emitUpdate(entityType: keyof MockAttachments, entityId: number) {
    const key = `${entityType}-${entityId}`;
    if (listeners[key]) {
      listeners[key].forEach(callback => callback());
    }
  }
};

// Export the state for backward compatibility
export const mockAttachments = attachmentsState; 