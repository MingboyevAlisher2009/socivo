import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar.tsx";
import DockMenu from "./components/dock.tsx";
import { SocketProvider } from "./context/socket-context.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{ theme: dark }}
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SocketProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto relative pt-24 pb-24">
            <App />
          </main>
          <DockMenu />
          <Toaster position="top-right" />
        </SocketProvider>
      </ThemeProvider>
    </ClerkProvider>
  </BrowserRouter>
);
