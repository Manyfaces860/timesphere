import {Context} from "@/types";


export const contexts: Context[] = [
    {
        id: "context_home",
        name: "Home",
        icon: "home",
        createdAt: new Date().toISOString(),
    },
    {
        id: "context_work",
        name: "Work",
        createdAt: new Date().toISOString(),
    },
    {
        id: "context_gym",
        name: "Gym",
        createdAt: new Date().toISOString(),
    },
    {
        id: "context_outside",
        name: "Outside",
        createdAt: new Date().toISOString(),
    },
];