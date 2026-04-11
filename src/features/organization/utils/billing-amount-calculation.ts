export interface ScaledAmount {
	value: number;
	scale: number;
}

export function toScaledAmount(input: string | number): ScaledAmount {
	// 1. Convert to string and clean up whitespace/currency symbols
	const cleanInput: string = input.toString().replace(/[$,]/g, "").trim();
	// 2. Defensive check: Return zero if input is empty or not a number
	if (!cleanInput || isNaN(Number(cleanInput))) {
		return { value: 0, scale: 0 };
	}
	// 3. Handle negative numbers correctly
	const isNegative = cleanInput.startsWith("-");
	const absoluteInput = isNegative ? cleanInput.slice(1) : cleanInput;
	// 4. Split into integer and decimal sections
	const [integerPart, decimalPart] = absoluteInput.split(".");
	// Case A: No decimals (e.g., "10")
	if (!decimalPart) {
		return {
			value: parseInt(integerPart, 10) * (isNegative ? -1 : 1),
			scale: 0,
		};
	}
	// Case B: Has decimals (e.g., "10.25")
	const scale = decimalPart.length;

	// Combine parts: "10" + "25" -> "1025"
	// Note: We use BigInt here if you expect extremely large numbers,
	// but Number is usually fine for billing amounts.
	const numericalString = integerPart + decimalPart;
	const value = parseInt(numericalString, 10) * (isNegative ? -1 : 1);
	return { value, scale };
}
/**
 * Optional: Reverse function to display it back to the UI
 */
export function fromScaledAmount(scaled: ScaledAmount): string {
	if (scaled.scale === 0) return scaled.value.toString();

	const actualValue = scaled.value / 10 ** scaled.scale;
	return actualValue.toLocaleString("en-US", {
		minimumFractionDigits: scaled.scale,
		maximumFractionDigits: scaled.scale,
	});
}
