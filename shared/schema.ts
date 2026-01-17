import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["user", "coach", "admin"] })
    .default("user")
    .notNull(),
  tier: text("tier", { enum: ["free", "premium", "vip"] })
    .default("free")
    .notNull(),
  location: text("location"),
  stage: text("stage"),
  interests: text("interests").array(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   GROUPS
========================= */

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  isPrivate: boolean("is_private").default(false),
  tierRequired: text("tier_required", {
    enum: ["free", "premium", "vip"],
  }).default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
});


/* =========================
   POSTS
========================= */

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   POST LIKES (REAL LIKES)
========================= */

export const postLikes = pgTable(
  "post_likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.postId, t.userId],
    }),
  }),
);

/* =========================
   COMMENTS
========================= */

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),

  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



/* =========================
   EVENTS
========================= */

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  hostId: integer("host_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tierRequired: text("tier_required", {
    enum: ["free", "premium", "vip"],
  }).default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["going", "interested", "not_going"],
  }).notNull(),
});

/* =========================
   GYMS
========================= */

export const gyms = pgTable("gyms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  lat: decimal("lat").notNull(),
  lng: decimal("lng").notNull(),
  isPartner: boolean("is_partner").default(false),
  website: text("website"),
});

/* =========================
   PRODUCTS (SHOP)
========================= */

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  shopifyId: text("shopify_id"),
});

/* =========================
   FITNESS PROGRAMS
========================= */

export const fitnessPrograms = pgTable("fitness_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coachId: integer("coach_id")
    .notNull()
    .references(() => users.id),
  difficulty: text("difficulty"),
  durationWeeks: integer("duration_weeks"),
  thumbnailUrl: text("thumbnail_url"),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  programId: integer("program_id")
    .notNull()
    .references(() => fitnessPrograms.id),
  status: text("status", { enum: ["active", "completed"] }).default("active"),
  progress: integer("progress").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

/* =========================
   RELATIONS
========================= */

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(postLikes),
  memberships: many(groupMembers),
  rsvps: many(eventRsvps),
  enrollments: many(enrollments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),

  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),

  comments: many(comments),
  likes: many(postLikes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),

  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),

  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const groupRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  posts: many(posts),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),

  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  host: one(users, {
    fields: [events.hostId],
    references: [users.id],
  }),

  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),

  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
}));

export const fitnessProgramsRelations = relations(
  fitnessPrograms,
  ({ one, many }) => ({
    coach: one(users, {
      fields: [fitnessPrograms.coachId],
      references: [users.id],
    }),
    enrollments: many(enrollments),
  }),
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  program: one(fitnessPrograms, {
    fields: [enrollments.programId],
    references: [fitnessPrograms.id],
  }),
}));


/* =========================
   INSERT SCHEMAS
========================= */

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  createdAt: true,
});
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});
export const insertGymSchema = createInsertSchema(gyms).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProgramSchema = createInsertSchema(fitnessPrograms).omit({ id: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  joinedAt: true,
});

/* =========================
   TYPES
========================= */

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Gym = typeof gyms.$inferSelect;
export type Product = typeof products.$inferSelect;
export type FitnessProgram = typeof fitnessPrograms.$inferSelect;
