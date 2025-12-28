import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';
import {
  toVnMohDateFormat,
  toVnMohDateTimeFormat,
} from '@/features/pg-ehr-summary/utils/ehr-date.utils';
import type { RxAdvisorRequest } from '@/features/rx-advisor/services/rx-advisor.dto';

export const ehrFormToRxAdvisorRequest = (
  data: EHRFormData
): RxAdvisorRequest => {
  return {
    ehr: {
      type: 'vn_moh',
      vn_moh: {
        tong_hop: {
          ...data.tong_hop,
          ngay_sinh: toVnMohDateFormat(data.tong_hop.ngay_sinh),
          ngay_vao: toVnMohDateTimeFormat(data.tong_hop.ngay_vao),
        },
        chi_tiet_thuoc: data.chi_tiet_thuoc.map((item) => ({
          ...item,
          ngay_yl: toVnMohDateTimeFormat(item.ngay_yl),
        })),
        chi_tiet_cls: data.chi_tiet_cls.map((item) => ({
          ...item,
          ngay_kq: toVnMohDateTimeFormat(item.ngay_kq),
        })),
        dien_bien_lam_sang: data.dien_bien_lam_sang.map((item) => ({
          ...item,
          thoi_diem_dbls: toVnMohDateTimeFormat(item.thoi_diem_dbls),
        })),
      },
    },
    prescription: {
      type: 'vn_moh',
      vn_moh: data.chi_tiet_thuoc.map((item) => ({
        ...item,
        ngay_yl: toVnMohDateTimeFormat(item.ngay_yl),
      })),
    },
    stream: false,
  };
};
