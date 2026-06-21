// src/components/CreateTask.tsx

import React, { useState } from "react";
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
    EnergyLevel,
    Priority,
    Task,
} from "@/types";

type CreateTaskProps = {
    contexts: Context[];
    onSave: (task: Task) => void;
};

const ENERGY_OPTIONS: {
    label: string;
    description: string;
    value: EnergyLevel;
}[] = [
    {
        label: "Any",
        description: "Can be done regardless of energy",
        value: "any",
    },
    {
        label: "Low",
        description: "Light or casual task",
        value: "low",
    },
    {
        label: "High",
        description: "Needs focus and mental effort",
        value: "high",
    },
];

const PRIORITY_OPTIONS: {
    label: string;
    value: Priority;
}[] = [
    {
        label: "Low",
        value: "low",
    },
    {
        label: "Medium",
        value: "medium",
    },
    {
        label: "High",
        value: "high",
    },
];

const PREPARATION_TIME_OPTIONS = [
    {
        label: "15 min",
        value: 15,
    },
    {
        label: "30 min",
        value: 30,
    },
    {
        label: "1 hour",
        value: 60,
    },
    {
        label: "2 hours",
        value: 120,
    },
    {
        label: "3 hours",
        value: 180,
    },
];

function createId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

export default function CreateTask({
                                       contexts,
                                       onSave,
                                   }: CreateTaskProps) {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");

    /*
     * Empty contextIds means:
     * the task is available anywhere.
     */
    const [contextIds, setContextIds] = useState<string[]>([]);

    const [energyLevel, setEnergyLevel] =
        useState<EnergyLevel>("any");

    const [priority, setPriority] =
        useState<Priority>("medium");

    const [isPreparationTask, setIsPreparationTask] =
        useState(false);

    const [
        prepareForContextId,
        setPrepareForContextId,
    ] = useState<string | undefined>(undefined);

    const [
        preparationMinutesBefore,
        setPreparationMinutesBefore,
    ] = useState(60);

    const isAnywhereTask = contextIds.length === 0;

    function selectAnywhere() {
        setContextIds([]);
    }

    function toggleContext(contextId: string) {
        setContextIds((currentContextIds) => {
            if (currentContextIds.includes(contextId)) {
                return currentContextIds.filter(
                    (currentId) => currentId !== contextId
                );
            }

            return [...currentContextIds, contextId];
        });
    }

    function togglePreparationTask() {
        setIsPreparationTask((currentValue) => {
            const nextValue = !currentValue;

            if (!nextValue) {
                setPrepareForContextId(undefined);
                setPreparationMinutesBefore(60);
            }

            return nextValue;
        });
    }

    function validateTask(): boolean {
        if (!title.trim()) {
            Alert.alert(
                "Task title required",
                "Enter what you need to do."
            );

            return false;
        }

        if (isPreparationTask && !prepareForContextId) {
            Alert.alert(
                "Preparation context required",
                "Choose which upcoming context this task prepares you for."
            );

            return false;
        }

        if (
            isPreparationTask &&
            preparationMinutesBefore <= 0
        ) {
            Alert.alert(
                "Invalid preparation time",
                "Preparation time must be greater than zero."
            );

            return false;
        }

        return true;
    }

    function resetForm() {
        setTitle("");
        setNotes("");
        setContextIds([]);
        setEnergyLevel("any");
        setPriority("medium");
        setIsPreparationTask(false);
        setPrepareForContextId(undefined);
        setPreparationMinutesBefore(60);
    }

    function handleSave() {
        if (!validateTask()) return;

        const now = new Date().toISOString();

        const task: Task = {
            id: createId("task"),

            title: title.trim(),
            notes: notes.trim() || undefined,

            completed: false,
            completedAt: undefined,

            contextIds,
            energyLevel,

            prepareForContextId: isPreparationTask
                ? prepareForContextId
                : undefined,

            preparationMinutesBefore: isPreparationTask
                ? preparationMinutesBefore
                : undefined,

            priority,

            createdAt: now,
            updatedAt: now,
        };

        onSave(task);
        resetForm();
    }

    return (
        <ScrollView
            className="flex-1 mt-12"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pb-32 pt-16"
        >
            <Text className="text-4xl font-bold tracking-tight text-white">
                Create a task
            </Text>

            <Text className="mt-3 text-base leading-6 text-zinc-400">
                Tell TimeSphere what needs to be done and the
                context where it belongs.
            </Text>

            {/* Task title */}
            <View className="mt-8">
                <Text className="mb-2 text-sm font-semibold text-zinc-300">
                    What do you need to do?
                </Text>

                <TextInput
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                    }}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Reply to recruiter"
                    placeholderTextColor="#71717A"
                    className="rounded-2xl border-zinc-800 bg-zinc-900 text-base text-white"
                />
            </View>

            {/* Notes */}
            <View className="mt-6">
                <Text className="mb-2 text-sm font-semibold text-zinc-300">
                    Notes
                </Text>

                <TextInput
                    value={notes}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                    }}
                    onChangeText={setNotes}
                    placeholder="Add any useful details..."
                    placeholderTextColor="#71717A"
                    multiline
                    textAlignVertical="top"
                    className="min-h-28 rounded-2xl border-zinc-800 bg-zinc-900 text-base text-white"
                />
            </View>

            {/* Context selection */}
            <View className="mt-8">
                <Text className="text-lg font-bold text-white">
                    Where can you do this?
                </Text>

                <Text className="mt-1 text-sm leading-5 text-zinc-500">
                    Select one or more contexts. Choose Anywhere if
                    the task has no location restriction.
                </Text>

                <View className="mt-4 flex-row flex-wrap gap-2">
                    <Pressable
                        onPress={selectAnywhere}
                        className={`rounded-full px-4 py-3 ${
                            isAnywhereTask
                                ? "bg-white"
                                : "border border-zinc-800 bg-zinc-900"
                        }`}
                    >
                        <Text
                            className={`font-semibold ${
                                isAnywhereTask
                                    ? "text-zinc-950"
                                    : "text-zinc-400"
                            }`}
                        >
                            Anywhere
                        </Text>
                    </Pressable>

                    {contexts.map((context) => {
                        const selected = contextIds.includes(
                            context.id
                        );

                        return (
                            <Pressable
                                key={context.id}
                                onPress={() =>
                                    toggleContext(context.id)
                                }
                                className={`rounded-full px-4 py-3 ${
                                    selected
                                        ? "bg-white"
                                        : "border border-zinc-800 bg-zinc-900"
                                }`}
                            >
                                <Text
                                    className={`font-semibold ${
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
            </View>

            {/* Energy */}
            <View className="mt-8">
                <Text className="text-lg font-bold text-white">
                    Energy needed
                </Text>

                <Text className="mt-1 text-sm leading-5 text-zinc-500">
                    This helps TimeSphere avoid suggesting demanding
                    tasks when your energy is low.
                </Text>

                <View className="mt-4 gap-3">
                    {ENERGY_OPTIONS.map((option) => {
                        const selected =
                            energyLevel === option.value;

                        return (
                            <Pressable
                                key={option.value}
                                onPress={() =>
                                    setEnergyLevel(option.value)
                                }
                                className={`rounded-2xl border p-4 ${
                                    selected
                                        ? "border-white bg-white"
                                        : "border-zinc-800 bg-zinc-900"
                                }`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 pr-4">
                                        <Text
                                            className={`text-base font-bold ${
                                                selected
                                                    ? "text-zinc-950"
                                                    : "text-white"
                                            }`}
                                        >
                                            {option.label}
                                        </Text>

                                        <Text
                                            className={`mt-1 text-sm ${
                                                selected
                                                    ? "text-zinc-600"
                                                    : "text-zinc-500"
                                            }`}
                                        >
                                            {option.description}
                                        </Text>
                                    </View>

                                    <View
                                        className={`h-5 w-5 items-center justify-center rounded-full border ${
                                            selected
                                                ? "border-zinc-950"
                                                : "border-zinc-600"
                                        }`}
                                    >
                                        {selected && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-zinc-950" />
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Priority */}
            <View className="mt-8">
                <Text className="text-lg font-bold text-white">
                    Priority
                </Text>

                <View className="mt-4 flex-row gap-2">
                    {PRIORITY_OPTIONS.map((option) => {
                        const selected =
                            priority === option.value;

                        return (
                            <Pressable
                                key={option.value}
                                onPress={() =>
                                    setPriority(option.value)
                                }
                                className={`flex-1 items-center rounded-2xl px-3 py-4 ${
                                    selected
                                        ? "bg-white"
                                        : "border border-zinc-800 bg-zinc-900"
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

            {/* Preparation task */}
            <View className="mt-8 rounded-[28px] border border-zinc-800 bg-[#11161D] p-5">
                <Pressable
                    onPress={togglePreparationTask}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-1 pr-5">
                        <Text className="text-lg font-bold text-white">
                            Preparation task
                        </Text>

                        <Text className="mt-1 text-sm leading-5 text-zinc-500">
                            Show this task before an upcoming context,
                            such as packing your charger before Work.
                        </Text>
                    </View>

                    <View
                        className={`h-7 w-12 rounded-full p-1 ${
                            isPreparationTask
                                ? "bg-white"
                                : "bg-zinc-700"
                        }`}
                    >
                        <View
                            className={`h-5 w-5 rounded-full ${
                                isPreparationTask
                                    ? "ml-auto bg-zinc-950"
                                    : "bg-zinc-400"
                            }`}
                        />
                    </View>
                </Pressable>

                {isPreparationTask && (
                    <View className="mt-6">
                        <Text className="mb-3 text-sm font-semibold text-zinc-300">
                            Prepare for
                        </Text>

                        {contexts.length === 0 ? (
                            <View className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                                <Text className="text-sm leading-5 text-amber-300">
                                    Create at least one context before adding
                                    a preparation task.
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row flex-wrap gap-2">
                                {contexts.map((context) => {
                                    const selected =
                                        prepareForContextId === context.id;

                                    return (
                                        <Pressable
                                            key={context.id}
                                            onPress={() =>
                                                setPrepareForContextId(
                                                    context.id
                                                )
                                            }
                                            className={`rounded-full px-4 py-3 ${
                                                selected
                                                    ? "bg-white"
                                                    : "border border-zinc-700 bg-zinc-900"
                                            }`}
                                        >
                                            <Text
                                                className={`font-semibold ${
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
                        )}

                        <Text className="mb-3 mt-6 text-sm font-semibold text-zinc-300">
                            Show this task before
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                            {PREPARATION_TIME_OPTIONS.map(
                                (option) => {
                                    const selected =
                                        preparationMinutesBefore ===
                                        option.value;

                                    return (
                                        <Pressable
                                            key={option.value}
                                            onPress={() =>
                                                setPreparationMinutesBefore(
                                                    option.value
                                                )
                                            }
                                            className={`rounded-full px-4 py-3 ${
                                                selected
                                                    ? "bg-white"
                                                    : "border border-zinc-700 bg-zinc-900"
                                            }`}
                                        >
                                            <Text
                                                className={`font-semibold ${
                                                    selected
                                                        ? "text-zinc-950"
                                                        : "text-zinc-400"
                                                }`}
                                            >
                                                {option.label}
                                            </Text>
                                        </Pressable>
                                    );
                                }
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* Save */}
            <Pressable
                onPress={handleSave}
                className="mt-8 items-center rounded-2xl bg-white py-5"
            >
                <Text className="text-base font-bold text-zinc-950">
                    Save task
                </Text>
            </Pressable>
        </ScrollView>
    );
}