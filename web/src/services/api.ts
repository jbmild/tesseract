import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and client context to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add selected client ID to headers for multi-tenant context
    // Only add header if a client is selected (not empty/null)
    const selectedClientId = localStorage.getItem('selected_client');
    if (selectedClientId && selectedClientId.trim() !== '') {
      config.headers['X-Client-Id'] = selectedClientId;
    } else {
      // Explicitly remove the header if no client is selected
      delete config.headers['X-Client-Id'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized) - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  username: string;
  clients?: Client[];
  roleId: number | null;
  role?: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  clientId?: number | null;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  description: string | null;
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  name: string;
  users?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  name: string;
  clientId: number;
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  clientIds?: number[];
  roleId?: number | null;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  clientIds?: number[];
  roleId?: number | null;
}

export interface CreateRoleDto {
  name: string;
  description?: string | null;
  clientId?: number | null;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string | null;
  clientId?: number | null;
}

export interface CreatePermissionDto {
  name: string;
  resource: string;
  description?: string | null;
}

export interface UpdatePermissionDto {
  name?: string;
  resource?: string;
  description?: string | null;
}

// Users API
export const usersApi = {
  getAll: () => api.get<{ success: boolean; data: User[] }>('/api/users'),
  getById: (id: number) => api.get<{ success: boolean; data: User }>(`/api/users/${id}`),
  create: (data: CreateUserDto) => api.post<{ success: boolean; data: User }>('/api/users', data),
  update: (id: number, data: UpdateUserDto) => api.put<{ success: boolean; data: User }>(`/api/users/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/api/users/${id}`),
};

// Roles API
export const rolesApi = {
  getAll: () => api.get<{ success: boolean; data: Role[] }>('/api/roles'),
  getById: (id: number) => api.get<{ success: boolean; data: Role }>(`/api/roles/${id}`),
  create: (data: CreateRoleDto) => api.post<{ success: boolean; data: Role }>('/api/roles', data),
  update: (id: number, data: UpdateRoleDto) => api.put<{ success: boolean; data: Role }>(`/api/roles/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/api/roles/${id}`),
  assignPermissions: (id: number, permissionIds: number[]) =>
    api.post<{ success: boolean; data: Role }>(`/api/roles/${id}/permissions`, { permissionIds }),
};

// Permissions API
export const permissionsApi = {
  getAll: (resource?: string) => {
    const params = resource ? { resource } : {};
    return api.get<{ success: boolean; data: Permission[] }>('/api/permissions', { params });
  },
  getById: (id: number) => api.get<{ success: boolean; data: Permission }>(`/api/permissions/${id}`),
  sync: () => api.post<{ success: boolean; data: Permission[]; message: string }>('/api/permissions/sync'),
  // Note: create, update, delete are disabled - permissions are auto-generated from routes
  create: (data: CreatePermissionDto) => api.post<{ success: boolean; data: Permission }>('/api/permissions', data),
  update: (id: number, data: UpdatePermissionDto) => api.put<{ success: boolean; data: Permission }>(`/api/permissions/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/api/permissions/${id}`),
};

// Clients API
export const clientsApi = {
  getAll: () => api.get<{ success: boolean; data: Client[] }>('/api/clients'),
  getById: (id: number) => api.get<{ success: boolean; data: Client }>(`/api/clients/${id}`),
  create: (data: { name: string }) => api.post<{ success: boolean; data: Client }>('/api/clients', data),
  update: (id: number, data: { name: string }) => api.put<{ success: boolean; data: Client }>(`/api/clients/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/api/clients/${id}`),
};

// Locations API
export const locationsApi = {
  getAll: () => api.get<{ success: boolean; data: Location[] }>('/api/locations'),
  getById: (id: number) => api.get<{ success: boolean; data: Location }>(`/api/locations/${id}`),
  create: (data: { name: string }) => api.post<{ success: boolean; data: Location }>('/api/locations', data),
  update: (id: number, data: { name: string }) => api.put<{ success: boolean; data: Location }>(`/api/locations/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/api/locations/${id}`),
};

// Health API
export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    // Health endpoint doesn't require authentication, so use a direct axios call
    const response = await axios.get<HealthResponse>(`${API_BASE_URL}/api/health`);
    return response.data;
  },
};

// Auth API
export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<{ success: boolean; data: LoginResponse }>('/api/auth/login', {
      username,
      password,
    });
    return response.data.data;
  },
  logout: () => api.post<{ success: boolean; message: string }>('/api/auth/logout'),
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>('/api/auth/me');
    return response.data.data;
  },
};
