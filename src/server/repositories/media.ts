import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

export async function getCoachDocuments(userId: string) {
  return db
    .select({
      id: schema.media.id,
      title: schema.media.title,
      url: schema.media.url,
      status: schema.media.status,
      sizeBytes: schema.media.sizeBytes,
      createdAt: schema.media.createdAt,
    })
    .from(schema.media)
    .where(and(eq(schema.media.ownerId, userId), eq(schema.media.type, "document")))
    .orderBy(desc(schema.media.createdAt));
}
