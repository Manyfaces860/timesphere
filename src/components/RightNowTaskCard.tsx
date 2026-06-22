import {
    Pressable,
    Text,
    View,
} from "react-native";

import type {
    Context,
    Task,
} from "@/types";

type RightNowTaskCardProps = {
    task: Task;
    contexts: Context[];
    featured?: boolean;
    onComplete: (taskId: string) => void;
};

function getContextNames(
    task: Task,
    contexts: Context[]
): string {
    if (task.contextIds.length === 0) {
        return "Anywhere";
    }

    return task.contextIds
        .map((contextId) => {
            const context = contexts.find(
                (item) => item.id === contextId
            );

            return context?.name ?? "Unknown";
        })
        .join(" • ");
}

export default function RightNowTaskCard({
                                             task,
                                             contexts,
                                             featured = false,
                                             onComplete,
                                         }: RightNowTaskCardProps) {
    return (
        <View
            className={`rounded-[28px] border border-zinc-800 ${
                featured
                    ? "bg-white p-6"
                    : "bg-[#11161D] p-5"
            }`}
        >
            {featured && (
                <Text className="mb-3 text-xs font-sans-bold uppercase tracking-widest text-zinc-500">
                    Best task right now
                </Text>
            )}

            <Text
                className={`font-sans-bold ${
                    featured
                        ? "text-2xl text-zinc-950"
                        : "text-lg text-white"
                }`}
            >
                {task.title}
            </Text>

            {task.notes && (
                <Text
                    className={`mt-2 font-sans leading-5 ${
                        featured
                            ? "text-zinc-600"
                            : "text-zinc-400"
                    }`}
                >
                    {task.notes}
                </Text>
            )}

            <View className="mt-4 flex-row flex-wrap gap-2">
                <View
                    className={`rounded-full px-3 py-2 ${
                        featured
                            ? "bg-zinc-200"
                            : "bg-white/10"
                    }`}
                >
                    <Text
                        className={`text-xs font-sans-semibold ${
                            featured
                                ? "text-zinc-700"
                                : "text-zinc-300"
                        }`}
                    >
                        {getContextNames(task, contexts)}
                    </Text>
                </View>

                <View
                    className={`rounded-full px-3 py-2 ${
                        featured
                            ? "bg-zinc-200"
                            : "bg-white/10"
                    }`}
                >
                    <Text
                        className={`text-xs font-sans-semibold capitalize ${
                            featured
                                ? "text-zinc-700"
                                : "text-zinc-300"
                        }`}
                    >
                        {task.energyLevel} energy
                    </Text>
                </View>

                <View
                    className={`rounded-full px-3 py-2 ${
                        featured
                            ? "bg-zinc-200"
                            : "bg-white/10"
                    }`}
                >
                    <Text
                        className={`text-xs font-sans-semibold capitalize ${
                            featured
                                ? "text-zinc-700"
                                : "text-zinc-300"
                        }`}
                    >
                        {task.priority} priority
                    </Text>
                </View>
            </View>

            <Pressable
                onPress={() => onComplete(task.id)}
                className={`mt-6 items-center rounded-2xl py-4 ${
                    featured
                        ? "bg-zinc-950"
                        : "bg-white"
                }`}
            >
                <Text
                    className={`font-sans-bold ${
                        featured
                            ? "text-white"
                            : "text-zinc-950"
                    }`}
                >
                    Mark complete
                </Text>
            </Pressable>
        </View>
    );
}