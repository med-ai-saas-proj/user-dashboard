export type APIKey = {
	id: string;
	name: string;
	description: string;
	hint: string; // Masked secret key from API
	createdAt: Date;
	permissions: string[];
};
