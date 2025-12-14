// Domain exports
export * from './domain/entities';
export * from './domain/interfaces';
export * from './domain/errors';

// Application exports
export * from './application/usecases';
export * from './application/dtos';

// Infrastructure exports
export * from './infrastructure/repositories';
export * from './infrastructure/lib';
export * from './infrastructure/container';

// Presentation exports
export * from './presentation';
export { userRoutes as routes } from './presentation/routes';