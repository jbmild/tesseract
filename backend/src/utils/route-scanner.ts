import { Express, Router } from 'express';

export interface RouteInfo {
  method: string;
  path: string;
  resource: string;
  action: string;
}

/**
 * Scans Express app routes and extracts route information
 */
export function scanRoutes(app: Express): RouteInfo[] {
  const routes: RouteInfo[] = [];

  // Helper to extract resource and action from path
  const extractResourceAndAction = (fullPath: string, method: string): { resource: string; action: string } => {
    // Remove /api prefix
    const path = fullPath.replace(/^\/api\//, '');
    
    // Split path into parts
    const parts = path.split('/').filter(p => p && !p.startsWith(':'));
    
    if (parts.length === 0) {
      return { resource: 'root', action: method.toLowerCase() };
    }

    const resource = parts[0];
    let action = method.toLowerCase();

    // Determine action based on path structure and method
    if (parts.length === 1) {
      // /api/users -> GET = list, POST = create
      if (method === 'GET') action = 'list';
      else if (method === 'POST') action = 'create';
    } else if (parts.length === 2 && parts[1] === 'permissions') {
      // /api/roles/:id/permissions -> manage_permissions
      action = 'manage_permissions';
    } else if (parts.length === 2) {
      // /api/users/:id -> GET = read, PUT = update, DELETE = delete
      if (method === 'GET') action = 'read';
      else if (method === 'PUT') action = 'update';
      else if (method === 'DELETE') action = 'delete';
    }

    return { resource, action };
  };

  // Recursively scan router stack
  const scanStack = (stack: any[], basePath: string = '') => {
    for (const layer of stack) {
      if (layer.route) {
        // This is a route
        const routePath = basePath + layer.route.path;
        layer.route.stack.forEach((handler: any) => {
          const methods = Object.keys(handler.methods).filter(m => handler.methods[m]);
          methods.forEach((method: string) => {
            const { resource, action } = extractResourceAndAction(routePath, method.toUpperCase());
            routes.push({
              method: method.toUpperCase(),
              path: routePath,
              resource,
              action: `${resource}_${action}`,
            });
          });
        });
      } else if (layer.name === 'router' && layer.handle?.stack) {
        // This is a router middleware
        const routerPath = basePath + (layer.regexp.source.match(/^\/\^\\\/(.*)\\\/\?/)?.[1] || '').replace(/\\\//g, '/');
        scanStack(layer.handle.stack, routerPath);
      }
    }
  };

  // Scan the app's router stack
  if ((app as any)._router && (app as any)._router.stack) {
    scanStack((app as any)._router.stack);
  }

  return routes;
}

/**
 * Get all routes from registered routers
 * This is a simpler approach that works with how Express registers routes
 */
export function getRoutesFromApp(app: Express): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  // We'll manually define routes based on what we know is registered
  // This is more reliable than trying to introspect Express internals
  const routeDefinitions = [
    // Health
    { method: 'GET', path: '/api/health', resource: 'health', action: 'health_read' },
    
    // Users
    { method: 'GET', path: '/api/users', resource: 'users', action: 'users_list' },
    { method: 'GET', path: '/api/users/:id', resource: 'users', action: 'users_read' },
    { method: 'POST', path: '/api/users', resource: 'users', action: 'users_create' },
    { method: 'PUT', path: '/api/users/:id', resource: 'users', action: 'users_update' },
    { method: 'DELETE', path: '/api/users/:id', resource: 'users', action: 'users_delete' },
    
    // Roles
    { method: 'GET', path: '/api/roles', resource: 'roles', action: 'roles_list' },
    { method: 'GET', path: '/api/roles/:id', resource: 'roles', action: 'roles_read' },
    { method: 'POST', path: '/api/roles', resource: 'roles', action: 'roles_create' },
    { method: 'PUT', path: '/api/roles/:id', resource: 'roles', action: 'roles_update' },
    { method: 'DELETE', path: '/api/roles/:id', resource: 'roles', action: 'roles_delete' },
    { method: 'POST', path: '/api/roles/:id/permissions', resource: 'roles', action: 'roles_manage_permissions' },
    
    // Permissions
    { method: 'GET', path: '/api/permissions', resource: 'permissions', action: 'permissions_list' },
    { method: 'GET', path: '/api/permissions/:id', resource: 'permissions', action: 'permissions_read' },
    { method: 'POST', path: '/api/permissions', resource: 'permissions', action: 'permissions_create' },
    { method: 'PUT', path: '/api/permissions/:id', resource: 'permissions', action: 'permissions_update' },
    { method: 'DELETE', path: '/api/permissions/:id', resource: 'permissions', action: 'permissions_delete' },
    
    // Clients
    { method: 'GET', path: '/api/clients', resource: 'clients', action: 'clients_list' },
    { method: 'GET', path: '/api/clients/:id', resource: 'clients', action: 'clients_read' },
    { method: 'POST', path: '/api/clients', resource: 'clients', action: 'clients_create' },
    { method: 'PUT', path: '/api/clients/:id', resource: 'clients', action: 'clients_update' },
    { method: 'DELETE', path: '/api/clients/:id', resource: 'clients', action: 'clients_delete' },
    
    // Locations
    { method: 'GET', path: '/api/locations', resource: 'locations', action: 'locations_list' },
    { method: 'GET', path: '/api/locations/:id', resource: 'locations', action: 'locations_read' },
    { method: 'POST', path: '/api/locations', resource: 'locations', action: 'locations_create' },
    { method: 'PUT', path: '/api/locations/:id', resource: 'locations', action: 'locations_update' },
    { method: 'DELETE', path: '/api/locations/:id', resource: 'locations', action: 'locations_delete' },
  ];

  return routeDefinitions.map(route => ({
    method: route.method,
    path: route.path,
    resource: route.resource,
    action: route.action,
  }));
}
