import { eq, and, or, desc, asc, sql, inArray, ilike } from 'drizzle-orm';
import { db } from '../db';
import { notificationTemplates } from '../../domain/entities/Notification';
import type { NotificationTemplate, NewNotificationTemplate } from '../../domain/entities/Notification';

/**
 * Notification Template Repository
 * 
 * Handles all database operations for notification templates
 */
export class NotificationTemplateRepository {
  private db = db;

  /**
   * Create a new template
   */
  async create(data: NewNotificationTemplate): Promise<NotificationTemplate> {
    const [template] = await this.db
      .insert(notificationTemplates)
      .values(data)
      .returning();
    
    return template;
  }

  /**
   * Find template by ID
   */
  async findById(id: string): Promise<NotificationTemplate | null> {
    const [template] = await this.db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
      .limit(1);
    
    return template || null;
  }

  /**
   * Find template by slug
   */
  async findBySlug(slug: string): Promise<NotificationTemplate | null> {
    const [template] = await this.db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.slug, slug))
      .limit(1);
    
    return template || null;
  }

  /**
   * Find templates by type
   */
  async findByType(type: string): Promise<NotificationTemplate[]> {
    const result = await this.db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.type, type))
      .orderBy(desc(notificationTemplates.createdAt));

    return result;
  }

  /**
   * Find templates by channel
   */
  async findByChannel(channel: string): Promise<NotificationTemplate[]> {
    const result = await this.db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.channel, channel))
      .orderBy(desc(notificationTemplates.createdAt));

    return result;
  }

  /**
   * Find active templates
   */
  async findActive(options?: {
    type?: string;
    channel?: string;
    limit?: number;
  }): Promise<NotificationTemplate[]> {
    const { type, channel, limit = 50 } = options || {};

    const conditions = [eq(notificationTemplates.isActive, true)];

    if (type) {
      conditions.push(eq(notificationTemplates.type, type));
    }

    if (channel) {
      conditions.push(eq(notificationTemplates.channel, channel));
    }

    const result = await this.db
      .select()
      .from(notificationTemplates)
      .where(and(...conditions))
      .orderBy(desc(notificationTemplates.createdAt))
      .limit(limit);

    return result;
  }

  /**
   * Search templates
   */
  async search(query: string, limit: number = 20): Promise<NotificationTemplate[]> {
    const result = await this.db
      .select()
      .from(notificationTemplates)
      .where(
        or(
          ilike(notificationTemplates.name, `%${query}%`),
          ilike(notificationTemplates.slug, `%${query}%`),
          ilike(notificationTemplates.description, `%${query}%`)
        )
      )
      .orderBy(desc(notificationTemplates.createdAt))
      .limit(limit);

    return result;
  }

  /**
   * Update template
   */
  async update(id: string, data: Partial<NewNotificationTemplate>): Promise<NotificationTemplate | null> {
    const [template] = await this.db
      .update(notificationTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning();

    return template || null;
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<boolean> {
    // Check if it's a system template
    const template = await this.findById(id);
    if (template?.isSystem) {
      throw new Error('Cannot delete system template');
    }

    const result = await this.db
      .delete(notificationTemplates)
      .where(eq(notificationTemplates.id, id));

    return result.rowCount > 0;
  }

  /**
   * Archive template
   */
  async archive(id: string): Promise<void> {
    await this.db
      .update(notificationTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id));
  }

  /**
   * Get all templates with pagination
   */
  async findAll(options?: {
    offset?: number;
    limit?: number;
    type?: string;
    channel?: string;
    isActive?: boolean;
  }): Promise<{ templates: NotificationTemplate[]; total: number }> {
    const { offset = 0, limit = 20, type, channel, isActive } = options || {};

    const conditions = [];
    
    if (type) {
      conditions.push(eq(notificationTemplates.type, type));
    }
    
    if (channel) {
      conditions.push(eq(notificationTemplates.channel, channel));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(notificationTemplates.isActive, isActive));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(notificationTemplates)
      .where(where);

    // Get templates
    const templates = await this.db
      .select()
      .from(notificationTemplates)
      .where(where)
      .orderBy(desc(notificationTemplates.createdAt))
      .limit(limit)
      .offset(offset);

    return { templates, total: count };
  }

  /**
   * Get template by slug and channel
   */
  async findBySlugAndChannel(slug: string, channel: string): Promise<NotificationTemplate | null> {
    const [template] = await this.db
      .select()
      .from(notificationTemplates)
      .where(
        and(
          eq(notificationTemplates.slug, slug),
          eq(notificationTemplates.channel, channel),
          eq(notificationTemplates.isActive, true)
        )
      )
      .limit(1);
    
    return template || null;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(notificationTemplates.slug, slug)];

    if (excludeId) {
      conditions.push(sql`${notificationTemplates.id} != ${excludeId}`);
    }

    const [template] = await this.db
      .select({ id: notificationTemplates.id })
      .from(notificationTemplates)
      .where(and(...conditions))
      .limit(1);

    return !!template;
  }

  /**
   * Duplicate template
   */
  async duplicate(id: string, newSlug: string, newName: string): Promise<NotificationTemplate> {
    const original = await this.findById(id);
    
    if (!original) {
      throw new Error('Template not found');
    }

    const [duplicate] = await this.db
      .insert(notificationTemplates)
      .values({
        name: newName,
        slug: newSlug,
        type: original.type,
        channel: original.channel,
        subject: original.subject,
        template: original.template,
        description: `Copy of ${original.name}`,
        variables: original.variables,
        defaultValues: original.defaultValues,
        isSystem: false,
        isActive: true
      })
      .returning();

    return duplicate;
  }
}

// Export singleton instance
export const notificationTemplateRepository = new NotificationTemplateRepository();
