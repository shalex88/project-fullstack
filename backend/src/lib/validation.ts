import { z } from 'zod';

export const CameraIdSchema = z.object({
  cameraId: z.coerce.number().int().min(0).max(4),
});

export const ZoomSetSchema = z.object({
  zoom: z.number().int().nonnegative(),
});

export const FocusSetSchema = z.object({
  focus: z.number().int().nonnegative(),
});

export const ToggleSchema = z.object({
  enable: z.boolean(),
});

export type CameraId = z.infer<typeof CameraIdSchema>;
export type ZoomSet = z.infer<typeof ZoomSetSchema>;
export type FocusSet = z.infer<typeof FocusSetSchema>;
export type Toggle = z.infer<typeof ToggleSchema>;
