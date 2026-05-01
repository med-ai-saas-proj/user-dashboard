import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "venera-pinned-features";

function readFromStorage(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((item): item is string => typeof item === "string")
			: [];
	} catch {
		return [];
	}
}

export function usePinnedFeatures() {
	const [pinned, setPinned] = useState<string[]>(readFromStorage);

	// Sync across tabs
	useEffect(() => {
		const onStorage = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY) {
				setPinned(readFromStorage());
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const persist = useCallback((next: string[]) => {
		setPinned(next);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {
			// localStorage unavailable; in-memory state still works for the session
		}
	}, []);

	const isPinned = useCallback((url: string) => pinned.includes(url), [pinned]);

	const togglePin = useCallback(
		(url: string) => {
			persist(
				pinned.includes(url)
					? pinned.filter((u) => u !== url)
					: [...pinned, url]
			);
		},
		[pinned, persist]
	);

	return { pinned, isPinned, togglePin };
}
