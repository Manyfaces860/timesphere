import NativeLocalStorage from "@/../specs/NativeLocalStorage";
import type { Task } from "@/types";
import { STORAGE_KEYS } from "@/constants/data";

const TASKS_KEY = STORAGE_KEYS.tasks;

function isTaskArray(value: unknown): value is Task[] {
    return Array.isArray(value);
}

export function getTasks(): Task[] {
    const storedValue = NativeLocalStorage.getItem(TASKS_KEY);

    if (!storedValue) {
        return [];
    }

    try {
        const parsedValue: unknown = JSON.parse(storedValue);

        if (!isTaskArray(parsedValue)) {
            console.warn("Stored tasks are not an array");
            return [];
        }

        return parsedValue;
    } catch (error) {
        console.error("Failed to parse stored tasks:", error);
        return [];
    }
}

export function saveTasks(tasks: Task[]): void {
    NativeLocalStorage.setItem(
        JSON.stringify(tasks),
        TASKS_KEY
    );
}

export function createTask(task: Task): Task {
    const existingTasks = getTasks();

    const updatedTasks = [
        task,
        ...existingTasks,
    ];

    saveTasks(updatedTasks);

    return task;
}

export function updateTask(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
): Task | null {
    const existingTasks = getTasks();

    const targetTask = existingTasks.find(
        (task) => task.id === taskId
    );

    if (!targetTask) {
        return null;
    }

    const updatedTask: Task = {
        ...targetTask,
        ...updates,
        id: targetTask.id,
        createdAt: targetTask.createdAt,
        updatedAt: new Date().toISOString(),
    };

    const updatedTasks = existingTasks.map((task) =>
        task.id === taskId ? updatedTask : task
    );

    saveTasks(updatedTasks);

    return updatedTask;
}

export function completeTask(taskId: string): Task | null {
    return updateTask(taskId, {
        completed: true,
        completedAt: new Date().toISOString(),
    });
}

export function reopenTask(taskId: string): Task | null {
    return updateTask(taskId, {
        completed: false,
        completedAt: undefined,
    });
}

export function deleteTask(taskId: string): boolean {
    const existingTasks = getTasks();

    const updatedTasks = existingTasks.filter(
        (task) => task.id !== taskId
    );

    if (updatedTasks.length === existingTasks.length) {
        return false;
    }

    saveTasks(updatedTasks);

    return true;
}

export function getTaskById(taskId: string): Task | null {
    const tasks = getTasks();

    return (
        tasks.find((task) => task.id === taskId) ??
        null
    );
}

export function clearTasks(): void {
    NativeLocalStorage.removeItem(TASKS_KEY);
}