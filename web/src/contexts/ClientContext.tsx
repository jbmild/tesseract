import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { clientsApi, Client } from '../services/api';

// Listen for logout events to clear client selection
window.addEventListener('storage', (e) => {
  if (e.key === 'auth_token' && !e.newValue) {
    localStorage.removeItem('selected_client');
  }
});

interface ClientContextType {
  selectedClient: Client | null;
  availableClients: Client[];
  setSelectedClient: (client: Client | null) => void;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const SELECTED_CLIENT_KEY = 'selected_client';

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load available clients and selected client
  useEffect(() => {
    const loadClients = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        let clients: Client[] = [];

        // If user has clients assigned, use those
        if (user.clients && user.clients.length > 0) {
          clients = user.clients;
        } else {
          // Otherwise, fetch all clients
          const response = await clientsApi.getAll();
          clients = response.data.data;
        }

        setAvailableClients(clients);

        // Load selected client from localStorage or default to first client
        const storedClientId = localStorage.getItem(SELECTED_CLIENT_KEY);
        if (storedClientId) {
          const client = clients.find(c => c.id === parseInt(storedClientId));
          if (client) {
            setSelectedClientState(client);
          } else if (clients.length > 0) {
            // If stored client not found, select first available
            setSelectedClientState(clients[0]);
            localStorage.setItem(SELECTED_CLIENT_KEY, clients[0].id.toString());
          }
        } else if (clients.length > 0) {
          // No stored selection, select first client
          setSelectedClientState(clients[0]);
          localStorage.setItem(SELECTED_CLIENT_KEY, clients[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [user]);

  const setSelectedClient = (client: Client | null) => {
    setSelectedClientState(client);
    if (client) {
      localStorage.setItem(SELECTED_CLIENT_KEY, client.id.toString());
    } else {
      localStorage.removeItem(SELECTED_CLIENT_KEY);
    }
  };

  const value: ClientContextType = {
    selectedClient,
    availableClients,
    setSelectedClient,
    isLoading,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
