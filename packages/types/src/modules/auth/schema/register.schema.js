import z from "zod";
export const RegisterSchema = z.object({
  email: z.email("Please provide a valid email.").nonempty("Email is required.").meta({
    description: "Email of the user",
  }),
  password: z.string().min(6, "Password must be at least 6 characters long.").nonempty("Password is required.").meta({
    description: "Password of the user. Use a strong one.",
  }),
  name: z.string().min(3, "Name must be at least 3 characters long.").nonempty("Name is required.").meta({
    description: "Full name of the user",
  }),
});
