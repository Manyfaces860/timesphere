import CreateTask from "@/components/createTask";
import { createTask } from "@/services/taskStorage";
import type { Context, Task } from "@/types";
import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { contexts } from '@/constants/contexts'
import {ScreenBackground} from "@/components/ScreenBackground";


export default function CreateTaskScreen() {
    function handleSaveTask(task: Task) {
        try {
            createTask(task);

            Alert.alert(
                "Task saved",
                "Your task has been created successfully.",
                [
                    {
                        text: "Done",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error("Failed to save task:", error);

            Alert.alert(
                "Could not save task",
                "Please try again."
            );
        }
    }

    return (
<ScreenBackground>
        <View className="flex-1">
            <Pressable
                onPress={() => router.back()}
                className="absolute left-5 top-14 z-10 h-11 w-11 items-center justify-center rounded-full bg-zinc-900"
            >
                <Text className="text-2xl text-white">‹</Text>
            </Pressable>

            <CreateTask
                contexts={contexts}
                onSave={handleSaveTask}
            />
        </View>
</ScreenBackground>
    );
}