import { DateTimeSchema } from "types/modules/common";
import z from "zod";

export const UserSchema = z.object({
  id: z.uuidv4("Invalid user ID.").meta({
    description: "Unique uuidv4 id of the user.",
  }),
  email: z.email("Please provide a valid email.").nonempty("Email is required.").meta({
    description: "Email of the user",
  }),
  password: z.string().min(6, "Password must be at least 6 characters long.").nonempty("Password is required.").meta({
    description: "Password of the user. Use a strong one.",
  }),
  name: z.string().min(3, "Name must be at least 3 characters long.").nonempty("Name is required.").meta({
    description: "Full name of the user",
  }),
  createdAt: DateTimeSchema.meta({
    description: "Date and time when the user was created.",
  }),
  updatedAt: DateTimeSchema.meta({
    description: "Date and time when the user was last updated.",
  }),
});
