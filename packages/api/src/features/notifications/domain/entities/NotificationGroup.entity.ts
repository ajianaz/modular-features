import { z } from 'zod';

export class NotificationGroup {
  constructor(
    public readonly id: string,
    public name: string,
    public description?: string,
    public metadata: Record<string, any> = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Factory method
  static create(data: {
    name: string;
    description?: string;
    metadata?: Record<string, any>;
  }): NotificationGroup {
    const id = crypto.randomUUID();
    const now = new Date();

    return new NotificationGroup(
      id,
      data.name,
      data.description,
      data.metadata || {},
      now,
      now
    );
  }

  // Business logic methods
  updateName(newName: string): NotificationGroup {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationGroup(
      this.id,
      newName.trim(),
      this.description,
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateDescription(newDescription?: string): NotificationGroup {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationGroup(
      this.id,
      this.name,
      newDescription?.trim(),
      this.metadata,
      this.createdAt,
      now
    );
  }

  updateMetadata(newMetadata: Record<string, any>): NotificationGroup {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationGroup(
      this.id,
      this.name,
      this.description,
      { ...this.metadata, ...newMetadata },
      this.createdAt,
      now
    );
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = NotificationGroup.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  // Safe serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}