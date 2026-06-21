import { tabs } from '@/constants/data'
import { colors, spacing } from "@/constants/theme";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, Text, View } from "react-native";

function TabButton({
                       focused,
                       label,
                       Icon,
                   }: {
    focused: boolean;
    label: string;
    Icon: any;
}) {
    if (focused) {
        return (
            <View
                // className={'w-[90%]'}
                style={{
                    flexDirection: "row",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingVertical: spacing[2],
                    paddingHorizontal: spacing[2],
                    gap: spacing[2],
                }}
            >
                <View
                    style={{
                        width: "30%",
                        height: "98%",
                        borderRadius: 15,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={16} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <Text style={{ fontFamily: "sans-bold", fontSize: 13, color: colors.primary }}>
                    {label}
                </Text>
            </View>
        );
    }

    return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} color="rgba(255,255,255,0.45)" strokeWidth={2} />
        </View>
    );
}

// Minimal inline type — just describes the shape we actually use
type CustomTabBarProps = {
    state: {
        routes: { key: string; name: string }[];
        index: number;
    };
    descriptors: Record<string, { options: { title?: string } }>;
    navigation: any;
};


function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: Math.max(insets.bottom + spacing[2], spacing[5]),
                marginHorizontal: spacing[7],
                height: "7%",
                borderRadius: 999,
                backgroundColor: colors.primary,
                flexDirection: "row",
                paddingHorizontal: spacing[3],
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            }}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const focused = state.index === index;
                const tab = tabs.find((t) => t.name === route.name);
                const Icon = tab?.icon;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!focused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        style={{
                            flex: 1,
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <TabButton
                            focused={focused}
                            label={options.title ?? route.name}
                            Icon={Icon}
                        />
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{ title: tab.title }}
                />
            ))}
        </Tabs>
    );
}