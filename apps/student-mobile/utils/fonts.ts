export const fontFamilies = {
	regular: 'Nunito_400Regular',
	semibold: 'Nunito_600SemiBold',
	bold: 'Nunito_700Bold',
	extraBold: 'Nunito_800ExtraBold',
} as const;

export const nunito = {
	regular: {
		fontFamily: fontFamilies.regular,
	},
	semibold: {
		fontFamily: fontFamilies.semibold,
	},
	bold: {
		fontFamily: fontFamilies.bold,
	},
	extraBold: {
		fontFamily: fontFamilies.extraBold,
	},
} as const;
