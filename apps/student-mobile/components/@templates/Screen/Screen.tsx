import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	type ScrollViewProps,
	type ViewProps,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '@/utils';

interface ScreenProps extends ScrollViewProps {
	children: React.ReactNode;
	scroll?: boolean;
	contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
	style?: ViewProps['style'];
	disableSafeArea?: boolean;
}

export const Screen = ({
	children,
	scroll = true,
	contentContainerStyle,
	style,
	disableSafeArea,
	...props
}: ScreenProps) => {
	const content = scroll ? (
		<ScrollView
			automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
			contentContainerStyle={[tw`p-5`, { flexGrow: 1 }, contentContainerStyle]}
			keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			{...props}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[tw`flex-1 p-5`, style]}>{children}</View>
	);

	return (
		<KeyboardAvoidingView behavior="padding" style={tw`flex-1`}>
			{disableSafeArea ? (
				content
			) : (
				<SafeAreaView edges={['top']} style={tw`flex-1 bg-slate-50`}>
					{content}
				</SafeAreaView>
			)}
		</KeyboardAvoidingView>
	);
};
