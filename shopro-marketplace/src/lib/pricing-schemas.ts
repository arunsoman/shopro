import { z } from 'zod';

export const markupRuleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  targetType: z.enum(['GLOBAL', 'GROUP', 'SUBGROUP', 'ITEM']),
  targetValue: z.string().optional().nullable(),
  subgroupValue: z.string().optional().nullable(),
  markupValue: z.coerce.number().refine(v => v >= 0, 'Value must be positive'),
  markupType: z.enum(['PERCENTAGE', 'FLAT']),
  isActive: z.boolean().default(true),
  priority: z.number().optional(),
});

export type MarkupRuleFormData = z.infer<typeof markupRuleSchema>;
