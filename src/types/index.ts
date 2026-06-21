// types/timesphere.ts

export type WeekDay =
    | "mon"
    | "tue"
    | "wed"
    | "thu"
    | "fri"
    | "sat"
    | "sun";

export type EnergyLevel = "any" | "low" | "high";

export type Priority = "low" | "medium" | "high";

export type TaskFilter = "active" | "completed" | "all";

export type ContextSource =
    | "manual"
    | "routine"
    | "geofence"
    | "wifi";

export type Context = {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
};

export type RoutineBlock = {
  id: string;
  contextId: string;
  name?: string;
  startMinutes: number;
  endMinutes: number;
  order: number;
};

export type Routine = {
  id: string;
  name: string;
  days: WeekDay[];
  blocks: RoutineBlock[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  notes?: string;

  completed: boolean;
  completedAt?: string;

  contextIds: string[];
  energyLevel: EnergyLevel;

  prepareForContextId?: string;
  preparationMinutesBefore?: number;

  priority: Priority;

  createdAt: string;
  updatedAt: string;
};

export type CurrentContext = {
  contextId?: string;
  energyLevel: EnergyLevel;
  source: ContextSource;
  detectedAt: string;
};

export type TimeSphereState = {
  contexts: Context[];
  routines: Routine[];
  tasks: Task[];
  currentContext: CurrentContext;
};
