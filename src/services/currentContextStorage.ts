import NativeLocalStorage from "@/../specs/NativeLocalStorage";
import type { CurrentContext } from "@/types";
import {STORAGE_KEYS} from "@/constants/data";

const CURRENT_CONTEXT_KEY = STORAGE_KEYS.currentContext;

const DEFAULT_CURRENT_CONTEXT: CurrentContext = {
    contextId: undefined,
    energyLevel: "any",
    source: "manual",
    detectedAt: new Date().toISOString(),
};

function isCurrentContext(
    value: unknown
): value is CurrentContext {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const context = value as Partial<CurrentContext>;

    const validEnergyLevels = [
        "any",
        "low",
        "high",
    ];

    const validSources = [
        "manual",
        "routine",
        "geofence",
        "wifi",
    ];

    return (
        (context.contextId === undefined ||
            typeof context.contextId === "string") &&
        typeof context.energyLevel === "string" &&
        validEnergyLevels.includes(
            context.energyLevel
        ) &&
        typeof context.source === "string" &&
        validSources.includes(context.source) &&
        typeof context.detectedAt === "string"
    );
}

export function getCurrentContext(): CurrentContext {
    const storedValue = NativeLocalStorage.getItem(
        CURRENT_CONTEXT_KEY
    );

    if (!storedValue) {
        return DEFAULT_CURRENT_CONTEXT;
    }

    try {
        const parsedValue: unknown =
            JSON.parse(storedValue);

        if (!isCurrentContext(parsedValue)) {
            console.warn(
                "Stored current context is invalid"
            );

            return DEFAULT_CURRENT_CONTEXT;
        }

        return parsedValue;
    } catch (error) {
        console.error(
            "Failed to parse current context:",
            error
        );

        return DEFAULT_CURRENT_CONTEXT;
    }
}

export function saveCurrentContext(
    currentContext: CurrentContext
): void {
    NativeLocalStorage.setItem(
        JSON.stringify(currentContext),
        CURRENT_CONTEXT_KEY
    );
}

export function updateManualContext(
    updates: Pick<
        CurrentContext,
        "contextId" | "energyLevel"
    >
): CurrentContext {
    const updatedContext: CurrentContext = {
        contextId: updates.contextId,
        energyLevel: updates.energyLevel,
        source: "manual",
        detectedAt: new Date().toISOString(),
    };

    saveCurrentContext(updatedContext);

    return updatedContext;
}

export function clearCurrentContext(): void {
    NativeLocalStorage.removeItem(
        CURRENT_CONTEXT_KEY
    );
}