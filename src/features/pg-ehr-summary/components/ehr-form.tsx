import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/shadcn/button';
import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';
import { ehrFormSchema } from '@/features/pg-ehr-summary/schemas/ehr-form.schema';
import { ClinicalProgressSection } from './clinical-progress-section';
import { LabResultsSection } from './lab-results-section';
import { MedicationSection } from './medication-section';
import { PatientInfoSection } from './patient-info-section';

const defaultValues: EHRFormData = {
  tong_hop: {
    ma_lk: '70223256',
    ma_bn: '70223256',
    ho_ten: 'Mai Lý Thị',
    ngay_sinh: '1961-08-20',
    gioi_tinh: 2,
    ma_quoctich: 'VN',
    ma_nghe_nghiep: 'GV',
    dia_chi: 'Số 47 Phố Tràng Tiền, Tòa tháp A, Tây Hồ, Hà Nội, Việt Nam',
    dien_thoai: '0039 512 62 01',
    ngay_vao: '2023-05-15 07:30',
    chan_doan_rv: 'Bệnh đái tháo đường không phụ thuộc insulin',
    ma_benh_chinh: 'E11',
    ket_qua_dtri: 1,
    ma_loai_kcb: 1,
    ma_cskcb: 'BACHMAI',
    can_nang: '59.0',
  },
  chi_tiet_thuoc: [
    {
      ma_lk: '70223256',
      stt: 1,
      ten_thuoc: 'Gliclazide (Diamicron MR 60mg)',
      ham_luong: '60mg',
      lieu_dung: '1 viên/lần',
      cach_dung: 'Uống',
      so_luong: '1',
      ngay_yl: '2023-05-15 09:10',
      ma_bac_si: 'Mai Thanh Dung',
    },
    {
      ma_lk: '70223256',
      stt: 2,
      ten_thuoc: 'Atorvastatin (Atrox 10)',
      ham_luong: '10mg',
      lieu_dung: '1 viên/lần',
      cach_dung: 'Uống',
      so_luong: '1',
      ngay_yl: '2023-05-15 09:10',
      ma_bac_si: 'Mai Thanh Dung',
    },
    {
      ma_lk: '70223256',
      stt: 3,
      ten_thuoc: 'Metformin hydroclorid (Metformin Stella)',
      ham_luong: '1000mg',
      lieu_dung: '1 viên/lần',
      cach_dung: 'Uống',
      so_luong: '2',
      ngay_yl: '2023-05-15 09:10',
      ma_bac_si: 'Mai Thanh Dung',
    },
  ],
  chi_tiet_cls: [
    {
      ma_lk: '70223256',
      stt: 1,
      ten_chi_so: 'Glucose máu',
      gia_tri: '9.5',
      don_vi_do: 'mmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
    {
      ma_lk: '70223256',
      stt: 2,
      ten_chi_so: 'Cholesterol toàn phần',
      gia_tri: '5.78',
      don_vi_do: 'mmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
    {
      ma_lk: '70223256',
      stt: 3,
      ten_chi_so: 'Triglycerid',
      gia_tri: '1.26',
      don_vi_do: 'mmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
    {
      ma_lk: '70223256',
      stt: 4,
      ten_chi_so: 'Creatinin máu',
      gia_tri: '86',
      don_vi_do: 'µmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
  ],
  dien_bien_lam_sang: [
    {
      ma_lk: '70223256',
      stt: 1,
      dien_bien_ls: 'Bệnh nhân tỉnh, sinh hiệu ổn định, đường huyết tăng.',
      thoi_diem_dbls: '2023-05-15 07:30',
      nguoi_thuc_hien: 'Lý Thùy Hoa',
    },
  ],
};

const EHRForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EHRFormData>({
    resolver: zodResolver(ehrFormSchema),
    defaultValues,
  });

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication,
  } = useFieldArray({
    control,
    name: 'chi_tiet_thuoc',
  });

  const {
    fields: labResultFields,
    append: appendLabResult,
    remove: removeLabResult,
  } = useFieldArray({
    control,
    name: 'chi_tiet_cls',
  });

  const {
    fields: clinicalProgressFields,
    append: appendClinicalProgress,
    remove: removeClinicalProgress,
  } = useFieldArray({
    control,
    name: 'dien_bien_lam_sang',
  });

  const onSubmit = (data: EHRFormData) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <PatientInfoSection register={register} errors={errors} />

      <MedicationSection
        register={register}
        errors={errors}
        fields={medicationFields}
        append={appendMedication}
        remove={removeMedication}
      />

      <LabResultsSection
        register={register}
        errors={errors}
        fields={labResultFields}
        append={appendLabResult}
        remove={removeLabResult}
      />

      <ClinicalProgressSection
        register={register}
        errors={errors}
        fields={clinicalProgressFields}
        append={appendClinicalProgress}
        remove={removeClinicalProgress}
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default EHRForm;
