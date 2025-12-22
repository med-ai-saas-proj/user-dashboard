// ehr-summary.mapper.ts

import type {
  EHRSummaryRequest,
  RxAdvisorRequest,
} from '@/features/pg-ehr-summary/api/ehr-summary.dto';
import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';

export const ehrFormToSummaryRequest = (
  data: EHRFormData
): EHRSummaryRequest => {
  return {
    ehr: {
      type: 'vn_moh',
      vn_moh: {
        tong_hop: data.tong_hop,
        chi_tiet_thuoc: data.chi_tiet_thuoc,
        chi_tiet_cls: data.chi_tiet_cls,
        dien_bien_lam_sang: data.dien_bien_lam_sang,
      },
    },
    stream: false,
  };
};

export const ehrFormToRxAdvisorRequest = (
  data: EHRFormData
): RxAdvisorRequest => {
  return {
    ehr: {
      type: 'vn_moh',
      vn_moh: {
        tong_hop: data.tong_hop,
        chi_tiet_thuoc: data.chi_tiet_thuoc,
        chi_tiet_cls: data.chi_tiet_cls,
        dien_bien_lam_sang: data.dien_bien_lam_sang,
      },
    },
    prescription: {
      type: 'vn_moh',
      vn_moh: data.chi_tiet_thuoc,
    },
    stream: false,
  };
};
