import { z } from "zod";

export const groupSchema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty(),
});
