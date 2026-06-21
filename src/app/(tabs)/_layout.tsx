import { tabs } from '@/constants/data'
import { colors, spacing } from "@/constants/theme";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "react-native";

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
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: 'center',
                    width: 100,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 999,
                    paddingVertical: spacing[2],
                    paddingHorizontal: spacing[4],
                    gap: spacing[2],
                }}
            >
                <View
                    style={{
                        width: 30,
                        height: 30,
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
        <View style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} color="rgba(255,255,255,0.45)" strokeWidth={2} />
        </View>
    );
}

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (

        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: "absolute",
                    left: spacing[5],
                    right: spacing[5],
                    bottom: Math.max(insets.bottom + spacing[2], spacing[5]),
                    height: 64,
                    borderRadius: 999,
                    marginHorizontal: spacing[4]*3,
                    backgroundColor: colors.primary,
                    borderTopWidth: 0,
                    borderWidth: 0,
                    elevation: 12,
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    paddingHorizontal: spacing[3],
                },

                // this is the fix — kills the default label-space margin
                tabBarIconStyle: {
                    width: "100%",
                    height: "100%",
                    margin: 0,
                    alignItems: "center",
                    justifyContent: "center",
                },

                tabBarItemStyle: {
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 0,
                },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => {
                            const Icon = tab.icon
                            return <TabButton focused={focused} label={tab.title} Icon={Icon} />;
                        },
                    }}
                />
            ))}
        </Tabs>
    );
}