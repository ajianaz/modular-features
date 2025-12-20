import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  SendNotificationUseCase,
  GetNotificationsUseCase,
  MarkNotificationAsReadUseCase,
  MarkAllAsReadUseCase,
  DeleteNotificationUseCase,
  GetNotificationStatsUseCase
} from '../application/useCases';
import { NotificationChannel } from '../domain/enums/NotificationChannel';
import { TencentSESProvider } from '../infrastructure/lib/providers/TencentSESProvider';
import { FCMProvider } from '../infrastructure/lib/providers/FCMProvider';

// Initialize use cases
const sendNotificationUseCase = new SendNotificationUseCase();
const getNotificationsUseCase = new GetNotificationsUseCase();
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase();
const markAllAsReadUseCase = new MarkAllAsReadUseCase();
const deleteNotificationUseCase = new DeleteNotificationUseCase();
const getNotificationStatsUseCase = new GetNotificationStatsUseCase();

// Register providers (in production, this would come from config)
if (process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY) {
  sendNotificationUseCase.registerProvider(new TencentSESProvider({
    enabled: true,
    priority: 1,
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    region: process.env.TENCENT_SES_REGION || 'ap-singapore',
    from: process.env.TENCENT_SES_FROM || 'noreply@example.com',
    replyTo: process.env.TENCENT_SES_REPLY_TO
  }));
}

if (process.env.FCM_CREDENTIALS && process.env.FCM_PROJECT_ID) {
  sendNotificationUseCase.registerProvider(new FCMProvider({
    enabled: true,
    priority: 1,
    credentials: process.env.FCM_CREDENTIALS,
    projectId: process.env.FCM_PROJECT_ID
  }));
}

// Create router
export const notificationRouter = new Hono();

/**
 * GET /notifications
 * Get user notifications with pagination and filters
 */
notificationRouter.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  const status = c.req.query('status');
  const type = c.req.query('type');
  const unreadOnly = c.req.query('unreadOnly') === 'true';

  const result = await getNotificationsUseCase.execute({
    userId,
    limit,
    offset,
    status,
    type,
    unreadOnly
  });

  return c.json({
    success: true,
    data: result.notifications,
    meta: {
      total: result.total,
      unreadCount: result.unreadCount,
      limit,
      offset
    }
  });
});

/**
 * GET /notifications/stats
 * Get notification statistics for user
 */
notificationRouter.get('/stats', async (c) => {
  const userId = c.get('userId') as string;

  const stats = await getNotificationStatsUseCase.execute({ userId });

  return c.json({
    success: true,
    data: stats
  });
});

/**
 * GET /notifications/:id
 * Get single notification by ID
 */
notificationRouter.get('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const notificationId = c.req.param('id');

  const { GetNotificationsUseCase } = await import('../application/useCases');
  const useCase = new GetNotificationsUseCase();

  const { notifications } = await useCase.execute({
    userId,
    limit: 1,
    offset: 0
  });

  const notification = notifications.find(n => n.id === notificationId);

  if (!notification) {
    return c.json({
      success: false,
      error: 'Notification not found'
    }, 404);
  }

  if (notification.userId !== userId) {
    return c.json({
      success: false,
      error: 'Unauthorized'
    }, 403);
  }

  return c.json({
    success: true,
    data: notification
  });
});

/**
 * POST /notifications
 * Send a new notification
 */
notificationRouter.post(
  '/',
  zValidator('json', z.object({
    userId: z.string(),
    type: z.string(),
    title: z.string().optional(),
    message: z.string(),
    channels: z.array(z.enum(['email', 'push', 'whatsapp', 'sms', 'in_app', 'webhook'])),
    templateSlug: z.string().optional(),
    templateParams: z.record(z.any()).optional(),
    data: z.record(z.any()).optional(),
    scheduledFor: z.string().datetime().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    metadata: z.record(z.any()).optional()
  })),
  async (c) => {
    const body = c.req.valid('json');

    const result = await sendNotificationUseCase.execute({
      ...body,
      channels: body.channels as NotificationChannel[],
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined
    });

    return c.json({
      success: true,
      data: {
        notificationId: result.notificationId,
        results: result.results
      }
    }, 201);
  }
);

/**
 * PATCH /notifications/:id/read
 * Mark notification as read
 */
notificationRouter.patch('/:id/read', async (c) => {
  const userId = c.get('userId') as string;
  const notificationId = c.req.param('id');

  try {
    await markNotificationAsReadUseCase.execute({
      notificationId,
      userId
    });

    return c.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as read'
    }, 400);
  }
});

/**
 * POST /notifications/read-all
 * Mark all notifications as read
 */
notificationRouter.post('/read-all', async (c) => {
  const userId = c.get('userId') as string;

  await markAllAsReadUseCase.execute({ userId });

  return c.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * DELETE /notifications/:id
 * Delete notification
 */
notificationRouter.delete('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const notificationId = c.req.param('id');

  try {
    await deleteNotificationUseCase.execute({
      notificationId,
      userId
    });

    return c.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notification'
    }, 400);
  }
});

/**
 * POST /notifications/bulk
 * Send bulk notifications to multiple users
 */
notificationRouter.post(
  '/bulk',
  zValidator('json', z.object({
    userIds: z.array(z.string()),
    type: z.string(),
    title: z.string().optional(),
    message: z.string(),
    channels: z.array(z.enum(['email', 'push', 'whatsapp', 'sms', 'in_app', 'webhook'])),
    templateSlug: z.string().optional(),
    templateParams: z.record(z.any()).optional(),
    data: z.record(z.any()).optional(),
    scheduledFor: z.string().datetime().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    metadata: z.record(z.any()).optional()
  })),
  async (c) => {
    const body = c.req.valid('json');

    const results = await Promise.all(
      body.userIds.map(userId =>
        sendNotificationUseCase.execute({
          ...body,
          userId,
          channels: body.channels as NotificationChannel[],
          scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined
        })
      )
    );

    return c.json({
      success: true,
      data: {
        total: results.length,
        succeeded: results.filter(r => r.results.some(res => res.success)).length,
        failed: results.filter(r => r.results.every(res => !res.success)).length,
        results: results.map(r => ({
          notificationId: r.notificationId,
          success: r.results.some(res => res.success)
        }))
      }
    }, 201);
  }
);

export default notificationRouter;
