import {
  pgTable,
  pgEnum,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createId } from "@/lib/id";

/* ------------------------------------------------------------------ *
 *  Enums (BRD-derived domain vocabularies)
 * ------------------------------------------------------------------ */
export const userRole = pgEnum("user_role", ["coach", "client", "admin"]);
export const coachStatus = pgEnum("coach_status", [
  "pending_review",
  "active",
  "paused",
  "suspended",
]);
export const profileVisibility = pgEnum("profile_visibility", [
  "public",
  "unlisted",
  "paused",
]);
export const verificationStatus = pgEnum("verification_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);
export const experienceLevel = pgEnum("experience_level", [
  "beginner_friendly",
  "intermediate",
  "advanced",
  "elite",
]);
export const slotStatus = pgEnum("slot_status", [
  "open",
  "booked",
  "completed",
  "cancelled",
]);
export const recurringKind = pgEnum("recurring_kind", [
  "one_off",
  "weekly",
  "biweekly",
]);
export const bookingStatus = pgEnum("booking_status", [
  "pending_payment",
  "confirmed",
  "completed",
  "cancelled_by_client",
  "cancelled_by_coach",
  "refunded",
]);
export const mediaType = pgEnum("media_type", ["video", "document", "image"]);
export const mediaStatus = pgEnum("media_status", [
  "pending",
  "approved",
  "rejected",
]);
export const notificationChannel = pgEnum("notification_channel", [
  "email",
  "push",
  "in_app",
]);

/* ------------------------------------------------------------------ *
 *  Auth tables (Auth.js / NextAuth Drizzle adapter shape)
 * ------------------------------------------------------------------ */
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    role: userRole("role").notNull().default("client"),
    passwordHash: text("password_hash"),
    // Shared profile fields (BRD §10.1 User base entity)
    locationCity: varchar("location_city", { length: 120 }),
    locationPostcode: varchar("location_postcode", { length: 16 }),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    mfaEnabled: boolean("mfa_enabled").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_uniq").on(t.email)],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ------------------------------------------------------------------ *
 *  Sports taxonomy (BRD §7.3 — admin-editable, no deploy)
 * ------------------------------------------------------------------ */
export const sports = pgTable(
  "sports",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    icon: varchar("icon", { length: 80 }),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sports_slug_uniq").on(t.slug)],
);

/* ------------------------------------------------------------------ *
 *  Coach & Client profiles (extend User — BRD §10.1)
 * ------------------------------------------------------------------ */
export const coachProfiles = pgTable(
  "coach_profiles",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 160 }),
    bio: text("bio"),
    philosophy: text("philosophy"),
    achievements: text("achievements"),
    experienceYears: integer("experience_years").notNull().default(0),
    experienceLevel: experienceLevel("experience_level")
      .notNull()
      .default("intermediate"),
    defaultRateMinor: integer("default_rate_minor"),
    currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
    status: coachStatus("status").notNull().default("pending_review"),
    visibility: profileVisibility("visibility").notNull().default("public"),
    verificationStatus: verificationStatus("verification_status")
      .notNull()
      .default("unverified"),
    completeness: integer("completeness").notNull().default(0),
    freeIntroUsedMonth: integer("free_intro_used_month").notNull().default(0),
    ratingAvg: doublePrecision("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    cancellationStrikes: integer("cancellation_strikes").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("coach_profiles_user_uniq").on(t.userId),
    index("coach_profiles_status_idx").on(t.status, t.visibility),
  ],
);

export const clientProfiles = pgTable(
  "client_profiles",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dob: timestamp("dob", { mode: "date" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("client_profiles_user_uniq").on(t.userId)],
);

/** Many-to-many: coaches ↔ sports they coach */
export const coachSports = pgTable(
  "coach_sports",
  {
    coachId: text("coach_id")
      .notNull()
      .references(() => coachProfiles.id, { onDelete: "cascade" }),
    sportId: text("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.coachId, t.sportId] })],
);

/** Many-to-many: clients ↔ preferred sports */
export const clientPreferredSports = pgTable(
  "client_preferred_sports",
  {
    clientId: text("client_id")
      .notNull()
      .references(() => clientProfiles.id, { onDelete: "cascade" }),
    sportId: text("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.clientId, t.sportId] })],
);

/* ------------------------------------------------------------------ *
 *  Venues (BRD §10.1)
 * ------------------------------------------------------------------ */
export const venues = pgTable("venues", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 120 }),
  postcode: varchar("postcode", { length: 16 }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ------------------------------------------------------------------ *
 *  Media (videos / documents / images — BRD §10.1)
 * ------------------------------------------------------------------ */
export const media = pgTable(
  "media",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: mediaType("type").notNull(),
    provider: varchar("provider", { length: 40 }).notNull().default("cloudinary"),
    url: text("url").notNull(),
    publicId: text("public_id"),
    title: varchar("title", { length: 200 }),
    status: mediaStatus("status").notNull().default("pending"),
    sizeBytes: integer("size_bytes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("media_owner_idx").on(t.ownerId, t.type)],
);

/* ------------------------------------------------------------------ *
 *  Coaching slots (BRD §5.3)
 * ------------------------------------------------------------------ */
export const slots = pgTable(
  "slots",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    coachId: text("coach_id")
      .notNull()
      .references(() => coachProfiles.id, { onDelete: "cascade" }),
    venueId: text("venue_id").references(() => venues.id, {
      onDelete: "set null",
    }),
    sportId: text("sport_id").references(() => sports.id, {
      onDelete: "set null",
    }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull(),
    sessionType: varchar("session_type", { length: 80 }).notNull(),
    maxParticipants: integer("max_participants").notNull().default(1),
    feeMinor: integer("fee_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
    description: text("description"),
    status: slotStatus("status").notNull().default("open"),
    recurring: recurringKind("recurring").notNull().default("one_off"),
    recurringGroupId: text("recurring_group_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("slots_coach_idx").on(t.coachId, t.startAt),
    index("slots_discovery_idx").on(t.status, t.startAt),
  ],
);

/* ------------------------------------------------------------------ *
 *  Bookings (BRD §6.4)
 * ------------------------------------------------------------------ */
export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    slotId: text("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "restrict" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clientProfiles.id, { onDelete: "restrict" }),
    coachId: text("coach_id")
      .notNull()
      .references(() => coachProfiles.id, { onDelete: "restrict" }),
    status: bookingStatus("status").notNull().default("pending_payment"),
    coachFeeMinor: integer("coach_fee_minor").notNull(),
    serviceFeeMinor: integer("service_fee_minor").notNull(),
    totalMinor: integer("total_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("GBP"),
    paymentRef: text("payment_ref"),
    paymentIntentId: text("payment_intent_id"),
    clientMessage: text("client_message"),
    refundMinor: integer("refund_minor").notNull().default(0),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("bookings_client_idx").on(t.clientId, t.status),
    index("bookings_coach_idx").on(t.coachId, t.status),
    uniqueIndex("bookings_slot_active_uniq")
      .on(t.slotId)
      .where(sql`status in ('pending_payment','confirmed','completed')`),
  ],
);

/* ------------------------------------------------------------------ *
 *  Reviews (BRD §6.5)
 * ------------------------------------------------------------------ */
export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clientProfiles.id, { onDelete: "cascade" }),
    coachId: text("coach_id")
      .notNull()
      .references(() => coachProfiles.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    tags: jsonb("tags").$type<string[]>().default([]),
    coachResponse: text("coach_response"),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("reviews_booking_uniq").on(t.bookingId),
    index("reviews_coach_idx").on(t.coachId),
  ],
);

/* ------------------------------------------------------------------ *
 *  Messaging (BRD §7.2)
 * ------------------------------------------------------------------ */
export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    coachUserId: text("coach_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientUserId: text("client_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("conversations_pair_uniq").on(t.coachUserId, t.clientUserId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    flagged: boolean("flagged").notNull().default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.createdAt)],
);

/* ------------------------------------------------------------------ *
 *  Notifications (BRD §7.1)
 * ------------------------------------------------------------------ */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 60 }).notNull(),
    channel: notificationChannel("channel").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.readAt)],
);

/* ------------------------------------------------------------------ *
 *  Relations
 * ------------------------------------------------------------------ */
export const usersRelations = relations(users, ({ one, many }) => ({
  coachProfile: one(coachProfiles, {
    fields: [users.id],
    references: [coachProfiles.userId],
  }),
  clientProfile: one(clientProfiles, {
    fields: [users.id],
    references: [clientProfiles.userId],
  }),
  media: many(media),
  notifications: many(notifications),
}));

export const coachProfilesRelations = relations(
  coachProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [coachProfiles.userId],
      references: [users.id],
    }),
    sports: many(coachSports),
    venues: many(venues),
    slots: many(slots),
    bookings: many(bookings),
    reviews: many(reviews),
  }),
);

export const clientProfilesRelations = relations(
  clientProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [clientProfiles.userId],
      references: [users.id],
    }),
    preferredSports: many(clientPreferredSports),
    bookings: many(bookings),
  }),
);

export const slotsRelations = relations(slots, ({ one, many }) => ({
  coach: one(coachProfiles, {
    fields: [slots.coachId],
    references: [coachProfiles.id],
  }),
  venue: one(venues, { fields: [slots.venueId], references: [venues.id] }),
  sport: one(sports, { fields: [slots.sportId], references: [sports.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  slot: one(slots, { fields: [bookings.slotId], references: [slots.id] }),
  client: one(clientProfiles, {
    fields: [bookings.clientId],
    references: [clientProfiles.id],
  }),
  coach: one(coachProfiles, {
    fields: [bookings.coachId],
    references: [coachProfiles.id],
  }),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
}));

export const coachSportsRelations = relations(coachSports, ({ one }) => ({
  coach: one(coachProfiles, {
    fields: [coachSports.coachId],
    references: [coachProfiles.id],
  }),
  sport: one(sports, { fields: [coachSports.sportId], references: [sports.id] }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ many }) => ({ messages: many(messages) }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));
