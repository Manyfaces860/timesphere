// components/CreateRoutine.tsx

import React, { useMemo, useState, useRef } from "react";
import TimePicker, {formatMinutes} from "@/components/TimePicker";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import type {
    Context,
    Routine,
    RoutineBlock,
    WeekDay,
} from "@/types/index";

type CreateRoutineProps = {
    contexts: Context[];
    onSave: (routine: Routine) => void;
};

const WEEK_DAYS: {
    label: string;
    value: WeekDay;
}[] = [
    { label: "M", value: "mon" },
    { label: "T", value: "tue" },
    { label: "W", value: "wed" },
    { label: "T", value: "thu" },
    { label: "F", value: "fri" },
    { label: "S", value: "sat" },
    { label: "S", value: "sun" },
];

const DEFAULT_ROUTINE_NAME = "My Routine";

const DEFAULT_SELECTED_DAYS: WeekDay[] = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
];

function createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

function createEmptyBlock(
    defaultContextId?: string,
    order = 0
): RoutineBlock {
    return {
        id: createId("block"),
        contextId: defaultContextId ?? "",
        name: "",
        startMinutes: 9 * 60,
        endMinutes: 10 * 60,
        order,
    };
}

export default function CreateRoutine({
                                          contexts,
                                          onSave,
                                      }: CreateRoutineProps) {
    const defaultContextId = contexts[0]?.id;

    const [routineName, setRoutineName] =
        useState(DEFAULT_ROUTINE_NAME);

    const [selectedDays, setSelectedDays] =
        useState<WeekDay[]>(DEFAULT_SELECTED_DAYS);

    const [blocks, setBlocks] = useState<RoutineBlock[]>([
        createEmptyBlock(defaultContextId, 0),
    ]);

    const scrollViewRef = useRef<ScrollView>(null);

    const sortedBlocks = useMemo(
        () =>
            [...blocks].sort(
                (first, second) =>
                    first.startMinutes - second.startMinutes
            ),
        [blocks]
    );

    function toggleDay(day: WeekDay) {
        setSelectedDays((currentDays) => {
            if (currentDays.includes(day)) {
                return currentDays.filter(
                    (currentDay) => currentDay !== day
                );
            }

            return [...currentDays, day];
        });
    }

    function updateBlock<K extends keyof RoutineBlock>(
        blockId: string,
        field: K,
        value: RoutineBlock[K]
    ) {
        setBlocks((currentBlocks) =>
            currentBlocks.map((block) =>
                block.id === blockId
                    ? {
                        ...block,
                        [field]: value,
                    }
                    : block
            )
        );
    }

    function addBlock() {
        setBlocks((currentBlocks) => [
            ...currentBlocks,
            createEmptyBlock(
                defaultContextId,
                currentBlocks.length
            ),
        ]);
    }

    function removeBlock(blockId: string) {
        setBlocks((currentBlocks) => {
            if (currentBlocks.length === 1) {
                Alert.alert(
                    "Routine needs a block",
                    "A routine must contain at least one block."
                );

                return currentBlocks;
            }

            return currentBlocks
                .filter((block) => block.id !== blockId)
                .map((block, index) => ({
                    ...block,
                    order: index,
                }));
        });
    }

    function hasOverlappingBlocks(
        routineBlocks: RoutineBlock[]
    ) {
        const orderedBlocks = [...routineBlocks].sort(
            (first, second) =>
                first.startMinutes - second.startMinutes
        );
        const invalid: string[] = []
        for (
            let index = 0;
            index < orderedBlocks.length - 1;
            index += 1
        ) {
            const currentBlock = orderedBlocks[index];
            const nextBlock = orderedBlocks[index + 1];

            if (
                currentBlock.endMinutes >
                nextBlock.startMinutes
            ) {
                invalid.push(nextBlock.id);
            }
        }
        if (invalid.length > 0) {
            return invalid;
        }
        return [];
    }

    function validateRoutine() {
        if (!routineName.trim()) {
            Alert.alert(
                "Routine name required",
                "Please enter a name for this routine."
            );

            return false;
        }

        if (selectedDays.length === 0) {
            Alert.alert(
                "Select at least one day",
                "Choose the weekdays when this routine applies."
            );

            return false;
        }

        for (const block of blocks) {
            if (!block.contextId) {
                Alert.alert(
                    "Context required",
                    "Every routine block must have a context."
                );

                return false;
            }

            if (
                block.startMinutes >= block.endMinutes
            ) {
                Alert.alert(
                    "Invalid time range",
                    "A block's end time must be after its start time."
                );

                return false;
            }
        }

        const invalid: string[] = hasOverlappingBlocks(blocks);
        console.log(invalid);
        if (invalid.length > 0) {
            Alert.alert(
                `Routine blocks ${invalid.join(', ')} overlap`,
                "Please adjust the block times so they do not overlap."
            );

            return false;
        }

        return true;
    }

    function resetRoutineForm() {
        setRoutineName(DEFAULT_ROUTINE_NAME);

        // Create a new array instead of reusing the same reference.
        setSelectedDays([...DEFAULT_SELECTED_DAYS]);

        setBlocks([
            createEmptyBlock(defaultContextId, 0),
        ]);

        scrollViewRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }

    function handleSave() {
        if (!validateRoutine()) return;

        const now = new Date().toISOString();

        const routine: Routine = {
            id: createId("routine"),
            name: routineName.trim(),
            days: selectedDays,
            blocks: sortedBlocks.map((block, index) => ({
                ...block,
                name: block.name?.trim() || undefined,
                order: index,
            })),
            enabled: true,
            createdAt: now,
            updatedAt: now,
        };

        onSave(routine);
        resetRoutineForm();
    }

    return (
        <ScrollView
            className="flex-1"
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
        >
            <View className="px-5 pb-30 pt-16">
                <Text className="text-4xl font-sans-bold tracking-tight text-white">
                    Let&apos;s map your day
                </Text>

                <Text className="mt-3 text-base font-sans leading-6 text-zinc-400">
                    Add the places or modes you usually move
                    through. TimeSphere will use them to show
                    relevant tasks throughout your day.
                </Text>

                <View className="mt-8">
                    <Text className="mb-2 text-sm font-sans-semibold text-zinc-300">
                        Routine name
                    </Text>

                    <TextInput
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                        }}
                        value={routineName}
                        onChangeText={setRoutineName}
                        placeholder="Weekday routine"
                        placeholderTextColor="#71717A"
                        className="rounded-2xl border-zinc-800 bg-zinc-900 text-base font-sans text-white"
                    />
                </View>

                <View className="mt-7">
                    <Text className="mb-3 text-sm font-sans-semibold text-zinc-300">
                        Applies on
                    </Text>

                    <View className="flex-row justify-between">
                        {WEEK_DAYS.map((day) => {
                            const selected =
                                selectedDays.includes(day.value);

                            return (
                                <Pressable
                                    key={day.value}
                                    onPress={() =>
                                        toggleDay(day.value)
                                    }
                                    className={`h-11 w-11 items-center justify-center rounded-full ${
                                        selected
                                            ? "bg-white"
                                            : "border border-zinc-800 bg-zinc-900"
                                    }`}
                                >
                                    <Text
                                        className={`font-sans-bold ${
                                            selected
                                                ? "text-zinc-950"
                                                : "text-zinc-400"
                                        }`}
                                    >
                                        {day.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View className="mt-8 gap-5 will-change-variable">
                    {blocks.map((block, index) => (
                        <View
                            key={block.id}
                            className="rounded-[28px] border border-zinc-800 bg-[#11161D] p-5"
                        >
                            <View className="mb-5 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-lg font-sans-bold text-white">
                                        Block {index + 1}
                                    </Text>

                                    <Text className="mt-1 text-sm font-sans text-zinc-500">
                                        {formatMinutes(
                                            block.startMinutes
                                        )}{" "}
                                        –{" "}
                                        {formatMinutes(block.endMinutes)}
                                    </Text>
                                </View>

                                {blocks.length > 1 && (
                                    <Pressable
                                        onPress={() =>
                                            removeBlock(block.id)
                                        }
                                        className="rounded-full bg-red-500/10 px-3 py-2"
                                    >
                                        <Text className="text-sm font-sans-semibold text-red-400">
                                            Remove
                                        </Text>
                                    </Pressable>
                                )}
                            </View>

                            <Text className="mb-2 text-sm font-sans-medium text-zinc-300">
                                Optional block label
                            </Text>

                            <TextInput
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                }}
                                value={block.name ?? ""}
                                onChangeText={(value) =>
                                    updateBlock(
                                        block.id,
                                        "name",
                                        value
                                    )
                                }
                                placeholder="Morning at home"
                                placeholderTextColor="#71717A"
                                className="mb-5 rounded-2xl border-zinc-800 bg-zinc-900 text-base font-sans text-white"
                            />

                            <Text className="mb-3 text-sm font-sans-medium text-zinc-300">
                                Context
                            </Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerClassName="mb-5 gap-2"
                            >
                                {contexts.map((context) => {
                                    const selected =
                                        block.contextId === context.id;

                                    return (
                                        <Pressable
                                            key={context.id}
                                            onPress={() =>
                                                updateBlock(
                                                    block.id,
                                                    "contextId",
                                                    context.id
                                                )
                                            }
                                            className={`rounded-full px-4 py-3 ${
                                                selected
                                                    ? "bg-white"
                                                    : "border border-zinc-800 bg-zinc-900"
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
                            </ScrollView>

                            <TimePicker
                                label="Start time"
                                value={block.startMinutes}
                                onChange={(minutes) => {
                                    updateBlock(
                                        block.id,
                                        "startMinutes",
                                        minutes
                                    );
                                }}
                            />

                            <View className={'h-2'}></View>

                            <TimePicker
                                label="End time"
                                value={block.endMinutes}
                                onChange={(minutes) => {
                                    const normalizedEndMinutes =
                                        minutes === 0 && block.startMinutes > 0
                                            ? 24 * 60
                                            : minutes;

                                    updateBlock(
                                        block.id,
                                        "endMinutes",
                                        normalizedEndMinutes
                                    );
                                }}
                            />
                        </View>
                    ))}
                </View>

                <Pressable
                    onPress={addBlock}
                    className="mt-5 items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 py-5"
                >
                    <Text className="text-base font-sans-bold text-white">
                        + Add another block
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleSave}
                    className="mt-8 items-center rounded-2xl bg-white py-5"
                >
                    <Text className="text-base font-sans-bold text-zinc-950">
                        Save routine
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}