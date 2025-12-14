import { Context } from 'hono';
import { RefreshTokenUseCase } from '../../application/usecases/RefreshTokenUseCase';
import { RefreshTokenRequest } from '../../application/dtos/input/RefreshTokenRequest';
import { RefreshTokenResponse } from '../../application/dtos/output/RefreshTokenResponse';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { SessionRepository } from '../../infrastructure/repositories/SessionRepository';
import { JWTTokenGenerator } from '../../infrastructure/lib/JWTTokenGenerator';
import { ValidationError } from '@repo/shared';

export class RefreshTokenController {
  private refreshTokenUseCase: RefreshTokenUseCase;

  constructor(refreshTokenUseCase: RefreshTokenUseCase) {
    this.refreshTokenUseCase = refreshTokenUseCase;
  }

  async handle(c: Context): Promise<Response> {
    try {
      const body = await c.req.json() as RefreshTokenRequest;

      // Basic validation
      if (!body.refreshToken) {
        return c.json({ error: 'Refresh token is required' }, 400);
      }

      const result = await this.refreshTokenUseCase.execute(body);

      return c.json(result, 200);
    } catch (error) {
      console.error('Refresh token error:', error);

      if (error instanceof ValidationError) {
        return c.json({ error: error.message }, 400);
      }

      return c.json({ error: 'Token refresh failed' }, 401);
    }
  }
}