import { Context } from 'hono';
import { CreateUserUseCase, CreateUserRequest, CreateUserResponse } from '../../application';
import { UserRepository } from '../../infrastructure';
import { UserMapper } from '../../application/mappers/UserMapper';

export class CreateUserController {
  private createUserUseCase: CreateUserUseCase;

  constructor(private c: Context) {
    this.createUserUseCase = new CreateUserUseCase(new UserRepository());
  }

  async handle(c: Context): Promise<Response> {
    try {
      const body = await c.req.json() as CreateUserRequest;

      // Validate input (basic validation, in a real app you'd use a validation library)
      if (!body.email || !body.name || !body.password) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const result = await this.createUserUseCase.execute(body);

      if (!result.success) {
        return c.json({ error: result.message }, 400);
      }

      return c.json(result, 201);
    } catch (error) {
      console.error('Error creating user:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}