import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if (import.meta.env.DEV) {
	// import("@/mocks/organization-people.mock");
	// import("@/mocks/organization-project.mock");
	// import("@/mocks/project-people.mock");
	import("@/mocks/project-roles.mock");
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
