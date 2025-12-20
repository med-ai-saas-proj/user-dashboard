import z from 'zod';

export const tongHopSchema = z.object({
  ma_lk: z.string().min(1, 'Mã liên kết is required'),
  ma_bn: z.string().min(1, 'Mã bệnh nhân is required'),
  ho_ten: z.string().min(1, 'Họ tên is required'),
  ngay_sinh: z.string().min(1, 'Ngày sinh is required'),
  gioi_tinh: z.number().int().min(1).max(2),
  ma_quoctich: z.string().min(1, 'Mã quốc tịch is required'),
  ma_nghe_nghiep: z.string().min(1, 'Mã nghề nghiệp is required'),
  dia_chi: z.string().min(1, 'Địa chỉ is required'),
  dien_thoai: z.string().min(1, 'Điện thoại is required'),
  ngay_vao: z.string().min(1, 'Ngày vào is required'),
  chan_doan_rv: z.string().min(1, 'Chẩn đoán is required'),
  ma_benh_chinh: z.string().min(1, 'Mã bệnh chính is required'),
  ket_qua_dtri: z.number().int(),
  ma_loai_kcb: z.number().int(),
  ma_cskcb: z.string().min(1, 'Mã cơ sở khám chữa bệnh is required'),
  can_nang: z.string().min(1, 'Cân nặng is required'),
});
