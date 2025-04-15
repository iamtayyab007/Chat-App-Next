import { z } from "zod";

export const signupSchema = z
  .object({
    username: z.string().min(5, "Username must be at least 5 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least characters"),
  })
  .refine(
    (data) => (
      data.password !== data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    )
  );
