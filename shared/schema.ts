import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["user", "coach", "admin"] }).default("user").notNull(),
  tier: text("tier", { enum: ["free", "premium", "vip"] }).default("free").notNull(),
  location: text("location"),
  stage: text("stage"), // pregnant, postpartum, etc.
  interests: text("interests").array(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  isPrivate: boolean("is_private").default(false),
  tierRequired: text("tier_required", { enum: ["free", "premium", "vip"] }).default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id"), // Nullable for public/feed posts
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  hostId: integer("host_id").notNull(),
  tierRequired: text("tier_required").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  status: text("status", { enum: ["going", "interested", "not_going"] }).notNull(),
});

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

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  shopifyId: text("shopify_id"), // For future integration
});

export const fitnessPrograms = pgTable("fitness_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coachId: integer("coach_id").notNull(),
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  durationWeeks: integer("duration_weeks"),
  thumbnailUrl: text("thumbnail_url"),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  programId: integer("program_id").notNull(),
  status: text("status", { enum: ["active", "completed"] }).default("active"),
  progress: integer("progress").default(0), // percentage
  joinedAt: timestamp("joined_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  groupMemberships: many(groupMembers),
  rsvps: many(eventRsvps),
  enrollments: many(enrollments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),
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

export const groupRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  posts: many(posts),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  host: one(users, {
    fields: [events.hostId],
    references: [users.id],
  }),
  rsvps: many(eventRsvps),
}));

// === INFER TYPES ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, likesCount: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true });
export const insertGymSchema = createInsertSchema(gyms).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProgramSchema = createInsertSchema(fitnessPrograms).omit({ id: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, joinedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Group = typeof groups.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Gym = typeof gyms.$inferSelect;
export type Product = typeof products.$inferSelect;
export type FitnessProgram = typeof fitnessPrograms.$inferSelect;
