export const Liferay = window.Liferay || {
	Service: {},
	ThemeDisplay: {
		getCompanyId: () => null,
		getPathThemeImages: () => null,
	},
	detach: (type, callback) => window.removeEventListener(type, callback),
	on: (type, callback) => window.addEventListener(type, callback),
};
