import { useState, useEffect, useCallback } from "react";

const STYLE_KEY = "venera-style-theme";

export type StyleTheme = "default" | "clinical";

export function useStyleTheme() {
	const [style, setStyleState] = useState<StyleTheme>(() => {
		if (typeof window === "undefined") return "default";
		return (localStorage.getItem(STYLE_KEY) as StyleTheme) || "default";
	});

	useEffect(() => {
		const root = document.documentElement;
		if (style === "clinical") {
			root.classList.add("theme-clinical");
		} else {
			root.classList.remove("theme-clinical");
		}
		localStorage.setItem(STYLE_KEY, style);
	}, [style]);

	// Initialize on mount
	useEffect(() => {
		const saved = localStorage.getItem(STYLE_KEY) as StyleTheme;
		if (saved === "clinical") {
			document.documentElement.classList.add("theme-clinical");
		}
	}, []);

	const toggleStyle = useCallback(() => {
		setStyleState((prev) => (prev === "default" ? "clinical" : "default"));
	}, []);

	const setStyle = useCallback((s: StyleTheme) => {
		setStyleState(s);
	}, []);

	return { style, toggleStyle, setStyle };
}
