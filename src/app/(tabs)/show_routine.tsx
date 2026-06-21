// src/app/(tabs)/showroutine.tsx

import { useCallback, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Switch,
    Text,
    View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import type {
    Context,
    Routine,
    RoutineBlock,
    WeekDay,
} from "@/types";
import { contexts } from '@/constants/contexts'

import { getRoutines, setRoutineEnabled } from "@/services/routineStorage";
import { formatMinutes } from "@/components/TimePicker";
import {ScreenBackground} from "@/components/ScreenBackground";

const DAY_LABELS: Record<WeekDay, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
};

function getContextName(contextId: string): string {
    const context = contexts.find(
        (item) => item.id === contextId
    );

    return context?.name ?? "Unknown context";
}

function getBlockName(block: RoutineBlock): string {
    if (block.name?.trim()) {
        return block.name;
    }

    return getContextName(block.contextId);
}

function RoutineBlockCard({
                              block,
                          }: {
    block: RoutineBlock;
}) {
    const contextName = getContextName(block.contextId);

    return (
        <View className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text className="text-base font-bold text-white">
                        {getBlockName(block)}
                    </Text>

                    <Text className="mt-1 text-sm text-zinc-500">
                        {contextName}
                    </Text>
                </View>

                <View className="rounded-full bg-white/10 px-3 py-2">
                    <Text className="text-sm font-semibold text-zinc-200">
                        {formatMinutes(block.startMinutes)}
                    </Text>
                </View>
            </View>

            <View className="mt-4 flex-row items-center">
                <View className="h-3 w-3 rounded-full bg-white" />

                <View className="mx-2 h-[1px] flex-1 bg-zinc-700" />

                <View className="h-3 w-3 rounded-full border-2 border-zinc-500" />
            </View>

            <View className="mt-2 flex-row justify-between">
                <Text className="text-xs text-zinc-500">
                    Start
                </Text>

                <Text className="text-xs text-zinc-500">
                    Ends {formatMinutes(block.endMinutes)}
                </Text>
            </View>
        </View>
    );
}

function RoutineCard({
                         routine,
                         onEnabledChange
                     }: {
    routine: Routine;
    onEnabledChange: (
        routineId: string,
        enabled: boolean
    ) => void;
}) {
    const orderedBlocks = [...routine.blocks].sort(
        (first, second) =>
            first.startMinutes - second.startMinutes
    );

    return (
        <View
            className={`rounded-[28px] border p-5 ${
                routine.enabled
                    ? "border-zinc-800 bg-[#11161D]"
                    : "border-zinc-800 bg-[#11161D] opacity-60"
            }`}
        >
            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text className="text-xl font-bold text-white">
                        {routine.name}
                    </Text>

                    <Text className="mt-1 text-sm text-zinc-500">
                        {routine.blocks.length}{" "}
                        {routine.blocks.length === 1
                            ? "block"
                            : "blocks"}
                    </Text>
                </View>

                <View className="items-end">
                    <Switch
                        value={routine.enabled}
                        onValueChange={(enabled) =>
                            onEnabledChange(
                                routine.id,
                                enabled
                            )
                        }
                        trackColor={{
                            false: "#3F3F46",
                            true: "#10B981",
                        }}
                        thumbColor="#FFFFFF"
                    />

                    <Text
                        className={`mt-1 text-xs font-bold ${
                            routine.enabled
                                ? "text-emerald-400"
                                : "text-zinc-500"
                        }`}
                    >
                        {routine.enabled
                            ? "Active"
                            : "Paused"}
                    </Text>
                </View>
            </View>

            <View className="mt-5 flex-row flex-wrap gap-2">
                {routine.days.map((day) => (
                    <View
                        key={day}
                        className={`rounded-full px-3 py-2 ${
                            routine.enabled
                                ? "bg-white"
                                : "bg-zinc-800"
                        }`}
                    >
                        <Text
                            className={`text-xs font-bold ${
                                routine.enabled
                                    ? "text-zinc-950"
                                    : "text-zinc-500"
                            }`}
                        >
                            {DAY_LABELS[day]}
                        </Text>
                    </View>
                ))}
            </View>

            <View className="mt-5 gap-3">
                {orderedBlocks.map((block) => (
                    <RoutineBlockCard
                        key={block.id}
                        block={block}
                    />
                ))}
            </View>
        </View>
    );
}

export default function ShowRoutineScreen() {
    const [routines, setRoutines] = useState<Routine[]>(
        []
    );

    const [loading, setLoading] = useState(true);

    const loadRoutines = useCallback(() => {
        try {
            const storedRoutines = getRoutines();

            setRoutines(storedRoutines);
        } catch (error) {
            console.error(
                "Failed to load routines:",
                error
            );

            setRoutines([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadRoutines();
        }, [loadRoutines])
    );

    function handleRoutineEnabledChange(
        routineId: string,
        enabled: boolean
    ) {
        const updatedRoutine =
            setRoutineEnabled(
                routineId,
                enabled
            );

        if (!updatedRoutine) {
            Alert.alert(
                "Routine not found",
                "This routine could not be updated."
            );

            return;
        }

        setRoutines((currentRoutines) =>
            currentRoutines.map((routine) =>
                routine.id === routineId
                    ? updatedRoutine
                    : routine
            )
        );
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#090D12]">
                <Text className="text-base text-zinc-400">
                    Loading routines...
                </Text>
            </View>
        );
    }

    return (
<ScreenBackground>
        <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-32 pt-16"
            showsVerticalScrollIndicator={false}
        >
            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text className="text-4xl font-bold tracking-tight text-white">
                        Your routines
                    </Text>

                    <Text className="mt-3 text-base leading-6 text-zinc-400">
                        See how your day is divided into different
                        contexts.
                    </Text>
                </View>

                <Pressable
                    onPress={() => router.push("/add_routine")}
                    className="h-12 w-12 items-center justify-center rounded-full bg-white"
                >
                    <Text className="text-2xl font-medium text-zinc-950">
                        +
                    </Text>
                </Pressable>
            </View>

            {routines.length === 0 ? (
                <View className="mt-16 items-center rounded-[28px] border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-white/10">
                        <Text className="text-3xl">🗓️</Text>
                    </View>

                    <Text className="mt-5 text-xl font-bold text-white">
                        No routine yet
                    </Text>

                    <Text className="mt-2 text-center text-base leading-6 text-zinc-400">
                        Create a routine to help TimeSphere understand
                        how your day usually flows.
                    </Text>

                    <Pressable
                        onPress={() => router.push("/add_routine")}
                        className="mt-6 rounded-2xl bg-white px-6 py-4"
                    >
                        <Text className="font-bold text-zinc-950">
                            Create routine
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <View className="mt-8 gap-5">
                    {routines.map((routine) => (
                        <RoutineCard
                            key={routine.id}
                            routine={routine}
                            onEnabledChange={
                                handleRoutineEnabledChange
                            }
                        />
                    ))}
                </View>
            )}
        </ScrollView>
</ScreenBackground>
    );
}