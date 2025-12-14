export interface CreateUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  success: boolean;
  message?: string;
}