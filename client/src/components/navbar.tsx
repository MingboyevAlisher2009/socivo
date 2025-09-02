import { useAppStore } from "@/store";
import { Leaf, Loader2, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BASE_URL } from "@/http/axios";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const { userInfo, logout, logoutLoading } = useAppStore();
  const { pathname } = useLocation();

  return (
    <>
      {!pathname.startsWith("/auth") && (
        <motion.nav
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="xl:w-7xl w-[95%] fixed left-1/2 -translate-x-1/2 z-50 top-4 border border-border bg-white/10 dark:bg-black/10 backdrop-blur-md flex justify-between items-center px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-lg"
        >
          {/* Logo */}
          <div>
            <Link className="flex items-center gap-2" to={"/"}>
              <Leaf className="text-primary w-7 h-7 md:w-8 md:h-8" />
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white">
                Socivo
              </h1>
            </Link>
          </div>

          {/* Avatar */}
          <div className="cursor-pointer hover:scale-105 active:scale-95 transition-transform">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    className="object-cover"
                    src={`${BASE_URL}/${userInfo?.avatar}`}
                    alt={userInfo?.username || "User"}
                  />
                  <AvatarFallback>
                    {userInfo?.first_name && userInfo?.last_name
                      ? `${userInfo.first_name
                          .charAt(0)
                          .toUpperCase()}${userInfo.last_name
                          .charAt(0)
                          .toUpperCase()}`
                      : userInfo?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem disabled={logoutLoading} onClick={logout}>
                  {logoutLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <LogOut /> Logout
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.nav>
      )}
    </>
  );
};

export default Navbar;
