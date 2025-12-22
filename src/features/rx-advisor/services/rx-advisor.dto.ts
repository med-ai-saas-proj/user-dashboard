import type {
  ChiTietCLS,
  ChiTietThuoc,
  DienBienLamSang,
  TongHop,
} from '@/features/pg-ehr-summary/ehr-form.type';

export type RxAdvisorRequest = {
  ehr: {
    type: 'vn_moh';
    vn_moh: {
      tong_hop: TongHop;
      chi_tiet_thuoc: ChiTietThuoc[];
      chi_tiet_cls: ChiTietCLS[];
      dien_bien_lam_sang: DienBienLamSang[];
    };
  };
  prescription: {
    type: 'vn_moh';
    vn_moh: ChiTietThuoc[];
  };
  stream?: boolean;
};
export type UsedTool = {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
};
export type RxAdvisorResponse = {
  analysis: string;
  reasoning: string | null;
  used_tools: UsedTool[];
};
