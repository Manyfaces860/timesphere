import type {Context, Priority, Task, TaskFilter} from "@/types";
import {Alert, Pressable, Text, View} from "react-native";
import {ENERGY_LABELS, PRIORITY_ORDER} from "@/constants/data";

function getContextName(
    contextId: string,
    contexts: Context[]
): string {
    const context = contexts.find(
        (item) => item.id === contextId
    );

    return context?.name ?? "Unknown";
}

function formatPreparationTime(minutes?: number): string {
    if (!minutes) {
        return "";
    }

    if (minutes < 60) {
        return `${minutes} min before`;
    }

    if (minutes === 60) {
        return "1 hour before";
    }

    if (minutes % 60 === 0) {
        return `${minutes / 60} hours before`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m before`;
}

function PriorityBadge({
                           priority,
                       }: {
    priority: Priority;
}) {
    const styles: Record<
        Priority,
        {
            container: string;
            text: string;
        }
    > = {
        high: {
            container: "bg-red-500/10",
            text: "text-red-400",
        },
        medium: {
            container: "bg-amber-500/10",
            text: "text-amber-400",
        },
        low: {
            container: "bg-zinc-800",
            text: "text-zinc-400",
        },
    };

    const selectedStyle = styles[priority];

    return (
        <View
            className={`rounded-full px-3 py-2 ${selectedStyle.container}`}
        >
            <Text
                className={`text-xs font-bold capitalize ${selectedStyle.text}`}
            >
                {priority}
            </Text>
        </View>
    );
}


export function TaskCard({
                      task,
                      contexts,
                      onComplete,
                      onReopen,
                      onDelete,
                  }: {
    task: Task;
    contexts: Context[];
    onComplete: (taskId: string) => void;
    onReopen: (taskId: string) => void;
    onDelete: (task: Task) => void;
}) {
    const isAnywhere = task.contextIds.length === 0;

    const contextNames = isAnywhere
        ? ["Anywhere"]
        : task.contextIds.map((contextId) =>
            getContextName(contextId, contexts)
        );

    const preparationContextName =
        task.prepareForContextId
            ? getContextName(
                task.prepareForContextId,
                contexts
            )
            : undefined;

    return (
        <View
            className={`rounded-[26px] border p-5 ${
                task.completed
                    ? "border-zinc-800 bg-zinc-900/50"
                    : "border-zinc-800 bg-[#11161D]"
            }`}
        >
            <View className="flex-row items-start gap-4">
                <Pressable
                    onPress={() =>
                        task.completed
                            ? onReopen(task.id)
                            : onComplete(task.id)
                    }
                    className={`mt-1 h-7 w-7 items-center justify-center rounded-full border-2 ${
                        task.completed
                            ? "border-white bg-white"
                            : "border-zinc-600"
                    }`}
                >
                    {task.completed && (
                        <Text className="text-sm font-bold text-zinc-950">
                            ✓
                        </Text>
                    )}
                </Pressable>

                <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-3">
                        <Text
                            className={`flex-1 text-lg font-bold ${
                                task.completed
                                    ? "text-zinc-500 line-through"
                                    : "text-white"
                            }`}
                        >
                            {task.title}
                        </Text>

                        <PriorityBadge priority={task.priority} />
                    </View>

                    {task.notes && (
                        <Text
                            className={`mt-2 text-sm leading-5 ${
                                task.completed
                                    ? "text-zinc-600"
                                    : "text-zinc-400"
                            }`}
                        >
                            {task.notes}
                        </Text>
                    )}

                    <View className="mt-4 flex-row flex-wrap gap-2">
                        {contextNames.map((contextName) => (
                            <View
                                key={contextName}
                                className="rounded-full bg-white/10 px-3 py-2"
                            >
                                <Text className="text-xs font-semibold text-zinc-300">
                                    {contextName}
                                </Text>
                            </View>
                        ))}

                        <View className="rounded-full bg-white/10 px-3 py-2">
                            <Text className="text-xs font-semibold text-zinc-300">
                                {ENERGY_LABELS[task.energyLevel]}
                            </Text>
                        </View>
                    </View>

                    {preparationContextName && (
                        <View className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                            <Text className="text-sm font-semibold text-blue-300">
                                Prepare for {preparationContextName}
                            </Text>

                            <Text className="mt-1 text-xs text-blue-400/80">
                                {formatPreparationTime(
                                    task.preparationMinutesBefore
                                )}
                            </Text>
                        </View>
                    )}

                    <View className="mt-5 flex-row items-center justify-between">
                        <Pressable
                            onPress={() =>
                                task.completed
                                    ? onReopen(task.id)
                                    : onComplete(task.id)
                            }
                            className="rounded-xl bg-white/10 px-4 py-3"
                        >
                            <Text className="text-sm font-bold text-white">
                                {task.completed
                                    ? "Mark active"
                                    : "Complete"}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => onDelete(task)}
                            className="rounded-xl bg-red-500/10 px-4 py-3"
                        >
                            <Text className="text-sm font-bold text-red-400">
                                Delete
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}
