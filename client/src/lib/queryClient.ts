import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Mock data pentru deploy frontend-only
const mockUser = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  created_at: new Date().toISOString(),
};

const mockApiResponses: Record<string, any> = {
  "/api/auth/user": mockUser,
  "/api/auth/login": { success: true, user: mockUser },
  "/api/auth/logout": { success: true },
  "/api/users": [mockUser],
  "/api/companies": [],
  "/api/locations": [],
  "/api/cabinets": [],
  "/api/slots": [],
  "/api/providers": [],
  "/api/game-mixes": [],
  "/api/legal-documents": [],
  "/api/invoices": [],
  "/api/onjn-reports": [],
  "/api/rent-agreements": [],
  "/api/attachments": [],
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Pentru deploy frontend-only, returnăm mock data
  if (mockApiResponses[url]) {
    const mockResponse = new Response(JSON.stringify(mockApiResponses[url]), {
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
