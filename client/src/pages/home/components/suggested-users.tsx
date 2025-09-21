import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/http/axios";
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import { AxiosError } from "axios";
import { UserMinus, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SuggestedUsers() {
  const { suggestedUsers, getSuggestedUsers, setUserInfo, userInfo } =
    useAppStore();
  const navigate = useNavigate();
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

  useEffect(() => {
    getSuggestedUsers();
  }, []);

  const getUserName = (user: IUser) => {
    const senderName =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username;
    return senderName;
  };

  return (
    <Card className="w-full sticky top-24">
      <CardHeader>
        <CardTitle>Suggested Users</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {suggestedUsers ? (
          suggestedUsers.map((user) => (
            <div
              onClick={() => navigate(`/profile/${user.id}`)}
              key={user.id}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={`@${user.username}`}
                  />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                  <p className="text-sm font-medium leading-none">
                    {getUserName(user)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => toggleFollow(user.id)}
                disabled={toggleFollowLoading}
                variant="outline"
                size="sm"
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
            </div>
          ))
        ) : (
          <div className="mx-auto flex flex-col items-center">
            <div className="space-y-3">
              <Users className="md:w-10 md:h-10" />
            </div>

            <div className="mt-4 text-center text-gray-500 dark:text-gray-400 italic">
              Suggested users not found
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
