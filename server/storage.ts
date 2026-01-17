import {
  users,
  groups,
  posts,
  comments,
  postLikes,
  events,
  gyms,
  products,
  fitnessPrograms,
  enrollments,
  type User,
  type InsertUser,
  type Group,
  type InsertGroup,
  type Post,
  type InsertPost,
  type Event,
  type InsertEvent,
  type Gym,
  type InsertGym,
  type Product,
  type FitnessProgram,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

/* =========================
   TYPES
========================= */

export type PostWithRelations = Post & {
  author: Pick<User, "id" | "username" | "displayName" | "photoUrl">;
  comments: { id: number }[];
  likes: { userId: number }[];
};

/* =========================
   STORAGE INTERFACE
========================= */

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Posts
  getPosts(groupId?: number): Promise<PostWithRelations[]>;
  createPost(post: InsertPost): Promise<Post>;

  // Likes
  likePost(postId: number, userId: number): Promise<void>;
  unlikePost(postId: number, userId: number): Promise<void>;

  // Groups
  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Gyms
  getGyms(): Promise<Gym[]>;
  createGym(gym: InsertGym): Promise<Gym>;

  // Products
  getProducts(): Promise<Product[]>;

  // Fitness
  getPrograms(): Promise<FitnessProgram[]>;

  sessionStore: session.Store;
}

/* =========================
   DATABASE STORAGE
========================= */

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  /* ---------- USERS ---------- */

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  /* ---------- POSTS ---------- */

  async getPosts(groupId?: number): Promise<PostWithRelations[]> {
    return db.query.posts.findMany({
      where: groupId ? eq(posts.groupId, groupId) : undefined,
      orderBy: desc(posts.createdAt),
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true,
          },
        },
        comments: {
          columns: {
            id: true,
          },
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
    });
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  /* ---------- LIKES ---------- */

  async likePost(postId: number, userId: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Insert like (composite PK prevents duplicates)
      const inserted = await tx
        .insert(postLikes)
        .values({ postId, userId })
        .onConflictDoNothing()
        .returning();

      // Only increment if a row was actually inserted
      if (inserted.length > 0) {
        await tx
          .update(posts)
          .set({ likesCount: sql`${posts.likesCount} + 1` })
          .where(eq(posts.id, postId));
      }
    });
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    await db.transaction(async (tx) => {
      const deleted = await tx
        .delete(postLikes)
        .where(
          and(
            eq(postLikes.postId, postId),
            eq(postLikes.userId, userId),
          ),
        )
        .returning();

      // Only decrement if a row was actually deleted
      if (deleted.length > 0) {
        await tx
          .update(posts)
          .set({
            likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)`,
          })
          .where(eq(posts.id, postId));
      }
    });
  }

  /* ---------- GROUPS ---------- */

  async getGroups(): Promise<Group[]> {
    return db.select().from(groups);
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id));
    return group;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  /* ---------- EVENTS ---------- */

  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(events.date);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  /* ---------- GYMS ---------- */

  async getGyms(): Promise<Gym[]> {
    return db.select().from(gyms);
  }

  async createGym(gym: InsertGym): Promise<Gym> {
    const [newGym] = await db.insert(gyms).values(gym).returning();
    return newGym;
  }

  /* ---------- PRODUCTS ---------- */

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  /* ---------- FITNESS ---------- */

  async getPrograms(): Promise<FitnessProgram[]> {
    return db.select().from(fitnessPrograms);
  }
}

export const storage = new DatabaseStorage();
