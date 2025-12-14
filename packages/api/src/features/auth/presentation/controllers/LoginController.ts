import { Context } from 'hono';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { LoginRequest } from '../../application/dtos/input/LoginRequest';
import { LoginResponse } from '../../application/dtos/output/LoginResponse';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { SessionRepository } from '../../infrastructure/repositories/SessionRepository';
import { BcryptHashProvider } from '../../infrastructure/lib/BcryptHashProvider';
import { JWTTokenGenerator } from '../../infrastructure/lib/JWTTokenGenerator';
import { ValidationError } from '@repo/shared';

export class LoginController {
  private loginUseCase: LoginUseCase;

  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private hashProvider: BcryptHashProvider,
    private tokenGenerator: JWTTokenGenerator
  ) {
    this.loginUseCase = new LoginUseCase(
      userRepository,
      sessionRepository,
      hashProvider,
      tokenGenerator
    );
  }

  async handle(c: Context): Promise<Response> {
    try {
      const body = await c.req.json() as LoginRequest;

      // Basic validation
      if (!body.email || !body.password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const result = await this.loginUseCase.execute(body);

      return c.json(result, 200);
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof ValidationError) {
        return c.json({ error: error.message }, 400);
      }

      return c.json({ error: 'Invalid credentials' }, 401);
    }
  }
}