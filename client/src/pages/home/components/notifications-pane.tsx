import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";

export default function NotificationsPane() {
  const { notifications } = useAppStore();

  const getNotificationMessage = (notification: any) => {
    const senderName = notification.sender.first_name
      ? `${notification.sender.first_name} ${
          notification.sender.last_name || ""
        }`
      : notification.sender.username;

    switch (notification.type) {
      case "like":
        return `${senderName} liked your post`;
      case "comment":
        return `${senderName} commented on your post`;
      case "follow":
        return `${senderName} started following you`;
      default:
        return "New notification";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" fill="currentColor" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="w-full sticky top-24">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        {notifications?.length ? (
          <CardDescription>
            You have {notifications.filter((n) => !n.is_seen).length} unread
            notifications.
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications?.length ? (
          notifications.slice(0, 4).map((notification) => (
            <div key={notification.id} className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-[#18181b]">
                  <AvatarImage src={notification.sender.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {notification.sender.first_name?.[0] ||
                      notification.sender.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 bg-[#18181b] rounded-full">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              <div className="grid gap-0.5">
                <p
                  className={`text-sm line-clamp-1 ${
                    notification.is_seen
                      ? "text-muted-foreground"
                      : "font-medium"
                  }`}
                >
                  {getNotificationMessage(notification)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">
            No notifications yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
