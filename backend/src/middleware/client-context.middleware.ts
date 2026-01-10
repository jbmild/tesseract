import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export interface ClientContextRequest extends AuthenticatedRequest {
  clientId?: number | null;
}

/**
 * Middleware to extract client context from headers
 * Sets req.clientId for use in services to filter data by client
 */
export const clientContextMiddleware = (
  req: ClientContextRequest,
  res: Response,
  next: NextFunction
): void => {
  const clientIdHeader = req.headers['x-client-id'];
  
  if (clientIdHeader) {
    const clientId = parseInt(clientIdHeader as string, 10);
    if (!isNaN(clientId)) {
      req.clientId = clientId;
    } else {
      req.clientId = null;
    }
  } else {
    req.clientId = null;
  }
  
  next();
};
