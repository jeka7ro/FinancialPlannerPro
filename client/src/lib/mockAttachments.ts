// Mock attachments data shared between components
export const mockAttachments = {
  users: {
    1: [
      {
        id: 1,
        filename: "user_profile.jpg",
        mimeType: "image/jpeg",
        fileSize: 245760,
        createdAt: "2024-01-15T10:30:00Z",
        url: "/api/attachments/1/download"
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
        filename: "id_document.pdf",
        mimeType: "application/pdf",
        fileSize: 512000,
        createdAt: "2024-01-12T09:15:00Z",
        url: "/api/attachments/3/download"
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
  }
}; 