export type ThemeOption = "light" | "dark";

export type ThemeColorKey =
  | "background"
  | "secondaryBg"
  | "surface"
  | "primaryText"
  | "secondaryText"
  | "accent"
  | "border"
  | "button";

export type ThemeDefinition = {
  id: ThemeOption;
  label: string;
} & Record<ThemeColorKey, string>;