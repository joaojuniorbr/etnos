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

type ScreenProps = {
	children: React.ReactNode;
	scroll?: boolean;
	contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
	style?: ViewProps['style'];
};

export const Screen = ({
	children,
	scroll = true,
	contentContainerStyle,
	style,
}: ScreenProps) => {
	const content = scroll ? (
		<ScrollView
			automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
			contentContainerStyle={[tw`p-5`, { flexGrow: 1 }, contentContainerStyle]}
			keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[tw`flex-1 p-5`, style]}>{children}</View>
	);

	return (
		<SafeAreaView style={tw`flex-1 bg-slate-50`}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={tw`flex-1`}
			>
				{content}
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};
