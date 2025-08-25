import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { BASE_URL } from "@/http/axios";
import { NotificationsSkeleton } from "./components/notifications-skeleton";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" fill="currentColor" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-primary" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getNotificationMessage = (notification: any) => {
  const senderName =
    notification.sender.first_name && notification.sender.last_name
      ? `${notification.sender.first_name} ${notification.sender.last_name}`
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

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const Notifications = () => {
  const { notifications, notificatoinLoading } =
    useAppStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  if (notificatoinLoading) {
    return <NotificationsSkeleton />;
  }

  const filteredNotifications =
    filter === "unread"
      ? notifications
        ? notifications.filter((n) => !n.is_seen)
        : []
      : notifications || [];
  const unreadCount =
    (notifications && notifications.filter((n) => !n.is_seen).length) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                You have {unreadCount} unread notification
                {unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-sm"
          >
            All ({notifications ? notifications.length : 0})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="text-sm"
          >
            Unread ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              //   onClick={markAllAsRead}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {filter === "unread"
                ? "You've read all your notifications. New ones will appear here when they arrive."
                : "When you receive notifications, they'll show up here to keep you updated."}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "p-4 transition-all duration-200 hover:shadow-md cursor-pointer group relative overflow-hidden",
                !notification.is_seen &&
                  "bg-primary/5 border-l-4 border-l-primary shadow-sm"
              )}
              //   onClick={() =>
              //     !notification.is_seen && markAsRead(notification.id)
              //   }
            >
              {!notification.is_seen && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
              )}

              <div className="flex items-start gap-4 relative">
                <div className="relative">
                  <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-background">
                    <AvatarImage
                      src={notification.sender.avatar || undefined}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {notification.sender.first_name?.[0] ||
                        notification.sender.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {getNotificationMessage(notification)}
                        </p>
                        {!notification.is_seen && (
                          <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>

                      {notification.comment && notification.comment.comment && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3 border-l-2 border-primary/20">
                          <p className="text-sm text-foreground italic">
                            "{notification.comment.comment}"
                          </p>
                        </div>
                      )}

                      {notification.post && notification.post.id && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mt-2">
                          <img
                            src={
                              `${BASE_URL}/${notification.post.image}` ||
                              "/placeholder.svg"
                            }
                            alt="Post"
                            className="h-14 w-14 rounded-lg object-cover border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium truncate">
                              {notification.post.content}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.post.created_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {!notification.is_seen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          //   onClick={(e) => {
                          //     e.stopPropagation();
                          //     markAsRead(notification.id);
                          //   }}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
