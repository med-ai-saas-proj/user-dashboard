import z from "zod";

export const chiTietThuocSchema = z.object({
	ma_lk: z.string().min(1),
	stt: z.number().int(),
	ten_thuoc: z.string().min(1, "Tên thuốc is required"),
	ham_luong: z.string().min(1, "Hàm lượng is required"),
	lieu_dung: z.string().min(1, "Liều dùng is required"),
	cach_dung: z.string().min(1, "Cách dùng is required"),
	so_luong: z.string().min(1, "Số lượng is required"),
	ngay_yl: z.string().min(1, "Ngày y lệnh is required"),
	ma_bac_si: z.string().min(1, "Mã bác sĩ is required"),
});
