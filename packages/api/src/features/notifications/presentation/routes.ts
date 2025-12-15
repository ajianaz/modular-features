import { Hono, Context } from 'hono';
import { authMiddleware } from '../../../middleware/auth';
import { validateJson, validateParam, validateQuery } from '../../../middleware/validation';
import {
  notificationRateLimitMiddleware,
  notificationPermissionMiddleware,
  notificationContextMiddleware
} from './middleware';
import {
  GetNotificationsController,
  SendNotificationController,
  MarkNotificationReadController,
  CreateNotificationController,
  CreateNotificationTemplateController,
  UpdateNotificationPreferenceController,
  ScheduleNotificationController,
  BulkNotificationController,
  CancelNotificationController,
  GetNotificationAnalyticsController,
  RetryFailedNotificationController
} from './controllers';
import {
  SendNotificationRequestSchema,
  GetNotificationsRequestSchema,
  MarkNotificationReadRequestSchema,
  CreateNotificationTemplateRequestSchema,
  UpdateNotificationPreferenceRequestSchema,
  ScheduleNotificationRequestSchema,
  BulkNotificationRequestSchema,
  CancelNotificationRequestSchema,
  GetNotificationAnalyticsRequestSchema,
  RetryFailedNotificationRequestSchema
} from '../application/dtos/input';

// Initialize controllers
const getNotificationsController = new GetNotificationsController();
const sendNotificationController = new SendNotificationController();
const markNotificationReadController = new MarkNotificationReadController();
const createNotificationController = new CreateNotificationController();
const createNotificationTemplateController = new CreateNotificationTemplateController();
const updateNotificationPreferenceController = new UpdateNotificationPreferenceController();
const scheduleNotificationController = new ScheduleNotificationController();
const bulkNotificationController = new BulkNotificationController();
const cancelNotificationController = new CancelNotificationController();
const getNotificationAnalyticsController = new GetNotificationAnalyticsController();
const retryFailedNotificationController = new RetryFailedNotificationController();

// Notification routes
export const notificationRoutes = new Hono();

// All notification routes require authentication and context
notificationRoutes.use(authMiddleware);
notificationRoutes.use(notificationContextMiddleware);

// POST /api/notifications/send - Send a notification
notificationRoutes.post(
  '/send',
  notificationRateLimitMiddleware,
  notificationPermissionMiddleware,
  validateJson(SendNotificationRequestSchema),
  async (c: Context) => {
    return await sendNotificationController.send(c);
  }
);

// GET /api/notifications - Get user notifications
notificationRoutes.get(
  '/',
  validateQuery(GetNotificationsRequestSchema),
  async (c: Context) => {
    return await getNotificationsController.getNotifications(c);
  }
);

// PUT /api/notifications/:notificationId/read - Mark notification as read
notificationRoutes.put(
  '/:notificationId/read',
  validateParam(MarkNotificationReadRequestSchema.pick({ notificationId: true })),
  validateJson(MarkNotificationReadRequestSchema.omit({ notificationId: true })),
  async (c: Context) => {
    return await markNotificationReadController.markAsRead(c);
  }
);

// POST /api/notifications/create - Create a notification
notificationRoutes.post(
  '/create',
  notificationRateLimitMiddleware,
  notificationPermissionMiddleware,
  async (c: Context) => {
    return await createNotificationController.create(c);
  }
);

// POST /api/notifications/templates - Create a notification template
notificationRoutes.post(
  '/templates',
  notificationPermissionMiddleware,
  validateJson(CreateNotificationTemplateRequestSchema),
  async (c: Context) => {
    return await createNotificationTemplateController.create(c);
  }
);

// PUT /api/notifications/preferences - Update notification preferences
notificationRoutes.put(
  '/preferences',
  validateJson(UpdateNotificationPreferenceRequestSchema),
  async (c: Context) => {
    return await updateNotificationPreferenceController.update(c);
  }
);

// POST /api/notifications/schedule - Schedule a notification
notificationRoutes.post(
  '/schedule',
  notificationRateLimitMiddleware,
  notificationPermissionMiddleware,
  validateJson(ScheduleNotificationRequestSchema),
  async (c: Context) => {
    return await scheduleNotificationController.schedule(c);
  }
);

// POST /api/notifications/bulk - Send bulk notifications
notificationRoutes.post(
  '/bulk',
  notificationRateLimitMiddleware,
  notificationPermissionMiddleware,
  validateJson(BulkNotificationRequestSchema),
  async (c: Context) => {
    return await bulkNotificationController.sendBulk(c);
  }
);

// DELETE /api/notifications/:notificationId - Cancel a notification
notificationRoutes.delete(
  '/:notificationId',
  validateParam(CancelNotificationRequestSchema.pick({ notificationId: true })),
  validateJson(CancelNotificationRequestSchema.omit({ notificationId: true })),
  async (c: Context) => {
    return await cancelNotificationController.cancel(c);
  }
);

// GET /api/notifications/analytics - Get notification analytics
notificationRoutes.get(
  '/analytics',
  validateQuery(GetNotificationAnalyticsRequestSchema),
  async (c: Context) => {
    return await getNotificationAnalyticsController.getAnalytics(c);
  }
);

// POST /api/notifications/:notificationId/retry - Retry a failed notification
notificationRoutes.post(
  '/:notificationId/retry',
  validateParam(RetryFailedNotificationRequestSchema.pick({ notificationId: true })),
  validateJson(RetryFailedNotificationRequestSchema.omit({ notificationId: true })),
  async (c: Context) => {
    return await retryFailedNotificationController.retry(c);
  }
);

export default notificationRoutes;