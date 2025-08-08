import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { UserProfile } from '../types/auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: UserProfile = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    validateToken: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockResponse = {
        user: mockUser,
        message: 'User registered successfully',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto, {} as any);

      expect(result).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: mockUser,
        message: 'Login successful',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto, {} as any);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const mockRequest = {
        headers: {
          cookie: 'auth-token=test-token',
        },
      };

      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await controller.logout(mockRequest as any, {} as any);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockResponse = {
        user: mockUser,
        message: 'Current user retrieved successfully',
      };

      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyAuth', () => {
    it('should verify authentication status', async () => {
      const mockRequest = {
        headers: {
          cookie: 'auth-token=test-token',
        },
      };

      mockAuthService.validateToken.mockResolvedValue(mockUser);

      const result = await controller.verifyAuth(mockRequest as any);

      expect(result).toEqual({
        isAuthenticated: true,
        user: mockUser,
      });
    });

    it('should return false for invalid token', async () => {
      const mockRequest = {
        headers: {},
      };

      mockAuthService.validateToken.mockResolvedValue(null);

      const result = await controller.verifyAuth(mockRequest as any);

      expect(result).toEqual({
        isAuthenticated: false,
      });
    });
  });
});
