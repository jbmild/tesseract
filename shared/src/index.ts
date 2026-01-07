// Shared types and utilities
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  ORDERS: '/api/orders',
  PRODUCTS: '/api/products',
  HEALTH: '/api/health',
} as const;

// Utility functions
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
