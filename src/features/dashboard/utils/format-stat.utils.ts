export const FormatValue = (value: number, format?: "compact" | "currency") => {
	// VND too

	switch (format) {
		case "compact":
			return new Intl.NumberFormat("en", {
				notation: "compact",
				maximumFractionDigits: 4,
			}).format(value);

		case "currency":
			return new Intl.NumberFormat("en", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 2,
			}).format(value);

		default:
			return value.toLocaleString();
	}
};
