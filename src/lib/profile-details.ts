export const EXTENDED_PROFILE_KEYS = [
  "education_level",
  "occupation",
  "industry",
  "languages",
  "living_situation",
  "relationship_status",
  "has_children",
  "children_details",
  "child_wish",
  "sports",
  "lifestyle",
  "favorite_activities",
  "dating_preferences",
  "appearance_style",
  "tattoos",
  "piercings",
] as const;

export type ExtendedProfileKey = (typeof EXTENDED_PROFILE_KEYS)[number];
export type ProfileVisibility = Record<ExtendedProfileKey, boolean>;
export type ExtendedProfileValues = Record<ExtendedProfileKey, string>;

export const EMPTY_EXTENDED_PROFILE: ExtendedProfileValues = Object.fromEntries(
  EXTENDED_PROFILE_KEYS.map((key) => [key, ""]),
) as ExtendedProfileValues;

export const DEFAULT_PROFILE_VISIBILITY: ProfileVisibility = Object.fromEntries(
  EXTENDED_PROFILE_KEYS.map((key) => [key, false]),
) as ProfileVisibility;

export function readProfileVisibility(value: unknown): ProfileVisibility {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...DEFAULT_PROFILE_VISIBILITY };
  const raw = value as Record<string, unknown>;
  return Object.fromEntries(
    EXTENDED_PROFILE_KEYS.map((key) => [key, raw[key] === true]),
  ) as ProfileVisibility;
}

export function csvToArray(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function profileToExtendedValues(profile: Record<string, unknown> | null | undefined): ExtendedProfileValues {
  if (!profile) return { ...EMPTY_EXTENDED_PROFILE };
  return Object.fromEntries(
    EXTENDED_PROFILE_KEYS.map((key) => {
      const value = profile[key];
      return [key, Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : ""];
    }),
  ) as ExtendedProfileValues;
}