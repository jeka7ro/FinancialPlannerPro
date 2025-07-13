import { QueryClient } from "@tanstack/react-query";

// Get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Get backend URL from environment or fallback
const getBackendUrl = () => {
  if (import.meta.env.DEV) {
    return '';
  }
  // Use environment variable if available, otherwise fallback to Render backend
  return import.meta.env.VITE_API_URL || 'https://cashpot-backend.onrender.com';
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Always use the backend URL for all API requests
  const baseUrl = getBackendUrl();
  const fullUrl = `${baseUrl}${url}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add JWT token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(data);
  }

  console.log(`Making ${method} request to: ${fullUrl}`, { data, requestOptions });

  try {
    const response = await fetch(fullUrl, requestOptions);
    console.log(`Response status: ${response.status} for ${fullUrl}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
type QueryFnType<T> = (context: { queryKey: readonly unknown[] }) => Promise<T | null>;

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFnType<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    try {
      const response = await apiRequest('GET', url);
      
      if (response.status === 401) {
        if (unauthorizedBehavior === "throw") {
          throw new Error("Unauthorized");
        }
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

      return await response.json();
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
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
