import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  username: string;
  clientId: number | null;
  client?: Client | null;
  roleId: number | null;
  role?: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
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

export interface CreateUserDto {
  username: string;
  password: string;
  clientId?: number | null;
  roleId?: number | null;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  clientId?: number | null;
  roleId?: number | null;
}

export interface CreateRoleDto {
  name: string;
  description?: string | null;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string | null;
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
