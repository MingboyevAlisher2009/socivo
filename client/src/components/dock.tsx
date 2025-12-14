import { Dock, DockIcon } from "@/components/magicui/dock";
import {
  Heart,
  HomeIcon,
  MessageCircle,
  Search,
  UserCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store";

const DockMenu = () => {
  const { userInfo, notifications } = useAppStore();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const items = [
    { to: "/", icon: HomeIcon, label: "Home" },
    { to: "/notifications", icon: Heart, label: "Notifications" },
    { to: "/direct", icon: MessageCircle, label: "Direct" },
    { to: "/search", icon: Search, label: "Search" },
    {
      to: `/profile/${userInfo?.username || userInfo?.id}`,
      icon: UserCircle,
      label: "Profile",
    },
  ];

  const unread = notifications && notifications.some((n) => !n.is_seen);

  return (
    <>
      {!pathname.startsWith("/auth") && !pathname.startsWith("/room") && (
        <div
          className={cn(
            "fixed left-1/2 -translate-x-1/2 z-40",
            isMobile ? "bottom-2" : "bottom-6"
          )}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <Dock
              iconSize={isMobile ? 44 : 56}
              iconMagnification={isMobile ? 44 : 88}
              iconDistance={isMobile ? 90 : 140}
            >
              {items.map(({ to, icon: Icon, label }, i) => {
                const isActive = pathname === to;
                return (
                  <DockIcon
                    key={i}
                    className={cn(
                      "bg-transparent hover:bg-transparent rounded-xl p-1",
                      isMobile ? "active:scale-95" : "hover:scale-110"
                      //   isActive && "bg-white/30 dark:bg-white/20 shadow-md"
                    )}
                  >
                    <Link
                      to={to}
                      className="flex items-center justify-center w-full h-full relative"
                      aria-label={label}
                    >
                      {to === "/notifications" && unread && (
                        <div>
                          <span className="absolute top-0 right-0 ring-2 ring-transparent w-3 h-3 bg-primary rounded-full"></span>
                          <span className="absolute top-0 right-0 ring-2 ring-transparent w-3 h-3 animate-ping bg-primary rounded-full"></span>
                        </div>
                      )}
                      <Icon
                        className={cn(
                          "size-full transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-gray-700 dark:text-gray-200"
                        )}
                      />
                    </Link>
                  </DockIcon>
                );
              })}
            </Dock>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DockMenu;
