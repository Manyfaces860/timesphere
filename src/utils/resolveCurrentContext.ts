// src/utils/resolveCurrentContext.ts

import type {
    CurrentContext,
    EnergyLevel,
    Routine,
} from "@/types";

import { getCurrentRoutineBlock } from "./routineContext";

export function resolveCurrentContextFromRoutine(
    routines: Routine[],
    energyLevel: EnergyLevel,
    now = new Date()
): CurrentContext {
    const activeBlock = getCurrentRoutineBlock(
        routines,
        now
    );

    return {
        contextId: activeBlock?.block.contextId,
        energyLevel,
        source: "routine",
        detectedAt: now.toISOString(),
    };
}