import type {
    CurrentContext,
    Priority,
    Task,
} from "@/types";

const PRIORITY_ORDER: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
};

export type RightNowFeed = {
    heroTask?: Task;
    nextTasks: Task[];
    allMatchingTasks: Task[];
};

/**
 * Checks whether a task matches the user's current place.
 */
function matchesCurrentContext(
    task: Task,
    currentContext: CurrentContext
): boolean {
    /*
     * Empty contextIds means the task is available anywhere.
     */
    if (task.contextIds.length === 0) {
        return true;
    }

    /*
     * If the task requires a context but the user has not
     * selected one, the task cannot match.
     */
    if (!currentContext.contextId) {
        return false;
    }

    return task.contextIds.includes(
        currentContext.contextId
    );
}

/**
 * Checks whether the task's required energy matches
 * the user's current energy.
 */
function matchesCurrentEnergy(
    task: Task,
    currentContext: CurrentContext
): boolean {
    /*
     * "any" on the task means the task works at every
     * energy level.
     */
    if (task.energyLevel === "any") {
        return true;
    }

    /*
     * If the user selected "any", they have not given us
     * a specific energy restriction. Show all energy tasks.
     */
    if (currentContext.energyLevel === "any") {
        return true;
    }

    return (
        task.energyLevel ===
        currentContext.energyLevel
    );
}

/**
 * Preparation tasks belong to the Upcoming feed,
 * not the normal Right Now feed.
 */
function isPreparationOnlyTask(task: Task): boolean {
    return Boolean(task.prepareForContextId);
}

/**
 * Sorts matching tasks by:
 *
 * 1. Higher priority first
 * 2. Newer task first when priority is equal
 */
function sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((first, second) => {
        const priorityDifference =
            PRIORITY_ORDER[second.priority] -
            PRIORITY_ORDER[first.priority];

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
        );
    });
}

export function getRightNowFeed(
    tasks: Task[],
    currentContext: CurrentContext
): RightNowFeed {
    const matchingTasks = tasks.filter((task) => {
        if (task.completed) {
            return false;
        }

        if (isPreparationOnlyTask(task)) {
            return false;
        }

        if (
            !matchesCurrentContext(task, currentContext)
        ) {
            return false;
        }

        if (
            !matchesCurrentEnergy(task, currentContext)
        ) {
            return false;
        }

        return true;
    });

    const sortedTasks = sortTasks(matchingTasks);

    return {
        heroTask: sortedTasks[0],
        nextTasks: sortedTasks.slice(1, 4),
        allMatchingTasks: sortedTasks,
    };
}