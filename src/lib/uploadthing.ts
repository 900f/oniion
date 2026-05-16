import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";

const f = createUploadthing();

const auth = async () => {
  const session = await getSession();
  if (!session) throw new UploadThingError("Unauthorized");
  return { userId: session.userId };
};

export const ourFileRouter = {
  fontUploader: f({ blob: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(auth)
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId, url: file.ufsUrl, name: file.name,
    })),

  imageUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    "image/gif": { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(auth)
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId, url: file.ufsUrl, name: file.name,
    })),

  audioUploader: f({
    audio: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(auth)
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId, url: file.ufsUrl, name: file.name,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
