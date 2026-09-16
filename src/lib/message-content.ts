import { z } from "zod";
import { sanitizeString } from "./sanitize";

// Validate the text that will actually be saved, as well as the input size.
export const messageContentSchema = z.string().max(2000)
    .transform(sanitizeString).pipe(z.string().min(1).max(2000));
