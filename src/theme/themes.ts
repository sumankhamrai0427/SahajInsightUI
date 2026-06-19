import darkTheme from "./darkTheme";
import lightTheme from "./lightTheme";
import { ThemeDefinition, ThemeOption } from "./types";

export const themes: Record<ThemeOption, ThemeDefinition> = {
  light: lightTheme,
  dark: darkTheme,
};
