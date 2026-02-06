import z from "zod";

export const chiTietCLSSchema = z.object({
	ma_lk: z.string().min(1),
	stt: z.number().int(),
	ten_chi_so: z.string().min(1, "Tên chỉ số is required"),
	gia_tri: z.string().min(1, "Giá trị is required"),
	don_vi_do: z.string().min(1, "Đơn vị đo is required"),
	ngay_kq: z.string().min(1, "Ngày kết quả is required"),
});
