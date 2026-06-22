import type {
    Context,
    CurrentContext,
    EnergyLevel,
} from "@/types";

import {
    Pressable,
    Text,
    View,
} from "react-native";

type CurrentContextSelectorProps = {
    contexts: Context[];
    value: CurrentContext;

    onChange: (
        nextContext: CurrentContext
    ) => void;
};

const ENERGY_OPTIONS: {
    label: string;
    value: EnergyLevel;
}[] = [
    {
        label: "Any",
        value: "any",
    },
    {
        label: "Low",
        value: "low",
    },
    {
        label: "High",
        value: "high",
    },
];

export default function CurrentContextSelector({
                                                   contexts,
                                                   value,
                                                   onChange,
                                               }: CurrentContextSelectorProps) {
    function selectContext(
        contextId: string | undefined
    ) {
        onChange({
            ...value,
            contextId,
            source: "manual",
            detectedAt: new Date().toISOString(),
        });
    }

    function selectEnergy(
        energyLevel: EnergyLevel
    ) {
        onChange({
            ...value,
            energyLevel,
            source: "manual",
            detectedAt: new Date().toISOString(),
        });
    }

    return (
        <View className="rounded-[28px] border border-zinc-800 bg-[#11161D] p-5">
            <View className="flex-row items-start justify-between">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-white">
                        Current context
                    </Text>

                    <Text className="mt-1 text-sm leading-5 text-zinc-500">
                        Tell TimeSphere where you are and how
                        much energy you have right now.
                    </Text>
                </View>

                <View className="rounded-full bg-blue-500/10 px-3 py-2">
                    <Text className="text-xs font-bold text-blue-400">
                        Manual
                    </Text>
                </View>
            </View>

            <Text className="mb-3 mt-6 text-sm font-sans-semibold text-zinc-300">
                Where are you?
            </Text>

            <View className="flex-row flex-wrap gap-2">
                <Pressable
                    onPress={() => selectContext(undefined)}
                    className={`rounded-full px-4 py-3 ${
                        value.contextId === undefined
                            ? "bg-white"
                            : "border border-zinc-700 bg-zinc-900"
                    }`}
                >
                    <Text
                        className={`font-sans-semibold ${
                            value.contextId === undefined
                                ? "text-zinc-950"
                                : "text-zinc-400"
                        }`}
                    >
                        No specific place
                    </Text>
                </Pressable>

                {contexts.map((context) => {
                    const selected =
                        value.contextId === context.id;

                    return (
                        <Pressable
                            key={context.id}
                            onPress={() =>
                                selectContext(context.id)
                            }
                            className={`rounded-full px-4 py-3 ${
                                selected
                                    ? "bg-white"
                                    : "border border-zinc-700 bg-zinc-900"
                            }`}
                        >
                            <Text
                                className={`font-sans-semibold ${
                                    selected
                                        ? "text-zinc-950"
                                        : "text-zinc-400"
                                }`}
                            >
                                {context.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <Text className="mb-3 mt-6 text-sm font-semibold text-zinc-300">
                Current energy
            </Text>

            <View className="flex-row gap-2">
                {ENERGY_OPTIONS.map((option) => {
                    const selected =
                        value.energyLevel === option.value;

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() =>
                                selectEnergy(option.value)
                            }
                            className={`flex-1 items-center rounded-2xl py-4 ${
                                selected
                                    ? "bg-white"
                                    : "border border-zinc-700 bg-zinc-900"
                            }`}
                        >
                            <Text
                                className={`font-bold ${
                                    selected
                                        ? "text-zinc-950"
                                        : "text-zinc-400"
                                }`}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}