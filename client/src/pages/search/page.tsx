import SeoHead from "@/components/hamlet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance, { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Search = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<IUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleFollowLoading, setToggleFollowLoading] = useState(false);

  const toggleFollow = async (id: string) => {
    if (!userInfo) {
      return;
    }
    setToggleFollowLoading(true);
    try {
      const { data } = await axiosInstance.post("/posts/follow", {
        id,
      });

      if (data.data.type === "follow") {
        setUserInfo({
          ...userInfo,
          following: [...userInfo.following, data.data],
        });
      } else {
        const followingUsers = userInfo.following.filter(
          (f) => f.id !== data.data.id
        );
        console.log(followingUsers);

        setUserInfo({ ...userInfo, following: followingUsers });
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Something went wrong. Please try again."
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setToggleFollowLoading(false);
    }
  };

  const getUsers = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      if (!searchQuery.trim()) {
        setUsers(null);
        return;
      }
      const { data } = await axiosInstance.get(`/auth/search/${searchQuery}`);
      console.log(data);
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers(query);
  }, [query]);

  return (
    <>
      <SeoHead
        title="Search"
        description="Explore users related to your search in the community."
      />

      <div className="w-full flex flex-col items-center space-y-5 p-2 md:p-0">
        <div className="relative w-full md:max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border py-4 pl-10 pr-4 text-white shadow-sm"
            placeholder="Search for users..."
            type="text"
          />
        </div>
        <div className="flex w-full md:max-w-xl flex-col gap-3">
          <AnimatePresence>
            {isLoading && query.trim() ? (
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: i * 0.05,
                  }}
                >
                  <Card className="p-0">
                    <CardContent className="flex items-center justify-between w-full gap-2 rounded-3xl p-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full p-2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : users && users.length > 0 ? (
              users.map((user, i) => (
                <motion.div
                  onClick={() => navigate(`/profile/${user.id}`)}
                  key={user.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: i * 0.05,
                  }}
                >
                  <Card className="p-0 cursor-pointer">
                    <CardContent className="flex w-full items-center justify-between gap-2 rounded-3xl p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`${BASE_URL}/${user.avatar}`} />
                          <AvatarFallback className="capitalize">
                            {user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="capitalize">{user.username}</h2>
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleFollow(user.id)}
                        disabled={toggleFollowLoading}
                        className="rounded-full bg-transparent"
                        variant="outline"
                      >
                        {userInfo &&
                        userInfo?.following.some((f) => f.id === user.id) ? (
                          <>
                            <UserMinus className="lg:mr-2 h-4 w-4" />
                            <p className="hidden lg:block">Unfollow</p>
                          </>
                        ) : (
                          <>
                            <UserPlus className="lg:mr-2 h-4 w-4" />
                            <p className="hidden lg:block">Follow</p>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : !isLoading && query.trim() ? (
              <motion.div
                key="no-users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="text-center text-gray-500">No users found.</p>
              </motion.div>
            ) : (
              <motion.div
                key="start-typing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="text-center text-gray-500">
                  Start typing to search for users.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Search;
