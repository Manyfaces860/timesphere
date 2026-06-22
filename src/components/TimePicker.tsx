// components/TimePickerField.tsx

import DateTimePicker from "@expo/ui/community/datetime-picker";
import { useEffect, useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";

type TimePickerFieldProps = {
    label: string;
    value: number;
    onChange: (minutes: number) => void;
};

function minutesToDate(totalMinutes: number): Date {
    const date = new Date();

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    date.setHours(hours, minutes, 0, 0);

    return date;
}

function dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

export function formatMinutes(
    totalMinutes: number
): string {
    const normalizedMinutes =
        totalMinutes % (24 * 60);

    const hours = Math.floor(
        normalizedMinutes / 60
    );

    const minutes =
        normalizedMinutes % 60;

    const period =
        hours >= 12 ? "PM" : "AM";

    const displayHour =
        hours % 12 || 12;

    return `${displayHour}:${minutes
        .toString()
        .padStart(2, "0")} ${period}`;
}

export default function TimePicker({
                                            label,
                                            value,
                                            onChange,
                                        }: TimePickerFieldProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Temporary value is useful on iOS because the user
    // can scroll before pressing Done.
    const [temporaryDate, setTemporaryDate] = useState(
        minutesToDate(value)
    );

    useEffect(() => {
        if (!isOpen) {
            setTemporaryDate(minutesToDate(value));
        }
    }, [value, isOpen]);

    function openPicker() {
        setTemporaryDate(minutesToDate(value));
        setIsOpen(true);
    }

    function handleAndroidChange(selectedDate: Date) {
        onChange(dateToMinutes(selectedDate));
        setIsOpen(false);
    }

    function handleIOSConfirm() {
        onChange(dateToMinutes(temporaryDate));
        setIsOpen(false);
    }

    return (
        <View>
            <Text className="mb-2 text-sm font-sans-medium text-zinc-300">
                {label}
            </Text>

            <Pressable
                onPress={openPicker}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4"
            >
                <Text className="text-base font-sans-semibold text-white">
                    {formatMinutes(value)}
                </Text>
            </Pressable>

            {Platform.OS === "android" && isOpen && (
                <DateTimePicker
                    value={temporaryDate}
                    mode="time"
                    presentation="dialog"
                    display="default"
                    is24Hour={false}
                    positiveButton={{ label: "Done" }}
                    onValueChange={(_, selectedDate) => {
                        handleAndroidChange(selectedDate);
                    }}
                    onDismiss={() => {
                        setIsOpen(false);
                    }}
                />
            )}

            {Platform.OS === "ios" && (
                <Modal
                    visible={isOpen}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIsOpen(false)}
                >
                    <Pressable
                        onPress={() => setIsOpen(false)}
                        className="flex-1 justify-end bg-black/60"
                    >
                        <Pressable
                            onPress={(event) => event.stopPropagation()}
                            className="rounded-t-[32px] bg-zinc-900 px-5 pb-10 pt-5"
                        >
                            <View className="mb-4 flex-row items-center justify-between">
                                <Pressable onPress={() => setIsOpen(false)}>
                                    <Text className="text-base font-sans-semibold text-zinc-400">
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Text className="text-lg font-sans-bold text-white">
                                    Select time
                                </Text>

                                <Pressable onPress={handleIOSConfirm}>
                                    <Text className="text-base font-sans-bold text-blue-400">
                                        Done
                                    </Text>
                                </Pressable>
                            </View>

                            <DateTimePicker
                                value={temporaryDate}
                                mode="time"
                                display="spinner"
                                themeVariant="dark"
                                onValueChange={(_, selectedDate) => {
                                    setTemporaryDate(selectedDate);
                                }}
                            />
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}