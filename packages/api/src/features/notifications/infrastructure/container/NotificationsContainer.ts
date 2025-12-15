
import {
  NotificationRepository,
  NotificationTemplateRepository,
  NotificationPreferenceRepository,
  NotificationDeliveryRepository,
  NotificationGroupRepository,
  NotificationRecipientRepository,
  NotificationAnalyticsRepository
} from '../repositories';

import { SendGridProvider, TwilioProvider, FirebaseProvider, InAppProvider } from '../lib/providers';
import { TemplateRenderer, NotificationScheduler } from '../lib/services';

import { SendNotificationUseCase } from '../../application/usecases/SendNotificationUseCase';
import { CreateNotificationUseCase } from '../../application/usecases/CreateNotificationUseCase';
import { GetNotificationsUseCase } from '../../application/usecases/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from '../../application/usecases/MarkNotificationReadUseCase';
import { UpdateNotificationPreferenceUseCase } from '../../application/usecases/UpdateNotificationPreferenceUseCase';
import { CreateNotificationTemplateUseCase } from '../../application/usecases/CreateNotificationTemplateUseCase';
import { GetNotificationTemplatesUseCase } from '../../application/usecases/GetNotificationTemplatesUseCase';
import { UpdateNotificationTemplateUseCase } from '../../application/usecases/UpdateNotificationTemplateUseCase';
import { BulkNotificationUseCase } from '../../application/usecases/BulkNotificationUseCase';
import { ScheduleNotificationUseCase } from '../../application/usecases/ScheduleNotificationUseCase';
import { CancelNotificationUseCase } from '../../application/usecases/CancelNotificationUseCase';
import { RetryFailedNotificationUseCase } from '../../application/usecases/RetryFailedNotificationUseCase';
import { GetNotificationAnalyticsUseCase } from '../../application/usecases/GetNotificationAnalyticsUseCase';

/**
 * Notifications Dependency Injection Container
 *
 * This container manages all dependencies for the notifications feature
 * following the Dependency Injection pattern. It provides a centralized
 * place to configure and resolve dependencies, making it easier to
 * manage the feature's dependencies and test them.
 *
 * The container implements the singleton pattern to ensure that only one
 * instance of the container exists throughout the application lifecycle.
 *
 * This container follows the same pattern as AuthContainer and UsersContainer
 * to maintain consistency across the application.
 */
export class NotificationsContainer {
  private static instance: NotificationsContainer;

  // Repositories
  private notificationRepository!: NotificationRepository;
  private notificationTemplateRepository!: NotificationTemplateRepository;
  private notificationPreferenceRepository!: NotificationPreferenceRepository;
  private notificationDeliveryRepository!: NotificationDeliveryRepository;
  private notificationGroupRepository!: NotificationGroupRepository;
  private notificationRecipientRepository!: NotificationRecipientRepository;
  private notificationAnalyticsRepository!: NotificationAnalyticsRepository;

  // Providers
  private sendGridProvider!: SendGridProvider;
  private twilioProvider!: TwilioProvider;
  private firebaseProvider!: FirebaseProvider;
  private inAppProvider!: InAppProvider;

  // Services
  private templateRenderer!: TemplateRenderer;
  private notificationScheduler!: NotificationScheduler;

  // Use cases
  private sendNotificationUseCase!: SendNotificationUseCase;
  private createNotificationUseCase!: CreateNotificationUseCase;
  private getNotificationsUseCase!: GetNotificationsUseCase;
  private markNotificationReadUseCase!: MarkNotificationReadUseCase;
  private updateNotificationPreferenceUseCase!: UpdateNotificationPreferenceUseCase;
  private createNotificationTemplateUseCase!: CreateNotificationTemplateUseCase;
  private getNotificationTemplatesUseCase!: GetNotificationTemplatesUseCase;
  private updateNotificationTemplateUseCase!: UpdateNotificationTemplateUseCase;
  private bulkNotificationUseCase!: BulkNotificationUseCase;
  private scheduleNotificationUseCase!: ScheduleNotificationUseCase;
  private cancelNotificationUseCase!: CancelNotificationUseCase;
  private retryFailedNotificationUseCase!: RetryFailedNotificationUseCase;
  private getNotificationAnalyticsUseCase!: GetNotificationAnalyticsUseCase;

  private constructor() {
    // Initialize all infrastructure dependencies
    this.initializeRepositories();

    // Initialize providers
    this.initializeProviders();

    // Initialize services
    this.initializeServices();

    // Initialize all use cases
    this.initializeUseCases();
  }

  /**
   * Initialize all repositories
   */
  private initializeRepositories(): void {
    this.notificationRepository = new NotificationRepository();
    this.notificationTemplateRepository = new NotificationTemplateRepository();
    this.notificationPreferenceRepository = new NotificationPreferenceRepository();
    this.notificationDeliveryRepository = new NotificationDeliveryRepository();
    this.notificationGroupRepository = new NotificationGroupRepository();
    this.notificationRecipientRepository = new NotificationRecipientRepository();
    this.notificationAnalyticsRepository = new NotificationAnalyticsRepository();
  }

  /**
   * Initialize all providers
   */
  private initializeProviders(): void {
    this.sendGridProvider = new SendGridProvider({
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@modular-monolith.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'Modular Monolith'
    });

    this.twilioProvider = new TwilioProvider({
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || ''
    });

    this.firebaseProvider = new FirebaseProvider({
      serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '',
      projectId: process.env.FIREBASE_PROJECT_ID || ''
    });

    this.inAppProvider = new InAppProvider();
  }

  /**
   * Initialize all services
   */
  private initializeServices(): void {
    this.templateRenderer = new TemplateRenderer();
    this.notificationScheduler = new NotificationScheduler();
  }

  /**
   * Initialize all use cases with proper dependencies
   */
  private initializeUseCases(): void {
    // Initialize use cases with their required dependencies
    this.sendNotificationUseCase = new SendNotificationUseCase(
      this.notificationRepository,
      this.notificationTemplateRepository,
      this.notificationPreferenceRepository,
      this.getProviders()
    );

    // For now, initialize placeholder use cases without dependencies
    // These will be properly implemented when the actual use cases are implemented
    this.createNotificationUseCase = new CreateNotificationUseCase();
    this.getNotificationsUseCase = new GetNotificationsUseCase(
      this.notificationRepository
    );
    this.markNotificationReadUseCase = new MarkNotificationReadUseCase(
      this.notificationRepository
    );
    this.updateNotificationPreferenceUseCase = new UpdateNotificationPreferenceUseCase();
    this.createNotificationTemplateUseCase = new CreateNotificationTemplateUseCase();
    this.getNotificationTemplatesUseCase = new GetNotificationTemplatesUseCase();
    this.updateNotificationTemplateUseCase = new UpdateNotificationTemplateUseCase();
    this.bulkNotificationUseCase = new BulkNotificationUseCase();
    this.scheduleNotificationUseCase = new ScheduleNotificationUseCase();
    this.cancelNotificationUseCase = new CancelNotificationUseCase();
    this.retryFailedNotificationUseCase = new RetryFailedNotificationUseCase();
    this.getNotificationAnalyticsUseCase = new GetNotificationAnalyticsUseCase();
  }

  /**
   * Get singleton instance of the container
   */
  public static getInstance(): NotificationsContainer {
    if (!NotificationsContainer.instance) {
      NotificationsContainer.instance = new NotificationsContainer();
    }
    return NotificationsContainer.instance;
  }

  /**
   * Initialize the container with custom dependencies (useful for testing)
   */
  public static initialize(
    repositories?: Partial<{
      notificationRepository: NotificationRepository;
      notificationTemplateRepository: NotificationTemplateRepository;
      notificationPreferenceRepository: NotificationPreferenceRepository;
      notificationDeliveryRepository: NotificationDeliveryRepository;
      notificationGroupRepository: NotificationGroupRepository;
      notificationRecipientRepository: NotificationRecipientRepository;
      notificationAnalyticsRepository: NotificationAnalyticsRepository;
    }>,
    providers?: Partial<{
      sendGridProvider: SendGridProvider;
      twilioProvider: TwilioProvider;
      firebaseProvider: FirebaseProvider;
      inAppProvider: InAppProvider;
    }>,
    services?: Partial<{
      templateRenderer: TemplateRenderer;
      notificationScheduler: NotificationScheduler;
    }>
  ): NotificationsContainer {
    // Reset any existing instance
    NotificationsContainer.resetInstance();

    // Create new instance
    const container = new NotificationsContainer();

    // Override with custom dependencies if provided
    if (repositories) {
      Object.assign(container, repositories);
    }

    if (providers) {
      Object.assign(container, providers);
    }

    if (services) {
      Object.assign(container, services);
    }

    // Reinitialize use cases with the new dependencies
    container.initializeUseCases();

    NotificationsContainer.instance = container;
    return container;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    NotificationsContainer.instance = null as any;
  }

  /**
   * Get all notification providers as a map
   */
  private getProviders(): Map<string, any> {
    const providers = new Map<string, any>();
    providers.set('email', this.sendGridProvider);
    providers.set('sms', this.twilioProvider);
    providers.set('push', this.firebaseProvider);
    providers.set('in_app', this.inAppProvider);
    return providers;
  }

  /**
   * Get all notification providers as an object
   */
  public getAllProviders(): {
    email: SendGridProvider;
    sms: TwilioProvider;
    push: FirebaseProvider;
    in_app: InAppProvider;
  } {
    return {
      email: this.sendGridProvider,
      sms: this.twilioProvider,
      push: this.firebaseProvider,
      in_app: this.inAppProvider
    };
  }

  // Repository getters
  public getNotificationRepository(): NotificationRepository {
    return this.notificationRepository;
  }

  public getNotificationTemplateRepository(): NotificationTemplateRepository {
    return this.notificationTemplateRepository;
  }

  public getNotificationPreferenceRepository(): NotificationPreferenceRepository {
    return this.notificationPreferenceRepository;
  }

  public getNotificationDeliveryRepository(): NotificationDeliveryRepository {
    return this.notificationDeliveryRepository;
  }

  public getNotificationGroupRepository(): NotificationGroupRepository {
    return this.notificationGroupRepository;
  }

  public getNotificationRecipientRepository(): NotificationRecipientRepository {
    return this.notificationRecipientRepository;
  }

  public getNotificationAnalyticsRepository(): NotificationAnalyticsRepository {
    return this.notificationAnalyticsRepository;
  }

  // Provider getters
  public getSendGridProvider(): SendGridProvider {
    return this.sendGridProvider;
  }

  public getTwilioProvider(): TwilioProvider {
    return this.twilioProvider;
  }

  public getFirebaseProvider(): FirebaseProvider {
    return this.firebaseProvider;
  }

  public getInAppProvider(): InAppProvider {
    return this.inAppProvider;
  }

  // Service getters
  public getTemplateRenderer(): TemplateRenderer {
    return this.templateRenderer;
  }

  public getNotificationScheduler(): NotificationScheduler {
    return this.notificationScheduler;
  }

  // Use case getters
  public getSendNotificationUseCase(): SendNotificationUseCase {
    return this.sendNotificationUseCase;
  }

  public getCreateNotificationUseCase(): CreateNotificationUseCase {
    return this.createNotificationUseCase;
  }

  public getGetNotificationsUseCase(): GetNotificationsUseCase {
    return this.getNotificationsUseCase;
  }

  public getMarkNotificationReadUseCase(): MarkNotificationReadUseCase {
    return this.markNotificationReadUseCase;
  }

  public getUpdateNotificationPreferenceUseCase(): UpdateNotificationPreferenceUseCase {
    return this.updateNotificationPreferenceUseCase;
  }

  public getCreateNotificationTemplateUseCase(): CreateNotificationTemplateUseCase {
    return this.createNotificationTemplateUseCase;
  }

  public getGetNotificationTemplatesUseCase(): GetNotificationTemplatesUseCase {
    return this.getNotificationTemplatesUseCase;
  }

  public getUpdateNotificationTemplateUseCase(): UpdateNotificationTemplateUseCase {
    return this.updateNotificationTemplateUseCase;
  }

  public getBulkNotificationUseCase(): BulkNotificationUseCase {
    return this.bulkNotificationUseCase;
  }

  public getScheduleNotificationUseCase(): ScheduleNotificationUseCase {
    return this.scheduleNotificationUseCase;
  }

  public getCancelNotificationUseCase(): CancelNotificationUseCase {
    return this.cancelNotificationUseCase;
  }

  public getRetryFailedNotificationUseCase(): RetryFailedNotificationUseCase {
    return this.retryFailedNotificationUseCase;
  }

  public getGetNotificationAnalyticsUseCase(): GetNotificationAnalyticsUseCase {
    return this.getNotificationAnalyticsUseCase;
  }

  /**
   * Get all use cases at once
   */
  public getAllUseCases(): {
    sendNotificationUseCase: SendNotificationUseCase;
    createNotificationUseCase: CreateNotificationUseCase;
    getNotificationsUseCase: GetNotificationsUseCase;
    markNotificationReadUseCase: MarkNotificationReadUseCase;
    updateNotificationPreferenceUseCase: UpdateNotificationPreferenceUseCase;
    createNotificationTemplateUseCase: CreateNotificationTemplateUseCase;
    getNotificationTemplatesUseCase: GetNotificationTemplatesUseCase;
    updateNotificationTemplateUseCase: UpdateNotificationTemplateUseCase;
    bulkNotificationUseCase: BulkNotificationUseCase;
    scheduleNotificationUseCase: ScheduleNotificationUseCase;
    cancelNotificationUseCase: CancelNotificationUseCase;
    retryFailedNotificationUseCase: RetryFailedNotificationUseCase;
    getNotificationAnalyticsUseCase: GetNotificationAnalyticsUseCase;
  } {
    return {
      sendNotificationUseCase: this.sendNotificationUseCase,
      createNotificationUseCase: this.createNotificationUseCase,
      getNotificationsUseCase: this.getNotificationsUseCase,
      markNotificationReadUseCase: this.markNotificationReadUseCase,
      updateNotificationPreferenceUseCase: this.updateNotificationPreferenceUseCase,
      createNotificationTemplateUseCase: this.createNotificationTemplateUseCase,
      getNotificationTemplatesUseCase: this.getNotificationTemplatesUseCase,
      updateNotificationTemplateUseCase: this.updateNotificationTemplateUseCase,
      bulkNotificationUseCase: this.bulkNotificationUseCase,
      scheduleNotificationUseCase: this.scheduleNotificationUseCase,
      cancelNotificationUseCase: this.cancelNotificationUseCase,
      retryFailedNotificationUseCase: this.retryFailedNotificationUseCase,
      getNotificationAnalyticsUseCase: this.getNotificationAnalyticsUseCase
    };
  }
}
