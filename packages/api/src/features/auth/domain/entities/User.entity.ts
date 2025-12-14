import { z } from 'zod';

// User entity with business logic
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Factory method to create a new user
  static create(data: {
    email: string;
    name: string;
  }): User {
    const id = crypto.randomUUID();
    const now = new Date();

    return new User(
      id,
      data.email.toLowerCase().trim(),
      data.name.trim(),
      now,
      now
    );
  }

  // Business logic methods
  updateName(newName: string): User {
    return new User(
      this.id,
      this.email,
      newName.trim(),
      this.createdAt,
      new Date()
    );
  }

  // Validation schema
  static schema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1).max(100),
    createdAt: z.date(),
    updatedAt: z.date()
  });
}