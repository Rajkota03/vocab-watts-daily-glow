
import { z } from "zod";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
