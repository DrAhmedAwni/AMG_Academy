import { z } from 'zod';

export const createCasePostSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(10000),
  categoryId: z.string().uuid(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  images: z
    .array(
      z.object({
        storageKey: z.string().min(1),
        caption: z.string().max(500).optional(),
        orderIndex: z.number().int().min(0).default(0),
      }),
    )
    .max(10)
    .default([]),
});

export const createCaseCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const casePostFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  status: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export const createCaseCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  parentCommentId: z.string().uuid().optional(),
});

export const caseModerationSchema = z.object({
  rejectionReason: z.string().trim().max(1000).optional(),
});

export interface CreateCasePostDto {
  title: string;
  description: string;
  categoryId: string;
  tags?: string[];
  images?: { storageKey: string; caption?: string; orderIndex?: number }[];
}

export interface CreateCaseCategoryDto {
  name: string;
}

export interface CasePostFiltersDto {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  search?: string;
}

export interface CreateCaseCommentDto {
  body: string;
  parentCommentId?: string;
}

export interface CaseModerationDto {
  rejectionReason?: string;
}
