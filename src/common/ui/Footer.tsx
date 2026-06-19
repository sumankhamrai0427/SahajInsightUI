import { useTheme } from "../../theme";

export default function Footer() {
  function getCurrentYear() {
    return new Date().getFullYear();
  }

  const currentYear = getCurrentYear();
  const { theme } = useTheme();

  return (
    <footer
      className="flex justify-between items-center h-14 text-sm font-medium px-[1%] border-t"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.secondaryText,
      }}
    >
      ©{currentYear} Aivista Technologies Pvt. Ltd. All rights reserved
    </footer>
  );
}
