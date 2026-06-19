import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from "react";
import { themes } from "./themes";
import { ThemeColorKey, ThemeDefinition, ThemeOption } from "./types";

const STORAGE_KEY = "insightgrid-theme";
const cssVarMap: Record<ThemeColorKey, string> = {
    background: "--theme-background",
    secondaryBg: "--theme-secondary-bg",
    surface: "--theme-surface",
    primaryText: "--theme-primary-text",
    secondaryText: "--theme-secondary-text",
    accent: "--theme-accent",
    border: "--theme-border",
    button: "--theme-button",
};

const colorKeys: ThemeColorKey[] = [
    "background",
    "secondaryBg",
    "surface",
    "primaryText",
    "secondaryText",
    "accent",
    "border",
];

type ThemeContextValue = {
    theme: ThemeDefinition;
    themeName: ThemeOption;
    setTheme: (theme: ThemeOption) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveInitialTheme(): ThemeOption {
    if (typeof window === "undefined") {
        return "light";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeOption>(() => resolveInitialTheme());

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, themeName);
        const theme = themes[themeName];

        colorKeys.forEach((key) => {
            const cssVar = cssVarMap[key];
            document.documentElement.style.setProperty(cssVar, theme[key]);
        });

        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.primaryText;
    }, [themeName]);

    const value = useMemo(
        () => ({
            theme: themes[themeName],
            themeName,
            setTheme: setThemeName,
        }),
        [themeName]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}