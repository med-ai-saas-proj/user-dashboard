import { PlusIcon, Trash2Icon } from "lucide-react";
import type {
	FieldArrayWithId,
	FieldErrors,
	UseFieldArrayAppend,
	UseFieldArrayReturn,
	UseFormRegister,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/shadcn/accordion";
import { Button } from "@/components/shadcn/button";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import type { EHRFormData } from "@/features/pg-ehr-summary/ehr-form.type";

type MedicationSectionProps = {
	register: UseFormRegister<EHRFormData>;
	errors: FieldErrors<EHRFormData>;
	fields: FieldArrayWithId<EHRFormData, "chi_tiet_thuoc", "id">[];
	append: UseFieldArrayAppend<EHRFormData, "chi_tiet_thuoc">;
	remove: UseFieldArrayReturn["remove"];
};

export function MedicationSection({
	register,
	errors,
	fields,
	append,
	remove,
}: MedicationSectionProps) {
	const { t } = useTranslation("medication");

	const handleAddMedication = () => {
		append({
			ma_lk: "",
			stt: fields.length + 1,
			ten_thuoc: "",
			ham_luong: "",
			lieu_dung: "",
			cach_dung: "",
			so_luong: "",
			ngay_yl: "",
			ma_bac_si: "",
		});
	};

	return (
		<FieldSet>
			<div className="flex items-center justify-between mb-3">
				<FieldLegend>{t("legend")}</FieldLegend>
				<Button
					type="button"
					size="sm"
					onClick={handleAddMedication}
					className="gap-2"
				>
					<PlusIcon className="size-4" />
					{t("action.addEntry")}
				</Button>
			</div>
			<FieldGroup>
				<Accordion type="multiple" className="w-full">
					{fields.map((field, index) => (
						<AccordionItem key={field.id} value={`medication-${index}`}>
							<AccordionTrigger>
								<div className="flex items-center gap-2">
									<span>{t("entryTitle", { index: index + 1 })}</span>
									{errors.chi_tiet_thuoc?.[index] && (
										<span className="text-destructive text-xs">
											{t("hasError")}
										</span>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<Field>
											<FieldLabel htmlFor={`chi_tiet_thuoc.${index}.ten_thuoc`}>
												{t("fields.name")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`chi_tiet_thuoc.${index}.ten_thuoc`}
													aria-invalid={
														!!errors.chi_tiet_thuoc?.[index]?.ten_thuoc
													}
													{...register(`chi_tiet_thuoc.${index}.ten_thuoc`)}
												/>
												<FieldError
													errors={[errors.chi_tiet_thuoc?.[index]?.ten_thuoc]}
												/>
											</FieldContent>
										</Field>

										<Field>
											<FieldLabel htmlFor={`chi_tiet_thuoc.${index}.ham_luong`}>
												{t("fields.strength")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`chi_tiet_thuoc.${index}.ham_luong`}
													aria-invalid={
														!!errors.chi_tiet_thuoc?.[index]?.ham_luong
													}
													{...register(`chi_tiet_thuoc.${index}.ham_luong`)}
												/>
												<FieldError
													errors={[errors.chi_tiet_thuoc?.[index]?.ham_luong]}
												/>
											</FieldContent>
										</Field>

										<Field>
											<FieldLabel htmlFor={`chi_tiet_thuoc.${index}.lieu_dung`}>
												{t("fields.dose")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`chi_tiet_thuoc.${index}.lieu_dung`}
													aria-invalid={
														!!errors.chi_tiet_thuoc?.[index]?.lieu_dung
													}
													{...register(`chi_tiet_thuoc.${index}.lieu_dung`)}
												/>
												<FieldError
													errors={[errors.chi_tiet_thuoc?.[index]?.lieu_dung]}
												/>
											</FieldContent>
										</Field>

										<Field>
											<FieldLabel htmlFor={`chi_tiet_thuoc.${index}.cach_dung`}>
												{t("fields.route")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`chi_tiet_thuoc.${index}.cach_dung`}
													aria-invalid={
														!!errors.chi_tiet_thuoc?.[index]?.cach_dung
													}
													{...register(`chi_tiet_thuoc.${index}.cach_dung`)}
												/>
												<FieldError
													errors={[errors.chi_tiet_thuoc?.[index]?.cach_dung]}
												/>
											</FieldContent>
										</Field>

										<Field>
											<FieldLabel htmlFor={`chi_tiet_thuoc.${index}.so_luong`}>
												{t("fields.quantity")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`chi_tiet_thuoc.${index}.so_luong`}
													aria-invalid={
														!!errors.chi_tiet_thuoc?.[index]?.so_luong
													}
													{...register(`chi_tiet_thuoc.${index}.so_luong`)}
												/>
												<FieldError
													errors={[errors.chi_tiet_thuoc?.[index]?.so_luong]}
												/>
											</FieldContent>
										</Field>

										<Field>
											<FieldLabel htmlFor={`chi_tiet_thuoc.${index}.ma_bac_si`}>
												{t("fields.prescriberId")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`chi_tiet_thuoc.${index}.ma_bac_si`}
													aria-invalid={
														!!errors.chi_tiet_thuoc?.[index]?.ma_bac_si
													}
													{...register(`chi_tiet_thuoc.${index}.ma_bac_si`)}
												/>
												<FieldError
													errors={[errors.chi_tiet_thuoc?.[index]?.ma_bac_si]}
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
											{t("action.removeEntry")}
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
