import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/navbar.tsx";
import DockMenu from "./components/dock.tsx";
import { SocketProvider } from "./context/socket-context.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SocketProvider>
        <Navbar />
        <main className="max-w-7xl mx-auto px-2 relative pt-24 pb-24">
          <App />
        </main>
        <DockMenu />
        <Toaster />
      </SocketProvider>
    </ThemeProvider>
  </BrowserRouter>
);
