import { Hono, Context } from 'hono';
import { authMiddleware } from '../../../middleware/auth';
import { validateJson, validateParam, validateQuery } from '../../../middleware/validation';
import { GetNotificationsController } from './controllers/GetNotificationsController';

// TODO: Import other controllers when they are created
// import { SendNotificationController } from './controllers/SendNotificationController';
// import { MarkNotificationReadController } from './controllers/MarkNotificationReadController';

// TODO: Import request schemas when they are available
// import {
//   SendNotificationRequestSchema,
//   GetNotificationsRequestSchema,
//   MarkNotificationReadRequestSchema
// } from '../application/dtos/input';

// Notification routes
export const notificationRoutes = new Hono();

// All notification routes require authentication
notificationRoutes.use(authMiddleware);

// TODO: Add notification routes when controllers are implemented
// POST /api/notifications/send - Send a notification
// notificationRoutes.post(
//   '/send',
//   validateJson(SendNotificationRequestSchema),
//   async (c: Context) => {
//     return await sendNotificationController.send(c);
//   }
// );

// GET /api/notifications - Get user notifications
// notificationRoutes.get(
//   '/',
//   validateQuery(GetNotificationsRequestSchema),
//   async (c: Context) => {
//     return await getNotificationsController.getNotifications(c);
//   }
// );

// PUT /api/notifications/:notificationId/read - Mark notification as read
// notificationRoutes.put(
//   '/:notificationId/read',
//   validateParam(MarkNotificationReadRequestSchema.pick({ notificationId: true })),
//   validateJson(MarkNotificationReadRequestSchema.omit({ notificationId: true })),
//   async (c: Context) => {
//     return await markNotificationReadController.markAsRead(c);
//   }
// );

// Temporary placeholder route to ensure the module loads
notificationRoutes.get('/', (c: Context) => {
  return c.json({
    message: 'Notification service is available',
    status: 'placeholder',
    note: 'Full notification endpoints will be implemented when controllers are ready'
  });
});

export default notificationRoutes;