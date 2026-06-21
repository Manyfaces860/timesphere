// src/utils/routineContext.ts

import type {
    Routine,
    RoutineBlock,
    WeekDay,
} from "@/types";

export type ResolvedRoutineBlock = {
    routine: Routine;
    block: RoutineBlock;
    startsAt: Date;
    endsAt: Date;
};

export type RoutineContextResult = {
    currentBlock?: ResolvedRoutineBlock;
    nextBlock?: ResolvedRoutineBlock;
};

const DAY_INDEX_TO_WEEKDAY: Record<number, WeekDay> = {
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
};

function getWeekDay(date: Date): WeekDay {
    return DAY_INDEX_TO_WEEKDAY[date.getDay()];
}

function getMinutesSinceMidnight(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

function createDateAtMinutes(
    baseDate: Date,
    minutesSinceMidnight: number
): Date {
    const result = new Date(baseDate);

    const hours = Math.floor(minutesSinceMidnight / 60);
    const minutes = minutesSinceMidnight % 60;

    result.setHours(hours, minutes, 0, 0);

    return result;
}

function getEnabledRoutinesForDay(
    routines: Routine[],
    date: Date
): Routine[] {
    const weekday = getWeekDay(date);

    return routines.filter(
        (routine) =>
            routine.enabled &&
            routine.days.includes(weekday)
    );
}

export function getCurrentRoutineBlock(
    routines: Routine[],
    now = new Date()
): ResolvedRoutineBlock | undefined {
    const currentMinutes =
        getMinutesSinceMidnight(now);

    const applicableRoutines =
        getEnabledRoutinesForDay(routines, now);

    const matches: ResolvedRoutineBlock[] = [];

    for (const routine of applicableRoutines) {
        for (const block of routine.blocks) {
            const isActive =
                block.startMinutes <= currentMinutes &&
                currentMinutes < block.endMinutes;

            if (!isActive) {
                continue;
            }

            matches.push({
                routine,
                block,
                startsAt: createDateAtMinutes(
                    now,
                    block.startMinutes
                ),
                endsAt: createDateAtMinutes(
                    now,
                    block.endMinutes
                ),
            });
        }
    }

    /*
     * There should normally only be one active block.
     * If routines overlap, prefer the block that started
     * most recently.
     */
    return matches.sort(
        (first, second) =>
            second.block.startMinutes -
            first.block.startMinutes
    )[0];
}

function getNextBlockOnDate(
    routines: Routine[],
    date: Date,
    minimumMinutes: number
): ResolvedRoutineBlock | undefined {
    const applicableRoutines =
        getEnabledRoutinesForDay(routines, date);

    const candidates: ResolvedRoutineBlock[] = [];

    for (const routine of applicableRoutines) {
        for (const block of routine.blocks) {
            if (block.startMinutes <= minimumMinutes) {
                continue;
            }

            candidates.push({
                routine,
                block,
                startsAt: createDateAtMinutes(
                    date,
                    block.startMinutes
                ),
                endsAt: createDateAtMinutes(
                    date,
                    block.endMinutes
                ),
            });
        }
    }

    return candidates.sort(
        (first, second) =>
            first.startsAt.getTime() -
            second.startsAt.getTime()
    )[0];
}

export function getNextRoutineBlock(
    routines: Routine[],
    now = new Date()
): ResolvedRoutineBlock | undefined {
    const currentMinutes =
        getMinutesSinceMidnight(now);

    /*
     * First look for a later block today.
     */
    const nextToday = getNextBlockOnDate(
        routines,
        now,
        currentMinutes
    );

    if (nextToday) {
        return nextToday;
    }

    /*
     * If today has no more blocks, search the next
     * seven days.
     */
    for (let dayOffset = 1; dayOffset <= 7; dayOffset += 1) {
        const futureDate = new Date(now);

        futureDate.setDate(
            futureDate.getDate() + dayOffset
        );

        /*
         * -1 allows a block beginning at midnight.
         */
        const nextBlock = getNextBlockOnDate(
            routines,
            futureDate,
            -1
        );

        if (nextBlock) {
            return nextBlock;
        }
    }

    return undefined;
}

export function resolveRoutineContext(
    routines: Routine[],
    now = new Date()
): RoutineContextResult {
    return {
        currentBlock: getCurrentRoutineBlock(
            routines,
            now
        ),
        nextBlock: getNextRoutineBlock(
            routines,
            now
        ),
    };
}