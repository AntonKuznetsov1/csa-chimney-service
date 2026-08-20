const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// config.js
// config.js

export const API_BASE_URL = configuredApiUrl
	.trim()
	.replace(/^VITE_API_BASE_URL=/, '')
	.replace(/\/+$/, '')
	.replace(/\/api$/, '');