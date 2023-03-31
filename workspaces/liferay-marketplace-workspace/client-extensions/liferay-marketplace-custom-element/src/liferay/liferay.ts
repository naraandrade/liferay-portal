interface ILiferay {
	Service: Function;
	ThemeDisplay: {
		getCompanyId: () => string;
		getPathThemeImages: () => string;
	};
}
declare global {
	interface Window {
		Liferay: ILiferay;
	}
}

export const Liferay = window.Liferay || {
	Service: {},
	ThemeDisplay: {
		getCompanyId: () => '',
		getPathThemeImages: () => '',
	},
};
