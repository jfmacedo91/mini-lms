import { Transform } from "node:stream";
import { RouteError } from "../../core/utils/route-error.ts";

export const mimeType: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".zip": "application/zip"
};

export function checkETag(match: string | undefined, etag: string) {
  if(!match) return false;
  const tags = match.split(",").map(tag => tag.trim());
  return tags.includes(etag);
};

export function limitBytes(max: number) {
  let size = 0;
  return new Transform({
    transform(chunk, _encode, next) {
      size += chunk.length;
      if(size > max) {
        return next(new RouteError(413, "Corpo muito grande!"));
      };
      next(null, chunk);
    }
  });
};