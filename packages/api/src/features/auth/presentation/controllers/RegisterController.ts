import { Context } from 'hono';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { RegisterRequest } from '../../application/dtos/input/RegisterRequest';
import { RegisterResponse } from '../../application/dtos/output/RegisterResponse';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { BcryptHashProvider } from '../../infrastructure/lib/BcryptHashProvider';
import { ValidationError } from '@repo/shared';

export class RegisterController {
  private registerUseCase: RegisterUseCase;

  constructor(
    private userRepository: UserRepository,
    private hashProvider: BcryptHashProvider
  ) {
    this.registerUseCase = new RegisterUseCase(
      userRepository,
      hashProvider
    );
  }

  async handle(c: Context): Promise<Response> {
    try {
      const body = await c.req.json() as RegisterRequest;

      // Basic validation
      if (!body.email || !body.name || !body.password || !body.confirmPassword) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const result = await this.registerUseCase.execute(body);

      return c.json(result, 201);
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof ValidationError) {
        return c.json({ error: error.message }, 400);
      }

      return c.json({ error: 'Registration failed' }, 500);
    }
  }
}