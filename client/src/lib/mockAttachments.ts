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
let attachmentsState: MockAttachments = {
  users: {
    1: [
      {
        id: 1,
        filename: "profile_photo.jpg",
        mimeType: "image/jpeg",
        fileSize: 256000,
        createdAt: "2024-01-15T10:30:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMzYjgyZjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      },
      {
        id: 2,
        filename: "contract.pdf",
        mimeType: "application/pdf",
        fileSize: 1024000,
        createdAt: "2024-01-10T14:20:00Z",
        url: "/api/attachments/2/download"
      }
    ],
    2: [
      {
        id: 3,
        filename: "avatar.jpg",
        mimeType: "image/jpeg",
        fileSize: 180000,
        createdAt: "2024-01-12T09:15:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlZjQ0NDQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      },
      {
        id: 4,
        filename: "id_document.pdf",
        mimeType: "application/pdf",
        fileSize: 512000,
        createdAt: "2024-01-12T09:15:00Z",
        url: "/api/attachments/4/download"
      }
    ],
    3: [
      {
        id: 5,
        filename: "profile_image.png",
        mimeType: "image/png",
        fileSize: 220000,
        createdAt: "2024-01-14T16:45:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMxMGI5ODEiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    4: [
      {
        id: 6,
        filename: "user_photo.jpg",
        mimeType: "image/jpeg",
        fileSize: 195000,
        createdAt: "2024-01-13T12:30:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNmNTk4M2EiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    5: [
      {
        id: 7,
        filename: "avatar_pic.png",
        mimeType: "image/png",
        fileSize: 165000,
        createdAt: "2024-01-11T08:20:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM4YjVjZjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    6: [
      {
        id: 8,
        filename: "profile.jpg",
        mimeType: "image/jpeg",
        fileSize: 240000,
        createdAt: "2024-01-10T15:10:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlYzQ4OTkiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    7: [
      {
        id: 9,
        filename: "user_avatar.png",
        mimeType: "image/png",
        fileSize: 210000,
        createdAt: "2024-01-09T11:40:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM2MzY2ZjEiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    8: [
      {
        id: 10,
        filename: "photo.jpg",
        mimeType: "image/jpeg",
        fileSize: 185000,
        createdAt: "2024-01-08T13:25:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMwNjkxNGQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    9: [
      {
        id: 11,
        filename: "profile_pic.png",
        mimeType: "image/png",
        fileSize: 225000,
        createdAt: "2024-01-07T09:15:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNkYzI2MjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ],
    10: [
      {
        id: 12,
        filename: "avatar_img.jpg",
        mimeType: "image/jpeg",
        fileSize: 200000,
        createdAt: "2024-01-06T14:50:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM5MzM2ZmYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxNSIgZmlsbD0id2hpdGUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSI3NSIgcng9IjI1IiByeT0iMjAiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
      }
    ]
  },
  companies: {
    1: [
      {
        id: 4,
        filename: "company_logo.png",
        mimeType: "image/png",
        fileSize: 128000,
        createdAt: "2024-01-08T16:45:00Z",
        url: "/api/attachments/4/download"
      },
      {
        id: 5,
        filename: "business_plan.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: 2048000,
        createdAt: "2024-01-05T11:30:00Z",
        url: "/api/attachments/5/download"
      }
    ]
  },
  locations: {
    1: [
      {
        id: 6,
        filename: "location_photo.jpg",
        mimeType: "image/jpeg",
        fileSize: 512000,
        createdAt: "2024-01-14T13:20:00Z",
        url: "/api/attachments/6/download"
      }
    ]
  },
  providers: {
    1: [
      {
        id: 101,
        filename: "novomatic_logo.png",
        mimeType: "image/png",
        fileSize: 128000,
        createdAt: "2024-01-15T10:30:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm92b21hdGljPC90ZXh0Pgo8L3N2Zz4K"
      }
    ],
    2: [
      {
        id: 102,
        filename: "igt_logo.png",
        mimeType: "image/png",
        fileSize: 156000,
        createdAt: "2024-01-14T11:20:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjN2MzYWVkIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SUdUPC90ZXh0Pgo8L3N2Zz4K"
      }
    ],
    3: [
      {
        id: 103,
        filename: "aristocrat_logo.png",
        mimeType: "image/png",
        fileSize: 142000,
        createdAt: "2024-01-13T09:15:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZGMyNjI2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXJpc3RvY3JhdDwvdGV4dD4KPC9zdmc+Cg=="
      }
    ],
    4: [
      {
        id: 104,
        filename: "netent_logo.png",
        mimeType: "image/png",
        fileSize: 118000,
        createdAt: "2024-01-12T14:30:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDU5NjY5Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TmV0RW50PC90ZXh0Pgo8L3N2Zz4K"
      }
    ],
    5: [
      {
        id: 105,
        filename: "playtech_logo.png",
        mimeType: "image/png",
        fileSize: 134000,
        createdAt: "2024-01-11T16:45:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZWE1ODBjIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGxheXRlY2g8L3RleHQ+Cjwvc3ZnPgo="
      }
    ],
    6: [
      {
        id: 106,
        filename: "microgaming_logo.png",
        mimeType: "image/png",
        fileSize: 148000,
        createdAt: "2024-01-10T12:20:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjYmUxODVkIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWljcm9nYW1pbmc8L3RleHQ+Cjwvc3ZnPgo="
      }
    ],
    7: [
      {
        id: 107,
        filename: "evolution_logo.png",
        mimeType: "image/png",
        fileSize: 162000,
        createdAt: "2024-01-09T10:10:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDg5MWIyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXZvbHV0aW9uPC90ZXh0Pgo8L3N2Zz4K"
      }
    ],
    8: [
      {
        id: 108,
        filename: "pragmatic_logo.png",
        mimeType: "image/png",
        fileSize: 138000,
        createdAt: "2024-01-08T15:30:00Z",
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjN2MyZDEyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJhZ21hdGljPC90ZXh0Pgo8L3N2Zz4K"
      }
    ]
  },
  cabinets: {},
  invoices: {},
  'legal-documents': {},
  legal_document: {},
  onjn_notification: {},
  onjn_report: {},
  'onjn-report': {},
  'rent-agreements': {},
  slots: {},
  'game-mixes': {}
};

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
    console.log(`[attachmentManager] Adding attachment to ${entityType}:${entityId}`, attachment);
    
    if (!attachmentsState[entityType]) {
      attachmentsState[entityType] = {};
    }
    if (!attachmentsState[entityType][entityId]) {
      attachmentsState[entityType][entityId] = [];
    }
    attachmentsState[entityType][entityId].push(attachment);
    
    console.log(`[attachmentManager] Total attachments for ${entityType}:${entityId}:`, attachmentsState[entityType][entityId].length);
    
    // Emit update event
    this.emitUpdate(entityType, entityId);
  },

  // Remove attachment
  removeAttachment(entityType: keyof MockAttachments, entityId: number, attachmentId: number) {
    console.log(`[attachmentManager] Removing attachment ${attachmentId} from ${entityType}:${entityId}`);
    
    const entityAttachments = attachmentsState[entityType];
    if (!entityAttachments) {
      return;
    }
    const attachments = entityAttachments[entityId];
    if (attachments) {
      const index = attachments.findIndex(att => att.id === attachmentId);
      if (index > -1) {
        attachments.splice(index, 1);
        console.log(`[attachmentManager] Total attachments for ${entityType}:${entityId}:`, attachments.length);
        
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
    console.log(`[attachmentManager] Emitting update for ${key}, listeners:`, listeners[key]?.length || 0);
    if (listeners[key]) {
      listeners[key].forEach(callback => callback());
    }
  }
};

// Export the state for backward compatibility
export const mockAttachments = attachmentsState; 