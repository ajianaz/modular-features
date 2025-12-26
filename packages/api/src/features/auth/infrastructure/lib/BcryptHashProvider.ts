import * as bcrypt from 'bcrypt';
import { IHashProvider } from '../../domain/interfaces/IHashProvider';

export class BcryptHashProvider implements IHashProvider {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Failed to hash password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      return isValid;
    } catch (error) {
      throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  needsRehash(hash: string): boolean {
    try {
      return bcrypt.getRounds(hash) < this.saltRounds;
    } catch (error) {
      // If we can't determine rounds, assume rehash is needed
      return true;
    }
  }

  getAlgorithmInfo(): {
    name: string;
    version: string;
    rounds?: number;
  } {
    return {
      name: 'bcrypt',
      version: '2b',
      rounds: this.saltRounds
    };
  }

  // Helper method to generate random salt (useful for testing)
  async generateSalt(): Promise<string> {
    try {
      return await bcrypt.genSalt(this.saltRounds);
    } catch (error) {
      throw new Error(`Failed to generate salt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get current salt rounds
  getSaltRounds(): number {
    return this.saltRounds;
  }
}