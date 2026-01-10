import jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: number;
  username: string;
  roleId: number | null;
}

export class AuthService {
  private usersService: UsersService;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.usersService = new UsersService();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async login(credentials: LoginCredentials): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const { username, password } = credentials;

    // Find user by username
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isPasswordValid = await this.usersService.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Generate JWT token
    const payload: AuthTokenPayload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    // Exclude password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyToken(token: string): Promise<AuthTokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async getCurrentUser(userId: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      return null;
    }

    // Exclude password from user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
