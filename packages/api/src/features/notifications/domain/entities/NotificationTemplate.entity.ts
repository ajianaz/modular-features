import { z } from 'zod';
import {
  NotificationType,
  NotificationChannel,
  CreateNotificationTemplateData
} from '../types';

export class NotificationTemplate {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public type: NotificationType,
    public channel: NotificationChannel,
    public template: string,
    public description?: string,
    public variables: Record<string, any> = {},
    public defaultValues: Record<string, any> = {},
    public isSystem: boolean = false,
    public isActive: boolean = true,
    public metadata: Record<string, any> = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public subject?: string
  ) {}

  // Factory method
  static create(data: CreateNotificationTemplateData): NotificationTemplate {
    const id = crypto.randomUUID();
    const now = new Date();

    return new NotificationTemplate(
      id,
      data.name,
      data.slug,
      data.type,
      data.channel,
      data.template,
      data.description,
      data.variables || {},
      data.defaultValues || {},
      data.isSystem || false,
      true, // isActive by default
      data.metadata || {},
      now,
      now,
      data.subject
    );
  }

  // Business logic methods
  render(variables: Record<string, any>): string {
    // Template rendering logic
    let rendered = this.template;

    // Replace variables in template
    Object.entries({ ...this.defaultValues, ...variables }).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }

  renderSubject(variables: Record<string, any>): string | undefined {
    if (!this.subject) {
      return undefined;
    }

    let rendered = this.subject;

    // Replace variables in subject
    Object.entries({ ...this.defaultValues, ...variables }).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }

  updateName(newName: string): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      newName.trim(),
      this.slug,
      this.type,
      this.channel,
      this.template,
      this.description,
      this.variables,
      this.defaultValues,
      this.isSystem,
      this.isActive,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  updateSubject(newSubject?: string): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      this.template,
      this.description,
      this.variables,
      this.defaultValues,
      this.isSystem,
      this.isActive,
      this.metadata,
      this.createdAt,
      now,
      newSubject?.trim()
    );
  }

  updateTemplate(newTemplate: string): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      newTemplate.trim(),
      this.description,
      this.variables,
      this.defaultValues,
      this.isSystem,
      this.isActive,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  updateDescription(newDescription?: string): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      this.template,
      newDescription?.trim(),
      this.variables,
      this.defaultValues,
      this.isSystem,
      this.isActive,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  updateVariables(newVariables: Record<string, any>): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      this.template,
      this.description,
      newVariables,
      this.defaultValues,
      this.isSystem,
      this.isActive,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  updateDefaultValues(newDefaultValues: Record<string, any>): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      this.template,
      this.description,
      this.variables,
      newDefaultValues,
      this.isSystem,
      this.isActive,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  activate(): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      this.template,
      this.description,
      this.variables,
      this.defaultValues,
      this.isSystem,
      true,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  deactivate(): NotificationTemplate {
    const now = new Date();
    // Ensure updatedAt is different from original
    if (now.getTime() === this.updatedAt.getTime()) {
      now.setTime(now.getTime() + 1);
    }

    return new NotificationTemplate(
      this.id,
      this.name,
      this.slug,
      this.type,
      this.channel,
      this.template,
      this.description,
      this.variables,
      this.defaultValues,
      this.isSystem,
      false,
      this.metadata,
      this.createdAt,
      now,
      this.subject
    );
  }

  // Helper methods
  isActiveTemplate(): boolean {
    return this.isActive;
  }

  isSystemTemplate(): boolean {
    return this.isSystem;
  }

  supportsChannel(channel: NotificationChannel): boolean {
    return this.channel === channel;
  }

  supportsType(type: NotificationType): boolean {
    return this.type === type;
  }

  // Validation
  static schema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    type: z.nativeEnum(NotificationType),
    channel: z.nativeEnum(NotificationChannel),
    subject: z.string().max(255).optional(),
    template: z.string().min(1).max(5000),
    description: z.string().max(1000).optional(),
    variables: z.record(z.string(), z.any()).optional(),
    defaultValues: z.record(z.string(), z.any()).optional(),
    isSystem: z.boolean(),
    isActive: z.boolean(),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  // Create validation schema
  static createSchema = z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    type: z.nativeEnum(NotificationType),
    channel: z.nativeEnum(NotificationChannel),
    subject: z.string().max(255).optional(),
    template: z.string().min(1).max(5000),
    description: z.string().max(1000).optional(),
    variables: z.record(z.string(), z.any()).optional(),
    defaultValues: z.record(z.string(), z.any()).optional(),
    isSystem: z.boolean().optional(),
    metadata: z.record(z.string(), z.any()).optional()
  });

  validate(): { isValid: boolean; errors: string[] } {
    const result = NotificationTemplate.schema.safeParse(this);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    return {
      isValid: false,
      errors: result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
    };
  }

  static validateCreate(data: any): { isValid: boolean; errors: string[] } {
    const result = NotificationTemplate.createSchema.safeParse(data);
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
      slug: this.slug,
      type: this.type,
      channel: this.channel,
      subject: this.subject,
      template: this.template,
      description: this.description,
      variables: this.variables,
      defaultValues: this.defaultValues,
      isSystem: this.isSystem,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}