import { RegisterRequest } from '../dtos/input/RegisterRequest';
import { RegisterResponse } from '../dtos/output/RegisterResponse';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IHashProvider } from '../../domain/interfaces/IHashProvider';
import { User as UserEntity } from '../../domain/entities/User.entity';
import { UserAlreadyExistsError } from '../../domain/errors/UserNotFoundError';

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashProvider: IHashProvider
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, name, password, confirmPassword, username } = request;

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if user already exists by email
    const existingUserByEmail = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (existingUserByEmail) {
      throw new UserAlreadyExistsError(email);
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUserByUsername = await this.userRepository.findByUsername(username.trim());
      if (existingUserByUsername) {
        throw new Error('Username is already taken');
      }
    }

    // Hash password
    const passwordHash = await this.hashProvider.hash(password);

    // Create new user
    const newUser = UserEntity.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      username: username?.trim(),
      role: 'user', // Default role for new registrations
      emailVerified: false // Require email verification
    });

    // Save user to repository
    const savedUser = await this.userRepository.create(newUser);

    return {
      user: savedUser.toJSON(),
      message: 'User registered successfully. Please check your email for verification.',
      requiresEmailVerification: true
    };
  }
}