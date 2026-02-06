import z from "zod";

export const dienBienLamSangSchema = z.object({
	ma_lk: z.string().min(1),
	stt: z.number().int(),
	dien_bien_ls: z.string().min(1, "Diễn biến lâm sàng is required"),
	thoi_diem_dbls: z.string().min(1, "Thời điểm is required"),
	nguoi_thuc_hien: z.string().min(1, "Người thực hiện is required"),
});
