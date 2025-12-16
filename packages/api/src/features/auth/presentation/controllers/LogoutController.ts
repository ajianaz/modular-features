import { Context } from 'hono';
import { LogoutUseCase } from '../../application/usecases/LogoutUseCase';
import { LogoutRequest } from '../../application/dtos/input/LogoutRequest';
import { LogoutResponse } from '../../application/dtos/output/LogoutResponse';
import { SessionRepository } from '../../infrastructure/repositories/SessionRepository';
import { ValidationError } from '@modular-monolith/shared';

export class LogoutController {
  private logoutUseCase: LogoutUseCase;

  constructor(logoutUseCase: LogoutUseCase) {
    this.logoutUseCase = logoutUseCase;
  }

  async handle(c: Context): Promise<Response> {
    try {
      const body = await c.req.json() as LogoutRequest;

      // Basic validation
      if (!body.refreshToken) {
        return c.json({ error: 'Refresh token is required' }, 400);
      }

      const result = await this.logoutUseCase.execute(body);

      return c.json(result, 200);
    } catch (error) {
      console.error('Logout error:', error);

      if (error instanceof ValidationError) {
        return c.json({ error: error.message }, 400);
      }

      return c.json({ error: 'Logout failed' }, 500);
    }
  }
}