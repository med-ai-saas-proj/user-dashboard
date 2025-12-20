export type TongHop = {
  ma_lk: string;
  ma_bn: string;
  ho_ten: string;
  ngay_sinh: string;
  gioi_tinh: number;
  ma_quoctich: string;
  ma_nghe_nghiep: string;
  dia_chi: string;
  dien_thoai: string;
  ngay_vao: string;
  chan_doan_rv: string;
  ma_benh_chinh: string;
  ket_qua_dtri: number;
  ma_loai_kcb: number;
  ma_cskcb: string;
  can_nang: string;
};

export type ChiTietThuoc = {
  ma_lk: string;
  stt: number;
  ten_thuoc: string;
  ham_luong: string;
  lieu_dung: string;
  cach_dung: string;
  so_luong: string;
  ngay_yl: string;
  ma_bac_si: string;
};

export type ChiTietCLS = {
  ma_lk: string;
  stt: number;
  ten_chi_so: string;
  gia_tri: string;
  don_vi_do: string;
  ngay_kq: string;
};

export type DienBienLamSang = {
  ma_lk: string;
  stt: number;
  dien_bien_ls: string;
  thoi_diem_dbls: string;
  nguoi_thuc_hien: string;
};

export type EHRFormData = {
  tong_hop: TongHop;
  chi_tiet_thuoc: ChiTietThuoc[];
  chi_tiet_cls: ChiTietCLS[];
  dien_bien_lam_sang: DienBienLamSang[];
};
