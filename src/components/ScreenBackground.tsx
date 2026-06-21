import { Image } from "expo-image";
import { View, ViewStyle } from "react-native";
import { ReactNode } from "react";

type ScreenBackgroundProps = {
    children: ReactNode;
    style?: ViewStyle;
};

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
    return (
        <View style={[{ flex: 1 }, style]}>
            <Image
                source={require("@/assets/images/bgg.jpg")}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                contentFit="cover"
            />
            {children}
        </View>
    );
}