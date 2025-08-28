import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance, { BASE_URL } from "@/http/axios";
import { useAppStore } from "@/store";
import type { IUser } from "@/types";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Camera,
  Edit2,
  Loader2,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import type z from "zod";
import { userSchema } from "@/schema/form-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AxiosError } from "axios";
import SeoHead from "@/components/hamlet";

const Profile = () => {
  const { userInfo, getUserInfo } = useAppStore();
  const { username } = useParams();
  const [user, setUser] = useState(userInfo);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: userInfo?.username || "",
      first_name: userInfo?.first_name || "",
      last_name: userInfo?.last_name || "",
      bio: userInfo?.bio || "",
    },
  });

  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get<{ data: IUser }>(
        `/auth/${username}`
      );

      setUser(data.data);
    } catch (error) {
      navigate(`/profile/${userInfo?.username}`);
      toast.error("User doesn't exist.");
      console.error("Error fetching user info:", error);
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    setUpdateLoading(true);
    try {
      const { data } = await axiosInstance.put(`/auth/update/${userInfo?.id}`, {
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        bio: values.bio,
      });
      console.log(data);

      form.reset();
      setUpdateModal(false);
      getUserInfo();

      navigate(`/profile/${userInfo?.username}`);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Something went wrong. Please try again."
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleFollow = async () => {
    setFollowLoading(true);
    try {
      await axiosInstance.post("/posts/follow", {
        id: user?.id,
      });
      getUserData();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Something went wrong. Please try again."
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setFollowLoading(false);
    }
  };

  const addProfileImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setIsLoading(true);
    try {
      if (!selectedFile) {
        toast.error("Please select your image");
        return;
      } else if (!selectedFile.type.startsWith("image/")) {
        toast.error("Only image files are supported.");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", selectedFile as any);

      const { data } = await axiosInstance.post(
        "/auth/upload-avatar",
        formData
      );

      console.log(data);
      getUserInfo();
    } catch (error) {
    } finally {
      inputRef.current === null;
      setIsLoading(false);
    }
  };

  const removeProfileImage = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.delete(`/auth/avatar/${userInfo?.id}`);
      getUserInfo();
    } catch (error) {
      toast.error("Couldn't remove the photo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || !username) return;

    if (userInfo.username !== username) {
      getUserData();
      setIsOwnProfile(false);
    } else {
      setUser(userInfo);
      setIsOwnProfile(true);
    }
  }, [username]);

  const displayName =
    user?.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username;

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0).toUpperCase()}${user.last_name
        .charAt(0)
        .toUpperCase()}`;
    }
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  const stats = {
    posts: user?.posts?.length || 0,
    followers: user?.followers.length || 0,
    following: user?.following.length || 0,
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const avatarVariants: Variants = {
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const postVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <>
      <SeoHead
        title={`@${user?.username}`}
        image={user?.avatar && `${BASE_URL}/${user?.avatar}`}
        description={user?.bio}
      />

      <motion.div
        className="max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div
              className="flex-shrink-0"
              variants={itemVariants}
              whileHover="hover"
            >
              <motion.div variants={avatarVariants}>
                <div className="relative group w-32 h-32 md:w-40 md:h-40">
                  <Avatar className="w-full h-full shadow-lg">
                    <AvatarImage
                      className="object-cover"
                      src={
                        user?.avatar ? `${BASE_URL}/${user.avatar}` : undefined
                      }
                      alt={displayName}
                    />
                    <AvatarFallback className="text-2xl md:text-3xl font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  {isOwnProfile && (
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/40 
                   opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                      disabled={isLoading}
                      onClick={() => {
                        if (user?.avatar) {
                          removeProfileImage();
                        } else {
                          if (inputRef.current) {
                            inputRef.current.click();
                          }
                        }
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                      ) : user?.avatar ? (
                        <Trash2 className="text-white w-8 h-8" />
                      ) : (
                        <Camera className="text-white w-8 h-8" />
                      )}
                    </button>
                  )}
                  <Input
                    ref={inputRef}
                    onChange={addProfileImage}
                    type="file"
                    className="hidden"
                  />
                </div>
              </motion.div>
            </motion.div>

            <div className="flex-1 space-y-4">
              <motion.div className="space-y-2" variants={itemVariants}>
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.h1
                    className="text-2xl md:text-3xl font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {displayName}
                  </motion.h1>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setUpdateModal(true)}
                      variant={"outline"}
                      className="text-white"
                    >
                      <Edit2 /> Edit Profile
                    </Button>
                  )}
                  {!isOwnProfile && (
                    <Button
                      disabled={followLoading}
                      onClick={toggleFollow}
                      variant={"outline"}
                    >
                      {user?.followers.some((f) => f.id === userInfo?.id) ? (
                        <>
                          <UserMinus /> Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus /> Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <motion.p
                  className="text-gray-500 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  @{user?.username}
                </motion.p>
              </motion.div>

              <motion.div className="flex gap-8 py-4" variants={itemVariants}>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={stats.posts} />
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">
                    Posts
                  </div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={stats.followers} />
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">
                    Followers
                  </div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={stats.following} />
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">
                    Following
                  </div>
                </motion.div>
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <motion.p
                  className="text-gray-500 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {user?.bio}
                </motion.p>
                <motion.p
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  Joined:{" "}
                  {new Date(user?.created_at as any).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div className="space-y-6" variants={itemVariants}>
          <div className="border-t pt-8">
            <motion.h2
              className="text-xl font-semibold mb-6 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Posts
              <span className="text-sm font-normal text-gray-500">
                ({stats.posts})
              </span>
            </motion.h2>

            {user?.posts && (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.9,
                    },
                  },
                }}
              >
                {user.posts.map((post, index) => (
                  <motion.div
                    onClick={() => navigate(`/post/${post.post_id}`)}
                    key={index}
                    variants={postVariants}
                    whileHover="hover"
                    layout
                  >
                    <Card className="group overflow-hidden border-0 p-0 shadow-sm hover:shadow-md transition-all duration-200">
                      <CardContent className="p-0 relative aspect-square">
                        <motion.img
                          src={`${BASE_URL}/${post.image}`}
                          alt={post.content}
                          className="w-full h-52 object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 group-hover:backdrop-blur-xs transition-colors duration-200 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="text-white text-center p-4"
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                          >
                            <p className="text-sm font-medium line-clamp-2">
                              {post.content}
                            </p>
                            <p className="text-xs mt-1 opacity-75">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </motion.div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!user?.posts?.length && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                  }}
                >
                  <div className="w-12 h-12 border-2 border-gray-300 rounded border-dashed"></div>
                </motion.div>
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-gray-600">
                  {isOwnProfile
                    ? "Share your first post to get started!"
                    : "This user hasn't shared any posts yet."}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
      {/* User Update Modal*/}
      <Dialog open={updateModal} onOpenChange={setUpdateModal}>
        <DialogContent>
          <DialogHeader className="border-b pb-4">
            <DialogTitle>Update your profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-2 gap-2 w-full">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <Label>First Name</Label>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Last Name</Label>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <Label>Username</Label>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <Label>Bio</Label>
                    <FormControl>
                      <Textarea placeholder="bio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={updateLoading}
                className="text-white w-full"
                type="submit"
              >
                {updateLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AnimatedCounter = ({
  value,
  duration = 0.5,
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const increment = end / (duration * 60); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export default Profile;
