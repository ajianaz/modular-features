import { User } from '../../domain/entities/User';
import { CreateUserResponse } from '../dtos/output/CreateUserResponse';

export class UserMapper {
  static toCreateUserResponse(user: User): CreateUserResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      success: true,
      message: 'User created successfully'
    };
  }
}