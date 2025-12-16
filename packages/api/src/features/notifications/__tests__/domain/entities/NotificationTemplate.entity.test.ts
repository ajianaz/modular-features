import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationTemplate } from '../../../domain/entities/NotificationTemplate.entity';
import {
  NotificationType,
  NotificationChannel
} from '../../../domain/types';
import {
  testTemplateIds,
  createTestNotificationTemplate,
  createMinimalNotificationTemplate
} from '../../utils/testFixtures.test';

describe('NotificationTemplate Entity', () => {
  describe('Constructor', () => {
    it('should create a valid notification template with all required fields', () => {
      const template = new NotificationTemplate(
        testTemplateIds.validTemplate1,
        'Welcome Template',
        'welcome-template',
        NotificationType.INFO,
        NotificationChannel.EMAIL,
        'Hello {{name}}, welcome to our platform!',
        'Template for welcome notifications',
        { name: 'string', platform: 'string' },
        { name: 'User', platform: 'our platform' },
        false,
        true,
        { version: '1.0', category: 'onboarding' },
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z'),
        'Welcome to our platform!'
      );

      expect(template.id).toBe(testTemplateIds.validTemplate1);
      expect(template.name).toBe('Welcome Template');
      expect(template.slug).toBe('welcome-template');
      expect(template.type).toBe(NotificationType.INFO);
      expect(template.channel).toBe(NotificationChannel.EMAIL);
      expect(template.template).toBe('Hello {{name}}, welcome to our platform!');
      expect(template.description).toBe('Template for welcome notifications');
      expect(template.variables).toEqual({ name: 'string', platform: 'string' });
      expect(template.defaultValues).toEqual({ name: 'User', platform: 'our platform' });
      expect(template.isSystem).toBe(false);
      expect(template.isActive).toBe(true);
      expect(template.metadata).toEqual({ version: '1.0', category: 'onboarding' });
      expect(template.subject).toBe('Welcome to our platform!');
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a notification template with default values', () => {
      const template = new NotificationTemplate(
        testTemplateIds.validTemplate1,
        'Minimal Template',
        'minimal-template',
        NotificationType.INFO,
        NotificationChannel.EMAIL,
        'Hello {{name}}!'
      );

      expect(template.description).toBeUndefined();
      expect(template.variables).toEqual({});
      expect(template.defaultValues).toEqual({});
      expect(template.isSystem).toBe(false);
      expect(template.isActive).toBe(true);
      expect(template.metadata).toEqual({});
      expect(template.subject).toBeUndefined();
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid notification template using factory method', () => {
      const templateData = {
        name: 'Welcome Template',
        slug: 'welcome-template',
        type: NotificationType.INFO,
        channel: NotificationChannel.EMAIL,
        subject: 'Welcome to our platform!',
        template: 'Hello {{name}}, welcome to our platform!',
        description: 'Template for welcome notifications',
        variables: { name: 'string', platform: 'string' },
        defaultValues: { name: 'User', platform: 'our platform' },
        isSystem: false,
        metadata: { version: '1.0', category: 'onboarding' }
      };

      const template = NotificationTemplate.create(templateData);

      expect(template.name).toBe(templateData.name);
      expect(template.slug).toBe(templateData.slug);
      expect(template.type).toBe(templateData.type);
      expect(template.channel).toBe(templateData.channel);
      expect(template.subject).toBe(templateData.subject);
      expect(template.template).toBe(templateData.template);
      expect(template.description).toBe(templateData.description);
      expect(template.variables).toEqual(templateData.variables);
      expect(template.defaultValues).toEqual(templateData.defaultValues);
      expect(template.isSystem).toBe(templateData.isSystem);
      expect(template.metadata).toEqual(templateData.metadata);
      expect(template.isActive).toBe(true);
      expect(template.id).toBeDefined();
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should create notification template with default values using factory method', () => {
      const templateData = {
        name: 'Minimal Template',
        slug: 'minimal-template',
        type: NotificationType.INFO,
        channel: NotificationChannel.EMAIL,
        template: 'Hello {{name}}!'
      };

      const template = NotificationTemplate.create(templateData);

      expect(template.name).toBe(templateData.name);
      expect(template.slug).toBe(templateData.slug);
      expect(template.type).toBe(templateData.type);
      expect(template.channel).toBe(templateData.channel);
      expect(template.template).toBe(templateData.template);
      expect(template.subject).toBeUndefined();
      expect(template.description).toBeUndefined();
      expect(template.variables).toEqual({});
      expect(template.defaultValues).toEqual({});
      expect(template.isSystem).toBe(false);
      expect(template.metadata).toEqual({});
      expect(template.isActive).toBe(true);
      expect(template.id).toBeDefined();
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Methods', () => {
    let template: NotificationTemplate;

    beforeEach(() => {
      template = createTestNotificationTemplate();
    });

    describe('render', () => {
      it('should render template with provided variables', () => {
        const variables = { name: 'John Doe', platform: 'Test Platform' };
        const rendered = template.render(variables);

        expect(rendered).toBe('Hello John Doe, welcome to Test Platform!');
      });

      it('should render template with default values when variables not provided', () => {
        const rendered = template.render({});

        expect(rendered).toBe('Hello User, welcome to our platform!');
      });

      it('should render template with partial variables and default values for missing', () => {
        const variables = { name: 'Jane Doe' };
        const rendered = template.render(variables);

        expect(rendered).toBe('Hello Jane Doe, welcome to our platform!');
      });

      it('should handle empty template', () => {
        const emptyTemplate = createTestNotificationTemplate({
          template: ''
        });
        const rendered = emptyTemplate.render({ name: 'John' });

        expect(rendered).toBe('');
      });
    });

    describe('renderSubject', () => {
      it('should render subject with provided variables', () => {
        const templateWithSubject = createTestNotificationTemplate({
          subject: 'Welcome {{name}} to {{platform}}!'
        });
        const variables = { name: 'John Doe', platform: 'Test Platform' };
        const rendered = templateWithSubject.renderSubject(variables);

        expect(rendered).toBe('Welcome John Doe to Test Platform!');
      });

      it('should return undefined when subject is not set', () => {
        const templateWithoutSubject = createTestNotificationTemplate({
          subject: undefined
        });
        const rendered = templateWithoutSubject.renderSubject({ name: 'John' });

        expect(rendered).toBeUndefined();
      });

      it('should render subject with default values when variables not provided', () => {
        const templateWithSubject = createTestNotificationTemplate({
          subject: 'Welcome {{name}} to {{platform}}!',
          defaultValues: { name: 'User', platform: 'our platform' }
        });
        const rendered = templateWithSubject.renderSubject({});

        expect(rendered).toBe('Welcome User to our platform!');
      });
    });

    describe('updateName', () => {
      it('should update name and return new instance', () => {
        const updatedTemplate = template.updateName('Updated Template');

        expect(updatedTemplate.name).toBe('Updated Template');
        expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
        expect(updatedTemplate.id).toBe(template.id);
        expect(updatedTemplate.slug).toBe(template.slug);
        expect(updatedTemplate.type).toBe(template.type);
        expect(updatedTemplate.channel).toBe(template.channel);
      });

      it('should trim name', () => {
        const updatedTemplate = template.updateName('  Updated Template  ');

        expect(updatedTemplate.name).toBe('Updated Template');
      });
    });

    describe('updateSubject', () => {
      it('should update subject and return new instance', () => {
        const updatedTemplate = template.updateSubject('Updated Subject');

        expect(updatedTemplate.subject).toBe('Updated Subject');
        expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
        expect(updatedTemplate.id).toBe(template.id);
        expect(updatedTemplate.name).toBe(template.name);
      });

      it('should set subject to undefined', () => {
        const updatedTemplate = template.updateSubject(undefined);

        expect(updatedTemplate.subject).toBeUndefined();
      });

      it('should trim subject', () => {
        const updatedTemplate = template.updateSubject('  Updated Subject  ');

        expect(updatedTemplate.subject).toBe('Updated Subject');
      });
    });

    describe('updateTemplate', () => {
      it('should update template content and return new instance', () => {
        const updatedTemplate = template.updateTemplate('Updated template content');

        expect(updatedTemplate.template).toBe('Updated template content');
        expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
        expect(updatedTemplate.id).toBe(template.id);
        expect(updatedTemplate.name).toBe(template.name);
      });

      it('should trim template content', () => {
        const updatedTemplate = template.updateTemplate('  Updated template content  ');

        expect(updatedTemplate.template).toBe('Updated template content');
      });
    });

    describe('updateDescription', () => {
      it('should update description and return new instance', () => {
        const updatedTemplate = template.updateDescription('Updated description');

        expect(updatedTemplate.description).toBe('Updated description');
        expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
        expect(updatedTemplate.id).toBe(template.id);
        expect(updatedTemplate.name).toBe(template.name);
      });

      it('should set description to undefined', () => {
        const updatedTemplate = template.updateDescription(undefined);

        expect(updatedTemplate.description).toBeUndefined();
      });

      it('should trim description', () => {
        const updatedTemplate = template.updateDescription('  Updated description  ');

        expect(updatedTemplate.description).toBe('Updated description');
      });
    });

    describe('updateVariables', () => {
      it('should update variables and return new instance', () => {
        const newVariables = { newName: 'string', newPlatform: 'string' };
        const updatedTemplate = template.updateVariables(newVariables);

        expect(updatedTemplate.variables).toEqual(newVariables);
        expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
        expect(updatedTemplate.id).toBe(template.id);
        expect(updatedTemplate.name).toBe(template.name);
      });
    });

    describe('updateDefaultValues', () => {
      it('should update default values and return new instance', () => {
        const newDefaultValues = { newName: 'Default Name', newPlatform: 'Default Platform' };
        const updatedTemplate = template.updateDefaultValues(newDefaultValues);

        expect(updatedTemplate.defaultValues).toEqual(newDefaultValues);
        expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
        expect(updatedTemplate.id).toBe(template.id);
        expect(updatedTemplate.name).toBe(template.name);
      });
    });

    describe('activate', () => {
      it('should activate template and return new instance', () => {
        const inactiveTemplate = createTestNotificationTemplate({ isActive: false });
        const activeTemplate = inactiveTemplate.activate();

        expect(activeTemplate.isActive).toBe(true);
        expect(activeTemplate.updatedAt.getTime()).toBeGreaterThan(inactiveTemplate.updatedAt.getTime());
        expect(activeTemplate.id).toBe(inactiveTemplate.id);
        expect(activeTemplate.name).toBe(inactiveTemplate.name);
      });

      it('should keep template active if already active', () => {
        const alreadyActiveTemplate = createTestNotificationTemplate({ isActive: true });
        const activeTemplate = alreadyActiveTemplate.activate();

        expect(activeTemplate.isActive).toBe(true);
        expect(activeTemplate.updatedAt.getTime()).toBeGreaterThan(alreadyActiveTemplate.updatedAt.getTime());
      });
    });

    describe('deactivate', () => {
      it('should deactivate template and return new instance', () => {
        const activeTemplate = createTestNotificationTemplate({ isActive: true });
        const inactiveTemplate = activeTemplate.deactivate();

        expect(inactiveTemplate.isActive).toBe(false);
        expect(inactiveTemplate.updatedAt.getTime()).toBeGreaterThan(activeTemplate.updatedAt.getTime());
        expect(inactiveTemplate.id).toBe(activeTemplate.id);
        expect(inactiveTemplate.name).toBe(activeTemplate.name);
      });

      it('should keep template inactive if already inactive', () => {
        const alreadyInactiveTemplate = createTestNotificationTemplate({ isActive: false });
        const inactiveTemplate = alreadyInactiveTemplate.deactivate();

        expect(inactiveTemplate.isActive).toBe(false);
        expect(inactiveTemplate.updatedAt.getTime()).toBeGreaterThan(alreadyInactiveTemplate.updatedAt.getTime());
      });
    });
  });

  describe('Helper Methods', () => {
    let template: NotificationTemplate;

    beforeEach(() => {
      template = createTestNotificationTemplate();
    });

    describe('isActiveTemplate', () => {
      it('should return true for active template', () => {
        const activeTemplate = createTestNotificationTemplate({ isActive: true });
        expect(activeTemplate.isActiveTemplate()).toBe(true);
      });

      it('should return false for inactive template', () => {
        const inactiveTemplate = createTestNotificationTemplate({ isActive: false });
        expect(inactiveTemplate.isActiveTemplate()).toBe(false);
      });
    });

    describe('isSystemTemplate', () => {
      it('should return true for system template', () => {
        const systemTemplate = createTestNotificationTemplate({ isSystem: true });
        expect(systemTemplate.isSystemTemplate()).toBe(true);
      });

      it('should return false for non-system template', () => {
        const nonSystemTemplate = createTestNotificationTemplate({ isSystem: false });
        expect(nonSystemTemplate.isSystemTemplate()).toBe(false);
      });
    });

    describe('supportsChannel', () => {
      it('should return true for matching channel', () => {
        const emailTemplate = createTestNotificationTemplate({
          channel: NotificationChannel.EMAIL
        });
        expect(emailTemplate.supportsChannel(NotificationChannel.EMAIL)).toBe(true);
      });

      it('should return false for non-matching channel', () => {
        const emailTemplate = createTestNotificationTemplate({
          channel: NotificationChannel.EMAIL
        });
        expect(emailTemplate.supportsChannel(NotificationChannel.SMS)).toBe(false);
      });
    });

    describe('supportsType', () => {
      it('should return true for matching type', () => {
        const infoTemplate = createTestNotificationTemplate({
          type: NotificationType.INFO
        });
        expect(infoTemplate.supportsType(NotificationType.INFO)).toBe(true);
      });

      it('should return false for non-matching type', () => {
        const infoTemplate = createTestNotificationTemplate({
          type: NotificationType.INFO
        });
        expect(infoTemplate.supportsType(NotificationType.WARNING)).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid notification template', () => {
        const template = createTestNotificationTemplate();
        const result = template.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid notification template', () => {
        const invalidTemplate = new NotificationTemplate(
          'invalid-id',
          '', // Empty name
          '', // Empty slug
          'invalid-type' as any, // Invalid type
          'invalid-channel' as any, // Invalid channel
          '', // Empty template
          '', // Empty description
          'invalid-variables' as any, // Invalid variables
          'invalid-default-values' as any, // Invalid default values
          'invalid-is-system' as any, // Invalid isSystem
          'invalid-is-active' as any, // Invalid isActive
          'invalid-metadata' as any, // Invalid metadata
          'invalid-date' as any, // Invalid created date
          'invalid-date' as any, // Invalid updated date
          '' // Empty subject
        );

        const result = invalidTemplate.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const templateData = {
          name: 'Welcome Template',
          slug: 'welcome-template',
          type: NotificationType.INFO,
          channel: NotificationChannel.EMAIL,
          subject: 'Welcome to our platform!',
          template: 'Hello {{name}}, welcome to our platform!',
          description: 'Template for welcome notifications',
          variables: { name: 'string', platform: 'string' },
          defaultValues: { name: 'User', platform: 'our platform' },
          isSystem: false,
          metadata: { version: '1.0', category: 'onboarding' }
        };

        const result = NotificationTemplate.validateCreate(templateData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          name: '', // Empty name
          slug: '', // Empty slug
          type: 'invalid-type' as any, // Invalid type
          channel: 'invalid-channel' as any, // Invalid channel
          template: '', // Empty template
          variables: 'invalid-variables' as any, // Invalid variables type
          defaultValues: 'invalid-default-values' as any, // Invalid default values type
          isSystem: 'invalid-is-system' as any, // Invalid isSystem type
          metadata: 'invalid-metadata' as any // Invalid metadata type
        };

        const result = NotificationTemplate.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let template: NotificationTemplate;

    beforeEach(() => {
      template = createTestNotificationTemplate();
    });

    describe('toJSON', () => {
      it('should return template object with all properties', () => {
        const json = template.toJSON();

        expect(json).toEqual({
          id: template.id,
          name: template.name,
          slug: template.slug,
          type: template.type,
          channel: template.channel,
          subject: template.subject,
          template: template.template,
          description: template.description,
          variables: template.variables,
          defaultValues: template.defaultValues,
          isSystem: template.isSystem,
          isActive: template.isActive,
          metadata: template.metadata,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        });
      });
    });
  });
});
;