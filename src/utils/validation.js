import { z } from 'zod';

// Transaction validation schema
export const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  description: z.string().min(1, 'Description required').max(200, 'Description too long').trim(),
  category: z.string().min(1, 'Category required').max(50, 'Category too long').trim(),
  date: z.string().datetime().or(z.date()),
  paymentMethod: z.string().max(50, 'Payment method too long').trim().optional(),
  userId: z.string().min(1, 'User ID required')
});

// Envelope validation schema
export const envelopeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name required').max(100, 'Name too long').trim(),
  budgetAmount: z.number().min(0, 'Budget must be non-negative').max(1000000, 'Budget too large'),
  currentAmount: z.number().min(0, 'Current amount must be non-negative').max(1000000, 'Amount too large'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  userId: z.string().min(1, 'User ID required')
});

// Budget allocation validation schema
export const budgetAllocationSchema = z.object({
  totalBudget: z.number().positive('Total budget must be positive').max(10000000, 'Budget too large'),
  allocations: z.array(z.object({
    envelopeId: z.string().min(1, 'Envelope ID required'),
    amount: z.number().min(0, 'Amount must be non-negative').max(1000000, 'Amount too large')
  })),
  userId: z.string().min(1, 'User ID required')
});

// User profile validation schema
export const userProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name required').max(100, 'Name too long').trim(),
  email: z.string().email('Invalid email format'),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
  timezone: z.string().max(50, 'Timezone too long').optional()
});

// Quick expense validation schema
export const quickExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(10000, 'Amount too large'),
  description: z.string().min(1, 'Description required').max(100, 'Description too long').trim(),
  envelopeId: z.string().min(1, 'Envelope required'),
  userId: z.string().min(1, 'User ID required')
});

// Validation helper functions
export const validateTransaction = (data) => {
  try {
    return { success: true, data: transactionSchema.parse(data) };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};

export const validateEnvelope = (data) => {
  try {
    return { success: true, data: envelopeSchema.parse(data) };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};

export const validateBudgetAllocation = (data) => {
  try {
    return { success: true, data: budgetAllocationSchema.parse(data) };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};

export const validateUserProfile = (data) => {
  try {
    return { success: true, data: userProfileSchema.parse(data) };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};

export const validateQuickExpense = (data) => {
  try {
    return { success: true, data: quickExpenseSchema.parse(data) };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};