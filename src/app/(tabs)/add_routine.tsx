// app/routine/create.tsx

import CreateRoutine from "@/components/createRoutine";
import type {
    Routine,
} from "@/types/index";

import { contexts } from '@/constants/contexts'
import {createRoutine} from "@/services/routineStorage";
import {Alert} from "react-native";
import {useRouter} from "expo-router";
import {ScreenBackground} from "@/components/ScreenBackground";

export default function CreateRoutineScreen() {
    const router = useRouter();

    function handleSaveRoutine(routine: Routine) {
        try {
            createRoutine(routine);

            Alert.alert(
                "Routine saved",
                "Your routine has been created successfully.",
                [
                    {
                        text: "show my routines",
                        onPress: () => {
                            router.replace("/show_routine");
                        },
                    },
                    {
                        text: "take me to my tasks",
                        onPress: () => {
                            router.replace("/");
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Failed to save routine:", error);

            Alert.alert(
                "Could not save routine",
                "Please try again."
            );
        }
    }
    return (
        <ScreenBackground>
            <CreateRoutine
                contexts={contexts}
                onSave={handleSaveRoutine}
            />
        </ScreenBackground>
    );
}