import { z } from "zod";

export const schema = z.object({
  name: z.string().nonempty("Tên kho không được để trống."),
  address: z.string().optional(),
  phone: z.string().optional(),
  id: z.string().optional(),
});
