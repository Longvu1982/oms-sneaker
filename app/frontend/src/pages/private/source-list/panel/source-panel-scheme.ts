import { z } from "zod";

export const schema = z.object({
  name: z.string().nonempty("Tên kho không được để trống."),
});
