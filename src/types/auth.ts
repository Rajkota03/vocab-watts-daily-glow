
import { z } from "zod";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Define a type for manually adding a subscription
export interface ManualSubscriptionValues {
  userId?: string;
  phoneNumber: string;
  isPro?: boolean;
  category?: string;
  deliveryTime?: string;
}
