import { z } from "zod";

export const RegisterSchema = z.object({
  employeeId: z.string().min(3),
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
});
