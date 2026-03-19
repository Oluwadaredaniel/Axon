import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation failed', errors });
    }
  };
};

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Workspace schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(50, 'Name too long'),
  github_repo: z.string().optional(),
  framework: z.enum(['express', 'nestjs']).optional(),
});

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(50, 'Name too long'),
  github_org: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
});

// AI schemas
export const debugSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  url: z.string().url('Invalid URL'),
  statusCode: z.number().int().min(100).max(599),
  errorMessage: z.string().optional(),
  requestBody: z.any().optional(),
  responseBody: z.any().optional(),
  codeContext: z.string().optional(),
  filePath: z.string().optional(),
  lineNumber: z.number().optional(),
  routeId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
});

// Billing schemas
export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'team']),
});

// Collection schemas
export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(50),
  workspace_id: z.string().uuid('Invalid workspace ID'),
});

// Coupon schemas
export const createCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20).toUpperCase(),
  discount_percent: z.number().int().min(1).max(100),
  max_uses: z.number().int().min(1).optional(),
  expires_at: z.string().datetime().optional(),
});