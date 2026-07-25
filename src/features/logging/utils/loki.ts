/**
 * Converts a plain-text search term into a Loki Label Filter pipeline.
 *
 * - If the input already looks like a Loki expression (contains `=` or `~`),
 *   it is returned as-is so advanced users can write raw filters.
 * - Otherwise it wraps the value in `|= "value"` (case‑insensitive substring match).
 * - An empty / whitespace-only input returns undefined.
 */
export const toLokiQuery = (raw: string): string | undefined => {
	const trimmed = raw.trim();
	if (!trimmed) return undefined;

	// Already looks like a Loki expression — pass through
	if (/[|!=~]+\s*"/.test(trimmed)) return trimmed;

	// Escape backslashes and double-quotes inside the value
	const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

	return `|= "${escaped}"`;
};
