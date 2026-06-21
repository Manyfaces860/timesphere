// src/app/(tabs)/index.tsx

import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    router,
    useFocusEffect,
} from "expo-router";

import CurrentContextSelector from "@/components/CurrentContextSelector";
import RightNowTaskCard from "@/components/RightNowTaskCard";

import {
    contexts as DEFAULT_CONTEXTS,
} from "@/constants/contexts";

import {
    getCurrentContext,
    saveCurrentContext,
} from "@/services/currentContextStorage";

import {
    completeTask,
    getTasks,
} from "@/services/taskStorage";

import { getRoutines } from "@/services/routineStorage";

import { getRightNowFeed } from "@/utils/rightNowTasks";

import {
    resolveRoutineContext,
} from "@/utils/routineContext";

import {
    resolveCurrentContextFromRoutine,
} from "@/utils/resolveCurrentContext";

import type {
    Context,
    CurrentContext,
    Routine,
    RoutineBlock,
    Task,
} from "@/types";
import {Image} from "expo-image";
import {ScreenBackground} from "@/components/ScreenBackground";

function getContextName(contextId?: string): string {
    if (!contextId) {
        return "No active context";
    }

    const context = DEFAULT_CONTEXTS.find(
        (item) => item.id === contextId
    );

    return context?.name ?? "Unknown context";
}

function getBlockName(
    block: RoutineBlock | undefined
): string {
    if (!block) {
        return "No active block";
    }

    if (block.name?.trim()) {
        return block.name;
    }

    return getContextName(block.contextId);
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);

    const [currentContext, setCurrentContext] =
        useState<CurrentContext>(() =>
            getCurrentContext()
        );

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadScreenData = useCallback(
        (showFullScreenLoader = false) => {
            if (showFullScreenLoader) {
                setLoading(true);
            }

            try {
                const storedTasks = getTasks();
                const storedRoutines = getRoutines();
                const storedContext = getCurrentContext();

                setTasks(storedTasks);
                setRoutines(storedRoutines);

                if (storedContext.source === "manual") {
                    setCurrentContext(storedContext);
                } else {
                    const routineContext =
                        resolveCurrentContextFromRoutine(
                            storedRoutines,
                            storedContext.energyLevel,
                            new Date()
                        );

                    setCurrentContext(routineContext);
                    saveCurrentContext(routineContext);
                }
            } catch (error) {
                console.error(
                    "Failed to load Home data:",
                    error
                );
            } finally {
                if (showFullScreenLoader) {
                    setLoading(false);
                }
            }
        },
        []
    );

    useFocusEffect(
        useCallback(() => {
            loadScreenData(true);
        }, [loadScreenData])
    );

    /*
     * Finds:
     *
     * - the routine block active right now
     * - the next upcoming routine block
     */
    const routineResult = useMemo(
        () => resolveRoutineContext(routines),
        [routines]
    );

    /*
     * Tasks are filtered using either:
     *
     * - routine-derived context
     * - manually overridden context
     */
    const rightNowFeed = useMemo(
        () =>
            getRightNowFeed(
                tasks,
                currentContext
            ),
        [tasks, currentContext]
    );

    /*
     * Selecting anything inside CurrentContextSelector
     * creates a manual override.
     */
    function handleContextChange(
        nextContext: CurrentContext
    ) {
        const manualContext: CurrentContext = {
            ...nextContext,
            source: "manual",
            detectedAt: new Date().toISOString(),
        };

        setCurrentContext(manualContext);
        saveCurrentContext(manualContext);
    }

    /*
     * Removes the manual override and derives the
     * context from the current routine block again.
     *
     * Energy remains whatever the user last selected.
     */
    function handleUseRoutineContext() {
        const routineContext =
            resolveCurrentContextFromRoutine(
                routines,
                currentContext.energyLevel
            );

        setCurrentContext(routineContext);
        saveCurrentContext(routineContext);
    }

    const handleRefresh = useCallback(() => {
        setRefreshing(true);

        try {
            loadScreenData(false);
        } finally {
            setTimeout(() => {
                setRefreshing(false);
            }, 400);
        }
    }, [loadScreenData]);

    function handleCompleteTask(taskId: string) {
        const updatedTask = completeTask(taskId);

        if (!updatedTask) {
            Alert.alert(
                "Task not found",
                "This task could not be completed."
            );

            return;
        }

        setTasks(getTasks());
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#090D12]">
                <Text className="text-zinc-400">
                    Loading your context...
                </Text>
            </View>
        );
    }

    const isManualOverride =
        currentContext.source === "manual";

    const activeBlock =
        routineResult.currentBlock;

    const nextBlock =
        routineResult.nextBlock;

    return (
        <ScreenBackground>
            <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-32 pt-16"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#FFFFFF"
                colors={["#FFFFFF"]}
                progressBackgroundColor="#18181B"
            />}
        >
            {/* Header */}

            <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                    <Text className="text-4xl font-bold tracking-tight text-white">
                        Right now
                    </Text>

                    <Text className="mt-2 text-base leading-6 text-zinc-400">
                        Tasks that fit your current context.
                    </Text>
                </View>

                <Pressable
                    onPress={() =>
                        router.push("/create_task")
                    }
                    className="items-center h-12 w-[22%] justify-center rounded-full bg-white px-5"
                >
                    <Text className="font-sans-semibold text-zinc-950">
                        New Task
                    </Text>
                </Pressable>
            </View>

            {/* Routine-derived context information */}

            <View className="mt-8 rounded-[28px] border border-zinc-800 bg-[#11161D] p-5">
                <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Current routine
                        </Text>

                        {activeBlock ? (
                            <>
                                <Text className="mt-3 text-xl font-bold text-white">
                                    {getBlockName(
                                        activeBlock.block
                                    )}
                                </Text>

                                <Text className="mt-1 text-sm text-zinc-400">
                                    {getContextName(
                                        activeBlock.block.contextId
                                    )}
                                    {" · "}
                                    {formatTime(
                                        activeBlock.startsAt
                                    )}
                                    {" – "}
                                    {formatTime(
                                        activeBlock.endsAt
                                    )}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="mt-3 text-xl font-bold text-white">
                                    No active routine block
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-zinc-500">
                                    There is no routine block covering
                                    the current time.
                                </Text>
                            </>
                        )}
                    </View>

                    <View
                        className={`rounded-full px-3 py-2 ${
                            isManualOverride
                                ? "bg-amber-500/10"
                                : "bg-blue-500/10"
                        }`}
                    >
                        <Text
                            className={`text-xs font-bold ${
                                isManualOverride
                                    ? "text-amber-400"
                                    : "text-blue-400"
                            }`}
                        >
                            {isManualOverride
                                ? "Manual"
                                : "Routine"}
                        </Text>
                    </View>
                </View>

                {isManualOverride && (
                    <View className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <Text className="text-sm font-semibold text-amber-300">
                            Manual context override is active
                        </Text>

                        <Text className="mt-1 text-sm leading-5 text-amber-400/80">
                            Tasks are currently using{" "}
                            {getContextName(
                                currentContext.contextId
                            )}{" "}
                            instead of the active routine block.
                        </Text>

                        <Pressable
                            onPress={handleUseRoutineContext}
                            className="mt-4 items-center rounded-xl bg-amber-300 py-3"
                        >
                            <Text className="font-bold text-amber-950">
                                Use routine context
                            </Text>
                        </Pressable>
                    </View>
                )}

                {nextBlock && (
                    <View className="mt-5 border-t border-zinc-800 pt-5">
                        <Text className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Coming next
                        </Text>

                        <Text className="mt-2 text-base font-bold text-white">
                            {getBlockName(nextBlock.block)}
                        </Text>

                        <Text className="mt-1 text-sm text-zinc-400">
                            {getContextName(
                                nextBlock.block.contextId
                            )}
                            {" · "}
                            {formatTime(nextBlock.startsAt)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Manual selector */}

            <View className="mt-6">
                <CurrentContextSelector
                    contexts={DEFAULT_CONTEXTS}
                    value={currentContext}
                    onChange={handleContextChange}
                />
            </View>

            {/* Suggested tasks */}

            <View className="mt-9">
                <View className="flex-row items-end justify-between">
                    <View className="flex-1 pr-4">
                        <Text className="text-2xl font-bold text-white">
                            Suggested tasks
                        </Text>

                        <Text className="mt-1 text-sm text-zinc-500">
                            {rightNowFeed.allMatchingTasks.length}{" "}
                            {rightNowFeed.allMatchingTasks.length === 1
                                ? "task fits"
                                : "tasks fit"}{" "}
                            {getContextName(
                                currentContext.contextId
                            )}
                        </Text>
                    </View>

                    {rightNowFeed.allMatchingTasks.length >
                        4 && (
                            <Pressable
                                onPress={() =>
                                    router.push("/show_tasks")
                                }
                            >
                                <Text className="font-semibold text-zinc-300">
                                    View all
                                </Text>
                            </Pressable>
                        )}
                </View>

                {!rightNowFeed.heroTask ? (
                    <View className="mt-5 items-center rounded-[28px] border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12">
                        <Text className="text-4xl">
                            ✨
                        </Text>

                        <Text className="mt-5 text-xl font-bold text-white">
                            Nothing fits right now
                        </Text>

                        <Text className="mt-2 text-center leading-6 text-zinc-400">
                            Change your current context or create a
                            task that can be done here.
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.push("/create_task")
                            }
                            className="mt-6 rounded-2xl bg-white px-6 py-4"
                        >
                            <Text className="font-bold text-zinc-950">
                                Create task
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <View className="mt-5">
                            <RightNowTaskCard
                                task={rightNowFeed.heroTask}
                                contexts={DEFAULT_CONTEXTS}
                                featured
                                onComplete={handleCompleteTask}
                            />
                        </View>

                        {rightNowFeed.nextTasks.length >
                            0 && (
                                <View className="mt-6">
                                    <Text className="mb-3 text-lg font-bold text-white">
                                        Next up
                                    </Text>

                                    <View className="gap-4">
                                        {rightNowFeed.nextTasks.map(
                                            (task) => (
                                                <RightNowTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    contexts={
                                                        DEFAULT_CONTEXTS
                                                    }
                                                    onComplete={
                                                        handleCompleteTask
                                                    }
                                                />
                                            )
                                        )}
                                    </View>
                                </View>
                            )}
                    </>
                )}
            </View>
        </ScrollView>
        </ScreenBackground>
    );
}


// // src/app/(tabs)/index.tsx
//
// import { useCallback, useMemo, useState } from "react";
// import {
//     Alert,
//     Pressable,
//     ScrollView,
//     Text,
//     View,
// } from "react-native";
//
// import {
//     router,
//     useFocusEffect,
// } from "expo-router";
//
// import CurrentContextSelector from "@/components/CurrentContextSelector";
// import RightNowTaskCard from "@/components/RightNowTaskCard";
//
// import { contexts as DEFAULT_CONTEXTS } from "@/constants/contexts";
//
// import {
//     getCurrentContext,
//     saveCurrentContext,
// } from "@/services/currentContextStorage";
//
// import {
//     completeTask,
//     getTasks,
// } from "@/services/taskStorage";
//
// import { getRightNowFeed } from "@/utils/rightNowTasks";
//
// import type {
//     CurrentContext, EnergyLevel, Routine,
//     Task,
// } from "@/types";
//
// import { getRoutines } from "@/services/routineStorage";
//
// import {
//     resolveRoutineContext,
// } from "@/utils/routineContext";
//
// import {
//     resolveCurrentContextFromRoutine,
// } from "@/utils/resolveCurrentContext";
//
// export default function HomeScreen() {
//     const [tasks, setTasks] = useState<Task[]>([]);
//     const [routines, setRoutines] = useState<Routine[]>([]);
//
//     const [currentContext, setCurrentContext] =
//         useState<CurrentContext>(() =>
//             getCurrentContext()
//         );
//
//     const [loading, setLoading] = useState(true);
//
//     const loadScreenData = useCallback(() => {
//         try {
//             const storedTasks = getTasks();
//             const storedRoutines = getRoutines();
//             const storedContext = getCurrentContext();
//
//             setTasks(storedTasks);
//             setRoutines(storedRoutines);
//
//             const routineContext =
//                 resolveCurrentContextFromRoutine(
//                     storedRoutines,
//                     storedContext.energyLevel
//                 );
//
//             setCurrentContext(routineContext);
//         } catch (error) {
//             console.error(
//                 "Failed to load Home data:",
//                 error
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, []);
//
//     useFocusEffect(
//         useCallback(() => {
//             loadScreenData();
//         }, [loadScreenData])
//     );
//
//     const routineResult = useMemo(
//         () => resolveRoutineContext(routines),
//         [routines]
//     );
//
//     const rightNowFeed = useMemo(
//         () =>
//             getRightNowFeed(
//                 tasks,
//                 currentContext
//             ),
//         [tasks, currentContext]
//     );
//
//     function handleEnergyChange(
//         energyLevel: EnergyLevel
//     ) {
//         const nextContext =
//             resolveCurrentContextFromRoutine(
//                 routines,
//                 energyLevel
//             );
//
//         setCurrentContext(nextContext);
//         saveCurrentContext(nextContext);
//     }
//
//     function handleContextChange(
//         nextContext: CurrentContext
//     ) {
//         setCurrentContext(nextContext);
//         saveCurrentContext(nextContext);
//     }
//
//     function handleCompleteTask(taskId: string) {
//         const updatedTask = completeTask(taskId);
//
//         if (!updatedTask) {
//             Alert.alert(
//                 "Task not found",
//                 "This task could not be completed."
//             );
//
//             return;
//         }
//
//         setTasks(getTasks());
//     }
//
//     if (loading) {
//         return (
//             <View className="flex-1 items-center justify-center bg-[#090D12]">
//                 <Text className="text-zinc-400">
//                     Loading your context...
//                 </Text>
//             </View>
//         );
//     }
//
//     return (
//         <ScrollView
//             className="flex-1 bg-[#090D12]"
//             contentContainerClassName="px-5 pb-32 pt-16"
//             showsVerticalScrollIndicator={false}
//         >
//             <View className="flex-row items-start justify-between gap-4">
//                 <View className="flex-1">
//                     <Text className="text-4xl font-bold tracking-tight text-white">
//                         Right now
//                     </Text>
//
//                     <Text className="mt-2 text-base leading-6 text-zinc-400">
//                         Tasks that fit your current context.
//                     </Text>
//                 </View>
//
//                 <Pressable
//                     onPress={() =>
//                         router.push("/create_task")
//                     }
//                     className="h-12 w-[20%] items-center justify-center rounded-full bg-white"
//                 >
//                     <Text className=" font-sans-semibold leading-none text-zinc-950">
//                         New Task
//                     </Text>
//                 </Pressable>
//             </View>
//
//             <View className="mt-8">
//                 <CurrentContextSelector
//                     contexts={DEFAULT_CONTEXTS}
//                     value={currentContext}
//                     onChange={handleContextChange}
//                 />
//             </View>
//
//             <View className="mt-9">
//                 <View className="flex-row items-end justify-between">
//                     <View>
//                         <Text className="text-2xl font-bold text-white">
//                             Suggested tasks
//                         </Text>
//
//                         <Text className="mt-1 text-sm text-zinc-500">
//                             {rightNowFeed.allMatchingTasks.length}{" "}
//                             {rightNowFeed.allMatchingTasks.length === 1
//                                 ? "task fits"
//                                 : "tasks fit"}{" "}
//                             right now
//                         </Text>
//                     </View>
//
//                     {rightNowFeed.allMatchingTasks.length >
//                         4 && (
//                             <Pressable
//                                 onPress={() => router.push("/show_tasks")}
//                             >
//                                 <Text className="font-semibold text-zinc-300">
//                                     View all
//                                 </Text>
//                             </Pressable>
//                         )}
//                 </View>
//
//                 {!rightNowFeed.heroTask ? (
//                     <View className="mt-5 items-center rounded-[28px] border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12">
//                         <Text className="text-4xl">✨</Text>
//
//                         <Text className="mt-5 text-xl font-bold text-white">
//                             Nothing fits right now
//                         </Text>
//
//                         <Text className="mt-2 text-center leading-6 text-zinc-400">
//                             Change your current context or create a
//                             task that can be done here.
//                         </Text>
//
//                         <Pressable
//                             onPress={() =>
//                                 router.push("/create_task")
//                             }
//                             className="mt-6 rounded-2xl bg-white px-6 py-4"
//                         >
//                             <Text className="font-bold text-zinc-950">
//                                 Create task
//                             </Text>
//                         </Pressable>
//                     </View>
//                 ) : (
//                     <>
//                         <View className="mt-5">
//                             <RightNowTaskCard
//                                 task={rightNowFeed.heroTask}
//                                 contexts={DEFAULT_CONTEXTS}
//                                 featured
//                                 onComplete={handleCompleteTask}
//                             />
//                         </View>
//
//                         {rightNowFeed.nextTasks.length > 0 && (
//                             <View className="mt-6">
//                                 <Text className="mb-3 text-lg font-bold text-white">
//                                     Next up
//                                 </Text>
//
//                                 <View className="gap-4">
//                                     {rightNowFeed.nextTasks.map(
//                                         (task) => (
//                                             <RightNowTaskCard
//                                                 key={task.id}
//                                                 task={task}
//                                                 contexts={
//                                                     DEFAULT_CONTEXTS
//                                                 }
//                                                 onComplete={
//                                                     handleCompleteTask
//                                                 }
//                                             />
//                                         )
//                                     )}
//                                 </View>
//                             </View>
//                         )}
//                     </>
//                 )}
//             </View>
//         </ScrollView>
//     );
// }

