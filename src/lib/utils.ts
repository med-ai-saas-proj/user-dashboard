import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type LocaleDateFormatOptions = "numeric" | "short" | "long";

export function formatIsoToLocaleDate(
	iso: string,
	locale: string = "en",
	option: LocaleDateFormatOptions = "numeric"
): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";

	const monthDisplay = option;

	if (monthDisplay !== "numeric") {
		return new Intl.DateTimeFormat(locale, {
			day: "2-digit",
			month: monthDisplay,
			year: "numeric",
		}).format(date);
	}

	const parts = new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).formatToParts(date);

	const day = parts.find((p) => p.type === "day")?.value ?? "";
	const month = parts.find((p) => p.type === "month")?.value ?? "";
	const year = parts.find((p) => p.type === "year")?.value ?? "";

	const isEnglish = locale.toLowerCase().startsWith("en");

	return isEnglish
		? month + "/" + day + "/" + year
		: day + "/" + month + "/" + year;
}

export function formatIsoToLocaleDateTime(
	iso: string,
	locale: string = "en",
	options: LocaleDateFormatOptions = "numeric"
): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";

	const datePart = formatIsoToLocaleDate(iso, locale, options);
	const timePart = new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);

	return datePart + " " + timePart;
}
