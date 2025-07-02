import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Mock data pentru deploy frontend-only - cu date realiste
const mockUser = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  created_at: new Date().toISOString(),
};

// Mock authentication state
let mockAuthState: {
  isAuthenticated: boolean;
  currentUser: any;
  sessionToken: string | null;
} = {
  isAuthenticated: false,
  currentUser: null,
  sessionToken: null
};

// Load authentication state from localStorage on initialization
const loadAuthState = () => {
  try {
    const savedState = localStorage.getItem('cashpot_auth_state');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      mockAuthState = {
        isAuthenticated: parsedState.isAuthenticated || false,
        currentUser: parsedState.currentUser || null,
        sessionToken: parsedState.sessionToken || null
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
    // Reset to default state if there's an error
    mockAuthState = {
      isAuthenticated: false,
      currentUser: null,
      sessionToken: null
    };
  }
};

// Save authentication state to localStorage
const saveAuthState = () => {
  try {
    localStorage.setItem('cashpot_auth_state', JSON.stringify(mockAuthState));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

// Clear authentication state from localStorage
const clearAuthState = () => {
  try {
    localStorage.removeItem('cashpot_auth_state');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

// Initialize auth state on module load
loadAuthState();

// Mock users for authentication
const mockAuthUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // In real app, this would be hashed
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    username: "manager1",
    password: "manager123",
    email: "manager1@royalgaming.ro",
    firstName: "Maria",
    lastName: "Popescu",
    role: "manager",
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    username: "operator1",
    password: "operator123",
    email: "operator1@diamondclub.ro",
    firstName: "Ion",
    lastName: "Ionescu",
    role: "operator",
    isActive: true,
    created_at: new Date().toISOString(),
  }
];

// Mock data pentru toate entitățile
const mockCompanies = [
  {
    id: 1,
    name: "Royal Gaming Romania",
    registrationNumber: "RO12345678",
    taxId: "RO12345678",
    address: "Strada Victoriei 123",
    city: "București",
    county: "București",
    country: "Romania",
    phone: "+40 21 123 4567",
    email: "contact@royalgaming.ro",
    website: "https://royalgaming.ro",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Diamond Club Timișoara",
    registrationNumber: "RO87654321",
    taxId: "RO87654321",
    address: "Bulevardul Revoluției 45",
    city: "Timișoara",
    county: "Timiș",
    country: "Romania",
    phone: "+40 256 123 456",
    email: "info@diamondclub.ro",
    website: "https://diamondclub.ro",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Golden Palace Cluj",
    registrationNumber: "RO11223344",
    taxId: "RO11223344",
    address: "Strada Republicii 67",
    city: "Cluj-Napoca",
    county: "Cluj",
    country: "Romania",
    phone: "+40 264 123 456",
    email: "contact@goldenpalace.ro",
    website: "https://goldenpalace.ro",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Casino Elite Iași",
    registrationNumber: "RO55667788",
    taxId: "RO55667788",
    address: "Bulevardul Ștefan cel Mare 89",
    city: "Iași",
    county: "Iași",
    country: "Romania",
    phone: "+40 232 123 456",
    email: "info@casinoelite.ro",
    website: "https://casinoelite.ro",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Lucky Star Constanța",
    registrationNumber: "RO99887766",
    taxId: "RO99887766",
    address: "Strada Tomis 34",
    city: "Constanța",
    county: "Constanța",
    country: "Romania",
    phone: "+40 241 123 456",
    email: "contact@luckystar.ro",
    website: "https://luckystar.ro",
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockLocations = [
  {
    id: 1,
    name: "Royal Gaming București Centru",
    address: "Strada Victoriei 123",
    city: "București",
    county: "București",
    country: "Romania",
    phone: "+40 21 123 4567",
    email: "bucuresti@royalgaming.ro",
    companyId: 1,
    managerId: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Diamond Club Timișoara Centru",
    address: "Bulevardul Revoluției 45",
    city: "Timișoara",
    county: "Timiș",
    country: "Romania",
    phone: "+40 256 123 456",
    email: "timisoara@diamondclub.ro",
    companyId: 2,
    managerId: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Golden Palace Cluj Centru",
    address: "Strada Republicii 67",
    city: "Cluj-Napoca",
    county: "Cluj",
    country: "Romania",
    phone: "+40 264 123 456",
    email: "cluj@goldenpalace.ro",
    companyId: 3,
    managerId: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Casino Elite Iași Mall",
    address: "Bulevardul Ștefan cel Mare 89",
    city: "Iași",
    county: "Iași",
    country: "Romania",
    phone: "+40 232 123 456",
    email: "iasi@casinoelite.ro",
    companyId: 4,
    managerId: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Lucky Star Constanța Port",
    address: "Strada Tomis 34",
    city: "Constanța",
    county: "Constanța",
    country: "Romania",
    phone: "+40 241 123 456",
    email: "constanta@luckystar.ro",
    companyId: 5,
    managerId: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Royal Gaming București Mall",
    address: "Bulevardul Unirii 156",
    city: "București",
    county: "București",
    country: "Romania",
    phone: "+40 21 123 4568",
    email: "mall@royalgaming.ro",
    companyId: 1,
    managerId: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockProviders = [
  {
    id: 1,
    name: "Novomatic",
    companyName: "Novomatic Gaming Industries GmbH",
    contactPerson: "Hans Mueller",
    email: "contact@novomatic.com",
    phone: "+43 1 234 5678",
    address: "Industriestraße 6",
    city: "Gumpoldskirchen",
    country: "Austria",
    website: "https://www.novomatic.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "IGT",
    companyName: "International Game Technology PLC",
    contactPerson: "John Smith",
    email: "info@igt.com",
    phone: "+1 702 669 7777",
    address: "6355 S. Buffalo Dr.",
    city: "Las Vegas",
    country: "USA",
    website: "https://www.igt.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Aristocrat",
    companyName: "Aristocrat Technologies Inc.",
    contactPerson: "Sarah Johnson",
    email: "contact@aristocrat.com",
    phone: "+1 702 597 7717",
    address: "4650 S. Fort Apache Rd.",
    city: "Las Vegas",
    country: "USA",
    website: "https://www.aristocrat.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "NetEnt",
    companyName: "NetEnt AB",
    contactPerson: "Erik Anderson",
    email: "info@netent.com",
    phone: "+46 8 123 4567",
    address: "Vasagatan 28",
    city: "Stockholm",
    country: "Sweden",
    website: "https://www.netent.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Playtech",
    companyName: "Playtech PLC",
    contactPerson: "Mor Weizer",
    email: "contact@playtech.com",
    phone: "+44 20 123 4567",
    address: "Salisbury House, London Wall",
    city: "London",
    country: "UK",
    website: "https://www.playtech.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Microgaming",
    companyName: "Microgaming Software Systems Ltd",
    contactPerson: "John Coleman",
    email: "info@microgaming.com",
    phone: "+44 1624 123 456",
    address: "Douglas Bay Complex",
    city: "Douglas",
    country: "Isle of Man",
    website: "https://www.microgaming.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    name: "Evolution",
    companyName: "Evolution Gaming Group AB",
    contactPerson: "Martin Carlesund",
    email: "contact@evolution.com",
    phone: "+46 8 123 4568",
    address: "Hamngatan 11",
    city: "Stockholm",
    country: "Sweden",
    website: "https://www.evolution.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    name: "Pragmatic Play",
    companyName: "Pragmatic Play Ltd",
    contactPerson: "Julian Jarvis",
    email: "info@pragmaticplay.com",
    phone: "+356 2131 1234",
    address: "Portomaso Business Tower",
    city: "St Julian's",
    country: "Malta",
    website: "https://www.pragmaticplay.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockCabinets = [
  {
    id: 1,
    model: "Novomatic Diamond X",
    status: "active",
    providerId: 1,
    webLink: "https://www.novomatic.com/diamond-x",
    technicalInfo: "High-end gaming cabinet with 4K display",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    model: "IGT Game King",
    status: "active",
    providerId: 2,
    webLink: "https://www.igt.com/game-king",
    technicalInfo: "Multi-game cabinet with touch screen",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    model: "Aristocrat Helix",
    status: "maintenance",
    providerId: 3,
    webLink: "https://www.aristocrat.com/helix",
    technicalInfo: "Curved display gaming cabinet",
    createdAt: new Date().toISOString(),
  }
];

const mockGameMixes = [
  {
    id: 1,
    name: "Classic Slots Mix",
    description: "Traditional slot games collection",
    providerId: 1,
    games: "Book of Ra, Lucky Lady's Charm, Sizzling Hot",
    webLink: "https://www.novomatic.com/classic-mix",
    gameCount: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Video Slots Premium",
    description: "Modern video slot games",
    providerId: 2,
    games: "Wheel of Fortune, Cleopatra, Buffalo",
    webLink: "https://www.igt.com/video-premium",
    gameCount: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Progressive Jackpots",
    description: "High-stakes progressive games",
    providerId: 3,
    games: "Mega Moolah, Major Millions, King Cashalot",
    webLink: "https://www.aristocrat.com/progressive",
    gameCount: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockSlots = [
  {
    id: 1,
    exciterType: "Novomatic Diamond X",
    propertyType: "property",
    serialNr: "CB-2024-001",
    denomination: "0.01",
    maxBet: "100",
    rtp: "96.5",
    year: 2024,
    gamingPlaces: 1,
    dailyRevenue: "150.50",
    commissionDate: new Date().toISOString(),
    invoiceId: 1,
    locationId: 1,
    gameMixId: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    exciterType: "IGT Game King",
    propertyType: "property",
    serialNr: "CB-2024-002",
    denomination: "0.02",
    maxBet: "200",
    rtp: "97.2",
    year: 2024,
    gamingPlaces: 1,
    dailyRevenue: "225.75",
    commissionDate: new Date().toISOString(),
    invoiceId: 2,
    locationId: 2,
    gameMixId: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    exciterType: "Aristocrat Helix",
    propertyType: "property",
    serialNr: "CB-2024-003",
    denomination: "0.05",
    maxBet: "500",
    rtp: "95.8",
    year: 2024,
    gamingPlaces: 1,
    dailyRevenue: "350.25",
    commissionDate: new Date().toISOString(),
    invoiceId: 3,
    locationId: 3,
    gameMixId: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    exciterType: "Novomatic Diamond X",
    propertyType: "property",
    serialNr: "CB-2024-004",
    denomination: "0.01",
    maxBet: "100",
    rtp: "96.5",
    year: 2024,
    gamingPlaces: 1,
    dailyRevenue: "180.30",
    commissionDate: new Date().toISOString(),
    invoiceId: 4,
    locationId: 4,
    gameMixId: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    exciterType: "IGT Game King",
    propertyType: "property",
    serialNr: "CB-2024-005",
    denomination: "0.02",
    maxBet: "200",
    rtp: "97.2",
    year: 2024,
    gamingPlaces: 1,
    dailyRevenue: "275.90",
    commissionDate: new Date().toISOString(),
    invoiceId: 5,
    locationId: 5,
    gameMixId: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    exciterType: "Aristocrat Helix",
    propertyType: "property",
    serialNr: "CB-2024-006",
    denomination: "0.05",
    maxBet: "500",
    rtp: "95.8",
    year: 2024,
    gamingPlaces: 1,
    dailyRevenue: "420.75",
    commissionDate: new Date().toISOString(),
    invoiceId: 6,
    locationId: 6,
    gameMixId: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    telephone: "+40 21 123 4567",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: "manager1",
    email: "manager1@royalgaming.ro",
    telephone: "+40 21 123 4568",
    firstName: "Maria",
    lastName: "Popescu",
    role: "manager",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    username: "operator1",
    email: "operator1@diamondclub.ro",
    telephone: "+40 256 123 457",
    firstName: "Ion",
    lastName: "Ionescu",
    role: "operator",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    username: "manager2",
    email: "manager2@goldenpalace.ro",
    telephone: "+40 264 123 457",
    firstName: "Ana",
    lastName: "Munteanu",
    role: "manager",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    username: "operator2",
    email: "operator2@casinoelite.ro",
    telephone: "+40 232 123 457",
    firstName: "Vasile",
    lastName: "Dumitrescu",
    role: "operator",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    username: "manager3",
    email: "manager3@luckystar.ro",
    telephone: "+40 241 123 457",
    firstName: "Elena",
    lastName: "Stoica",
    role: "manager",
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockInvoices = [
  {
    id: 1,
    invoiceNumber: "INV-2024-001",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: "5000.00",
    taxAmount: "950.00",
    totalAmount: "5950.00",
    status: "paid",
    currency: "EUR",
    propertyType: "property",
    amortizationMonths: 12,
    companyId: 1,
    sellerCompanyId: 1,
    createdBy: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-002",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: "7500.00",
    taxAmount: "1425.00",
    totalAmount: "8925.00",
    status: "pending",
    currency: "EUR",
    propertyType: "property",
    amortizationMonths: 12,
    companyId: 2,
    sellerCompanyId: 2,
    createdBy: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-003",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: "3000.00",
    taxAmount: "570.00",
    totalAmount: "3570.00",
    status: "paid",
    currency: "EUR",
    propertyType: "property",
    amortizationMonths: 12,
    companyId: 3,
    sellerCompanyId: 3,
    createdBy: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    invoiceNumber: "INV-2024-004",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: "4500.00",
    taxAmount: "855.00",
    totalAmount: "5355.00",
    status: "overdue",
    currency: "EUR",
    propertyType: "property",
    amortizationMonths: 12,
    companyId: 4,
    sellerCompanyId: 4,
    createdBy: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    invoiceNumber: "INV-2024-005",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: "6000.00",
    taxAmount: "1140.00",
    totalAmount: "7140.00",
    status: "paid",
    currency: "EUR",
    propertyType: "property",
    amortizationMonths: 12,
    companyId: 5,
    sellerCompanyId: 5,
    createdBy: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    invoiceNumber: "INV-2024-006",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: "3500.00",
    taxAmount: "665.00",
    totalAmount: "4165.00",
    status: "pending",
    currency: "EUR",
    propertyType: "property",
    amortizationMonths: 12,
    companyId: 1,
    sellerCompanyId: 1,
    createdBy: 1,
    createdAt: new Date().toISOString(),
  }
];

const mockLegalDocuments = [
  {
    id: 1,
    title: "Gaming License 2024",
    documentType: "license",
    companyId: 1,
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Tax Registration Certificate",
    documentType: "certificate",
    companyId: 2,
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date().toISOString(),
  }
];

const mockOnjnReports = [
  {
    id: 1,
    type: "license_commission",
    commissionType: "license_commission",
    serialNumbers: "CB-2024-001\nCB-2024-002\nCB-2024-003",
    status: "submitted",
    notes: "Monthly commission report for Q1 2024",
    createdAt: new Date().toISOString(),
  }
];

const mockRentAgreements = [
  {
    id: 1,
    agreementNumber: "RENT-2024-001",
    companyId: 1,
    locationId: 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    monthlyRent: "5000.00",
    securityDeposit: "10000.00",
    status: "active",
    terms: "Standard gaming location rental agreement",
    createdAt: new Date().toISOString(),
  }
];

// Funcție pentru paginare
function paginateData(data: any[], page: number, limit: number, search?: string) {
  let filteredData = data;
  
  if (search) {
    filteredData = data.filter(item => 
      Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: filteredData.length,
    page,
    limit,
    totalPages: Math.ceil(filteredData.length / limit)
  };
}

// Mock API responses cu paginare
const mockApiResponses: Record<string, any> = {
  "/api/auth/user": () => mockAuthState.isAuthenticated ? mockAuthState.currentUser : null,
  "/api/auth/login": () => ({ success: true, user: mockAuthState.currentUser }),
  "/api/auth/logout": () => ({ success: true }),
  "/api/users": { users: mockUsers, total: mockUsers.length },
  "/api/companies": { companies: mockCompanies, total: mockCompanies.length },
  "/api/locations": { locations: mockLocations, total: mockLocations.length },
  "/api/cabinets": { cabinets: mockCabinets, total: mockCabinets.length },
  "/api/slots": { slots: mockSlots, total: mockSlots.length },
  "/api/providers": { providers: mockProviders, total: mockProviders.length },
  "/api/game-mixes": { gameMixes: mockGameMixes, total: mockGameMixes.length },
  "/api/legal-documents": { legalDocuments: mockLegalDocuments, total: mockLegalDocuments.length },
  "/api/invoices": { invoices: mockInvoices, total: mockInvoices.length },
  "/api/onjn-reports": { onjnReports: mockOnjnReports, total: mockOnjnReports.length },
  "/api/rent-agreements": { rentAgreements: mockRentAgreements, total: mockRentAgreements.length },
  "/api/attachments": [],
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Parse URL pentru a extrage query parameters
  const urlObj = new URL(url, 'http://localhost');
  const page = parseInt(urlObj.searchParams.get('page') || '1');
  const limit = parseInt(urlObj.searchParams.get('limit') || '10');
  const search = urlObj.searchParams.get('search') || '';
  
  // Găsește cheia de bază pentru mock data
  const baseKey = urlObj.pathname;
  
  // Handle authentication endpoints
  if (baseKey === "/api/auth/login" && method === "POST") {
    const { username, password } = data as { username: string; password: string };
    const user = mockAuthUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      mockAuthState.isAuthenticated = true;
      mockAuthState.currentUser = userWithoutPassword;
      mockAuthState.sessionToken = `mock-token-${Date.now()}`;
      
      // Save authentication state to localStorage
      saveAuthState();
      
      return new Response(JSON.stringify({ 
        success: true, 
        user: userWithoutPassword,
        token: mockAuthState.sessionToken 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Invalid credentials" 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
  if (baseKey === "/api/auth/logout" && method === "POST") {
    mockAuthState.isAuthenticated = false;
    mockAuthState.currentUser = null;
    mockAuthState.sessionToken = null;
    
    // Clear authentication state from localStorage
    clearAuthState();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  if (baseKey === "/api/auth/user" && method === "GET") {
    if (mockAuthState.isAuthenticated && mockAuthState.currentUser) {
      return new Response(JSON.stringify(mockAuthState.currentUser), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify(null), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  
  if (mockApiResponses[baseKey]) {
    let responseData = mockApiResponses[baseKey];
    
    // Handle function responses
    if (typeof responseData === 'function') {
      responseData = responseData();
    }
    
    // Aplică paginarea dacă este necesar
    if (responseData && (responseData.data || Array.isArray(responseData))) {
      const dataArray = responseData.data || responseData;
      responseData = paginateData(dataArray, page, limit, search);
    }
    
    const mockResponse = new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    return mockResponse;
  }

  // Fallback pentru request-uri necunoscute
  const mockResponse = new Response(JSON.stringify({ success: true, data: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  return mockResponse;
}

type UnauthorizedBehavior = "returnNull" | "throw";
type QueryFnType<T> = (context: { queryKey: readonly unknown[] }) => Promise<T | null>;

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFnType<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Pentru deploy frontend-only, returnăm mock data
    if (mockApiResponses[url]) {
      return mockApiResponses[url];
    }

    // Fallback pentru query-uri necunoscute
    return [];
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
