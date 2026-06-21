// src/services/routineStorage.ts

import NativeLocalStorage from "@/../specs/NativeLocalStorage";
import type { Routine } from "@/types";
import { STORAGE_KEYS } from "@/constants/data";

const ROUTINES_KEY = STORAGE_KEYS.routines;

export function getRoutines(): Routine[] {
    const storedValue = NativeLocalStorage.getItem(ROUTINES_KEY);

    if (!storedValue) {
        return [];
    }

    try {
        const parsedValue: unknown = JSON.parse(storedValue);

        if (!Array.isArray(parsedValue)) {
            return [];
        }

        return parsedValue as Routine[];
    } catch (error) {
        console.error("Failed to parse routines:", error);
        return [];
    }
}

export function saveRoutines(routines: Routine[]): void {
    NativeLocalStorage.setItem(
        JSON.stringify(routines),
        ROUTINES_KEY
    );
}

export function createRoutine(routine: Routine): void {
    const existingRoutines = getRoutines();

    const updatedRoutines = [
        ...existingRoutines,
        routine,
    ];

    saveRoutines(updatedRoutines);
}

export function updateRoutine(
    routineId: string,
    updates: Partial<
        Omit<Routine, "id" | "createdAt">
    >
): Routine | null {
    const routines = getRoutines();

    const existingRoutine = routines.find(
        (routine) => routine.id === routineId
    );

    if (!existingRoutine) {
        return null;
    }

    const updatedRoutine: Routine = {
        ...existingRoutine,
        ...updates,

        // Prevent these fields from being overwritten.
        id: existingRoutine.id,
        createdAt: existingRoutine.createdAt,

        updatedAt: new Date().toISOString(),
    };

    const updatedRoutines = routines.map(
        (routine) =>
            routine.id === routineId
                ? updatedRoutine
                : routine
    );

    saveRoutines(updatedRoutines);

    return updatedRoutine;
}

export function setRoutineEnabled(
    routineId: string,
    enabled: boolean
): Routine | null {
    return updateRoutine(routineId, {
        enabled,
    });
}

export function toggleRoutineEnabled(
    routineId: string
): Routine | null {
    const routines = getRoutines();

    const routine = routines.find(
        (item) => item.id === routineId
    );

    if (!routine) {
        return null;
    }

    return setRoutineEnabled(
        routineId,
        !routine.enabled
    );
}