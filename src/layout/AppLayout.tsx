import { Outlet } from "react-router-dom";
import Header from "../common/ui/Header";
import Sidebar from "../common/ui/Sidebar";
import Footer from "../common/ui/Footer";
import { useTheme } from "../theme";

export default function AppLayout() {
  const { theme } = useTheme();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: theme.background, color: theme.primaryText }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Right container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="shrink-0 sticky top-0 z-10">
          <Header />
        </header>

        {/* MAIN SCROLL AREA */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ backgroundColor: theme.background }}
        >
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="shrink-0">
          <Footer />
        </footer>
      </div>
    </div>
  );
}

