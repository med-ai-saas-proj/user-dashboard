import z from 'zod';
import { chiTietCLSSchema } from '@/features/pg-ehr-summary/schemas/chi-tiet-clss-schema';
import { chiTietThuocSchema } from '@/features/pg-ehr-summary/schemas/chi-tiet-thuoc.schema';
import { dienBienLamSangSchema } from '@/features/pg-ehr-summary/schemas/dien-bien-lam-sang.schema';
import { tongHopSchema } from '@/features/pg-ehr-summary/schemas/tong-hop.schema';

export const ehrFormSchema = z.object({
  tong_hop: tongHopSchema,
  chi_tiet_thuoc: z.array(chiTietThuocSchema),
  chi_tiet_cls: z.array(chiTietCLSSchema),
  dien_bien_lam_sang: z.array(dienBienLamSangSchema),
});
export type EHRFormData = z.infer<typeof ehrFormSchema>;
