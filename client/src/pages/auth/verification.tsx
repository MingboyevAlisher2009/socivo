"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { verificationSchema } from "../../schema/form-schemas";
import { useAppStore } from "@/store";

export default function Verification() {
  const { verification, verificationLoading } = useAppStore();

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = (data: z.infer<typeof verificationSchema>) => {
    console.log("Submitted OTP:", data.code);
    verification(sessionStorage.getItem("email") || "", data.code);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="w-full max-w-lg shadow-lg rounded-lg p-6"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-10 w-10 text-primary mb-2" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Verify Your Account
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                Enter the 6‑digit code sent to your email
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {" "}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 w-full flex justify-center items-center flex-col"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={(val: string) => {
                            if (/^\d*$/.test(val)) field.onChange(val);
                          }}
                        >
                          <InputOTPGroup>
                            {[0, 1, 2].map((i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            {[3, 4, 5].map((i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={verificationLoading}
                  className="w-full"
                  type="submit"
                >
                  {verificationLoading ? (
                    <Loader2 className="animate-spin text-white w-5 h-5" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
