import { PlusIcon, Trash2Icon } from 'lucide-react';
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayReturn,
  UseFormRegister,
} from 'react-hook-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/accordion';
import { Button } from '@/components/shadcn/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/shadcn/field';
import { Input } from '@/components/shadcn/input';
import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';

type LabResultsSectionProps = {
  register: UseFormRegister<EHRFormData>;
  errors: FieldErrors<EHRFormData>;
  fields: FieldArrayWithId<EHRFormData, 'chi_tiet_cls', 'id'>[];
  append: UseFieldArrayAppend<EHRFormData, 'chi_tiet_cls'>;
  remove: UseFieldArrayReturn['remove'];
};

export function LabResultsSection({
  register,
  errors,
  fields,
  append,
  remove,
}: LabResultsSectionProps) {
  const handleAddLabResult = () => {
    append({
      ma_lk: '',
      stt: fields.length + 1,
      ten_chi_so: '',
      gia_tri: '',
      don_vi_do: '',
      ngay_kq: '',
    });
  };

  return (
    <FieldSet>
      <div className="flex items-center justify-between mb-3">
        <FieldLegend>Chi tiết cận lâm sàng</FieldLegend>
        <Button
          type="button"
          size="sm"
          onClick={handleAddLabResult}
          className="gap-2"
        >
          <PlusIcon className="size-4" />
          Thêm xét nghiệm
        </Button>
      </div>
      <FieldGroup>
        <Accordion type="multiple" className="w-full">
          {fields.map((field, index) => (
            <AccordionItem key={field.id} value={`lab-result-${index}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span>Xét nghiệm {index + 1}</span>
                  {errors.chi_tiet_cls?.[index] && (
                    <span className="text-destructive text-xs">(Có lỗi)</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel htmlFor={`chi_tiet_cls.${index}.ten_chi_so`}>
                        Tên chỉ số
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={`chi_tiet_cls.${index}.ten_chi_so`}
                          aria-invalid={
                            !!errors.chi_tiet_cls?.[index]?.ten_chi_so
                          }
                          {...register(`chi_tiet_cls.${index}.ten_chi_so`)}
                        />
                        <FieldError
                          errors={[errors.chi_tiet_cls?.[index]?.ten_chi_so]}
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`chi_tiet_cls.${index}.gia_tri`}>
                        Giá trị
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={`chi_tiet_cls.${index}.gia_tri`}
                          aria-invalid={!!errors.chi_tiet_cls?.[index]?.gia_tri}
                          {...register(`chi_tiet_cls.${index}.gia_tri`)}
                        />
                        <FieldError
                          errors={[errors.chi_tiet_cls?.[index]?.gia_tri]}
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`chi_tiet_cls.${index}.don_vi_do`}>
                        Đơn vị đo
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={`chi_tiet_cls.${index}.don_vi_do`}
                          aria-invalid={
                            !!errors.chi_tiet_cls?.[index]?.don_vi_do
                          }
                          {...register(`chi_tiet_cls.${index}.don_vi_do`)}
                        />
                        <FieldError
                          errors={[errors.chi_tiet_cls?.[index]?.don_vi_do]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="gap-2"
                    >
                      <Trash2Icon className="size-4" />
                      Xóa xét nghiệm
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FieldGroup>
    </FieldSet>
  );
}
