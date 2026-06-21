// src/app/(tabs)/show_tasks.tsx

import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import type {
    Context,
    EnergyLevel,
    Priority,
    Task,
    TaskFilter
} from "@/types";

import {
    completeTask,
    deleteTask,
    getTasks,
    reopenTask,
} from "@/services/taskStorage";

import { contexts as DEFAULT_CONTEXTS } from "@/constants/contexts";
import { PRIORITY_ORDER, ENERGY_LABELS } from '@/constants/data';
import {TaskCard} from "@/components/TaskCard";
import {ScreenBackground} from "@/components/ScreenBackground";

function EmptyState({
                        filter,
                    }: {
    filter: TaskFilter;
}) {
    const messages: Record<
        TaskFilter,
        {
            title: string;
            description: string;
        }
    > = {
        active: {
            title: "No active tasks",
            description:
                "Create a task and TimeSphere will organize it by context.",
        },
        completed: {
            title: "Nothing completed yet",
            description:
                "Finished tasks will appear here.",
        },
        all: {
            title: "No tasks yet",
            description:
                "Create your first task to get started.",
        },
    };

    const message = messages[filter];

    return (
        <View className="mt-14 items-center rounded-[28px] border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12">
            <Text className="text-4xl">✓</Text>

            <Text className="mt-5 text-xl font-bold text-white">
                {message.title}
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-zinc-400">
                {message.description}
            </Text>

            <Pressable
                onPress={() => router.push("/create_task")}
                className="mt-6 rounded-2xl bg-white px-6 py-4"
            >
                <Text className="font-bold text-zinc-950">
                    Create task
                </Text>
            </Pressable>
        </View>
    );
}

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] =
        useState<TaskFilter>("active");
    const [loading, setLoading] = useState(true);

    const contexts = DEFAULT_CONTEXTS;

    const loadTasks = useCallback(() => {
        try {
            const storedTasks = getTasks();

            setTasks(storedTasks);
        } catch (error) {
            console.error("Failed to load tasks:", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [loadTasks])
    );

    const filteredTasks = useMemo(() => {
        let selectedTasks: Task[];

        if (filter === "active") {
            selectedTasks = tasks.filter(
                (task) => !task.completed
            );
        } else if (filter === "completed") {
            selectedTasks = tasks.filter(
                (task) => task.completed
            );
        } else {
            selectedTasks = tasks;
        }

        return [...selectedTasks].sort(
            (first, second) => {
                if (first.completed !== second.completed) {
                    return first.completed ? 1 : -1;
                }

                const priorityDifference =
                    PRIORITY_ORDER[second.priority] -
                    PRIORITY_ORDER[first.priority];

                if (priorityDifference !== 0) {
                    return priorityDifference;
                }

                return (
                    new Date(second.createdAt).getTime() -
                    new Date(first.createdAt).getTime()
                );
            }
        );
    }, [tasks, filter]);

    function handleCompleteTask(taskId: string) {
        const updatedTask = completeTask(taskId);

        if (!updatedTask) {
            Alert.alert(
                "Task not found",
                "This task could not be updated."
            );

            return;
        }

        loadTasks();
    }

    function handleReopenTask(taskId: string) {
        const updatedTask = reopenTask(taskId);

        if (!updatedTask) {
            Alert.alert(
                "Task not found",
                "This task could not be updated."
            );

            return;
        }

        loadTasks();
    }

    function handleDeleteTask(task: Task) {
        Alert.alert(
            "Delete task?",
            `"${task.title}" will be permanently removed.`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const deleted = deleteTask(task.id);

                        if (!deleted) {
                            Alert.alert(
                                "Task not found",
                                "The task may have already been deleted."
                            );

                            return;
                        }

                        loadTasks();
                    },
                },
            ]
        );
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#090D12]">
                <Text className="text-base text-zinc-400">
                    Loading tasks...
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
                        Your tasks
                    </Text>

                    <Text className="mt-3 text-base leading-6 text-zinc-400">
                        Manage everything you have added to
                        TimeSphere.
                    </Text>
                </View>

                <Pressable
                    onPress={() => router.push("/create_task")}
                    className="h-12 w-[20%] items-center justify-center rounded-full bg-white"
                >
                    <Text className="font-sans-semibold leading-none text-zinc-950">
                        New Task
                    </Text>
                </Pressable>
            </View>

            <View className="mt-8 flex-row rounded-2xl bg-zinc-900 p-1">
                {(
                    [
                        {
                            label: "Active",
                            value: "active",
                        },
                        {
                            label: "Completed",
                            value: "completed",
                        },
                        {
                            label: "All",
                            value: "all",
                        },
                    ] as {
                        label: string;
                        value: TaskFilter;
                    }[]
                ).map((option) => {
                    const selected = filter === option.value;

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => setFilter(option.value)}
                            className={`flex-1 items-center rounded-xl py-3 ${
                                selected ? "bg-white" : ""
                            }`}
                        >
                            <Text
                                className={`text-sm font-bold ${
                                    selected
                                        ? "text-zinc-950"
                                        : "text-zinc-500"
                                }`}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View className="mt-6 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-zinc-500">
                    {filteredTasks.length}{" "}
                    {filteredTasks.length === 1
                        ? "task"
                        : "tasks"}
                </Text>
            </View>

            {filteredTasks.length === 0 ? (
                <EmptyState filter={filter} />
            ) : (
                <View className="mt-4 gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            contexts={contexts}
                            onComplete={handleCompleteTask}
                            onReopen={handleReopenTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
</ScreenBackground>
    );
}