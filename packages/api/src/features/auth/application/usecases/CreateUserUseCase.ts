import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface CreateUserResponse {
  user: Omit<User, 'passwordHash' | 'updateEmail' | 'updatePassword' | 'toJSON'>;
  success: boolean;
  message?: string;
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { email, name, password } = request;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password (in a real implementation, you would use a proper hashing library)
    const passwordHash = await this.hashPassword(password);

    // Create new user
    const newUser = User.create(email, name, passwordHash);

    // Save user to repository
    const savedUser = await this.userRepository.create(newUser);

    // Return user without sensitive data
    const { passwordHash: _, ...userResponse } = savedUser as any;

    return {
      user: userResponse,
      success: true,
      message: 'User created successfully'
    };
  }

  private async hashPassword(password: string): Promise<string> {
    // This is a placeholder implementation
    // In a real application, you would use bcrypt or a similar library
    return `hashed_${password}`;
  }
}