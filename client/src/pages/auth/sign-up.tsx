import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../../schema/form-schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Leaf, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAppStore } from "@/store";
import SeoHead from "@/components/hamlet";

const SignUp = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { signUp, signUpLoading } = useAppStore();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    signUp(values.username.toLowerCase(), values.email, values.password);
  }

  return (
    <>
      <SeoHead
        title="Sign up"
        description="Create your free account to join the community, share posts, comment, and connect with others today!"
      />

      <div className="min-h-screen w-full flex justify-center items-center p-4">
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 10 }}
          className="w-full max-w-xl p-6 shadow-lg rounded-lg"
        >
          <Card>
            <CardHeader>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Leaf className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">
                  Socivo
                </h1>
              </motion.div>

              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white"
              >
                Create an account
              </motion.h2>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          delay: 0.2,
                        }}
                      >
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </motion.div>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                      >
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </motion.div>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          delay: 0.4,
                        }}
                      >
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={isShowPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() =>
                                  setIsShowPassword(!isShowPassword)
                                }
                              >
                                {isShowPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </motion.div>
                    )}
                  />

                  {/* Submit Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                  >
                    <Button
                      disabled={signUpLoading}
                      className="w-full text-white"
                      type="submit"
                    >
                      {signUpLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </motion.div>

                  {/* Link to Login */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="text-center text-sm mt-4 text-gray-600 dark:text-gray-300"
                  >
                    Already have an account?{" "}
                    <Link
                      to="/auth/login"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Log in
                    </Link>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </>
  );
};

export default SignUp;
