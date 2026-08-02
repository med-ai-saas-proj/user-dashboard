export const startOfDay = (date: Date): Date => {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
};

export const endOfDay = (date: Date): Date => {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
};

/**
 * Chuẩn hoá 1 khoảng ngày về đúng biên 24h.
 * - Chọn 1 ngày  -> 00:00:00.000 đến 23:59:59.999 của ngày đó
 * - Chọn 2 ngày  -> 00:00:00.000 của ngày đầu đến 23:59:59.999 của ngày cuối
 * - Tự đảo chiều nếu from > to
 */
export const normalizeDayRange = (
	from: Date,
	to?: Date
): { start: string; end: string } => {
	const a = startOfDay(from);
	const b = endOfDay(to ?? from);

	if (a.getTime() > b.getTime()) {
		return {
			start: startOfDay(to ?? from).toISOString(),
			end: endOfDay(from).toISOString(),
		};
	}

	return { start: a.toISOString(), end: b.toISOString() };
};
