import { icons } from "./icons"
import type {Context, EnergyLevel, Priority} from "@/types";

export const tabs = [
    { name: "index", title: "Now", icon: icons.Home },
    { name: "add_routine", title: "Add", icon: icons.Plus },
    { name: "show_routine", title: "Routine", icon: icons.LucideTimeline },
    { name: "show_tasks", title: "Tasks", icon: icons.ClipboardPenIcon },
]

export const PRIORITY_ORDER: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
};

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
    any: "Any energy",
    low: "Low energy",
    high: "High energy",
};

export const STORAGE_KEYS = {
    contexts: "timesphere_contexts",
    routines: "timesphere_routines",
    tasks: "timesphere_tasks",
    currentContext: "timesphere_current_context",
} as const;