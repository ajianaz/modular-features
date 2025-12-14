import { LogoutRequest } from '../../application/dtos/input/LogoutRequest';
import { LogoutResponse } from '../../application/dtos/output/LogoutResponse';
import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { SessionNotFoundError } from '../../domain/errors/AuthenticationError';

export class LogoutUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(request: LogoutRequest): Promise<LogoutResponse> {
    try {
      // Find the session by refresh token
      const session = await this.sessionRepository.findByRefreshToken(request.refreshToken);

      if (!session) {
        throw new SessionNotFoundError('Session not found');
      }

      // Check if session is already inactive
      if (!session.isActive) {
        return LogoutResponse.success('Session already logged out');
      }

      // Deactivate the session
      const deactivatedSession = session.deactivate();
      await this.sessionRepository.update(deactivatedSession);

      return LogoutResponse.success('Successfully logged out');
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        throw error;
      }

      // Log the error for debugging
      console.error('Logout error:', error);

      throw new Error('Failed to logout. Please try again.');
    }
  }
}