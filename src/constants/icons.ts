// import activity from "@/assets/icons/activity.png";
// import add from "@/assets/icons/add.png";
// import pen from "@/assets/icons/pen.webp";
// import back from "@/assets/icons/back.png";
// import pen_static from "@/assets/icons/pen-static.png";
// import checklist from "@/assets/icons/checklist.webp";
// import checklist_static from "@/assets/icons/checklist-static.png";
// import daily_routine from "@/assets/icons/daily-routine.webp";
// import daily_routine_static from "@/assets/icons/daily-routine-static.png";
// import now from "@/assets/icons/now.webp";
// import now_static from "@/assets/icons/now-static.png";
// import menu from "@/assets/icons/menu.png";
// import notion from "@/assets/icons/notion.png";
// import openai from "@/assets/icons/openai.png";
// import plus from "@/assets/icons/plus.png";
// import setting from "@/assets/icons/setting.png";
// import spotify from "@/assets/icons/spotify.png";
// import wallet from "@/assets/icons/wallet.png";
import { Home, Plus, LucideTimeline, ClipboardPenIcon, User } from "lucide-react-native";


export const icons = {
    Home, Plus, LucideTimeline, ClipboardPenIcon, User,
} as const;

export type IconKey = keyof typeof icons;