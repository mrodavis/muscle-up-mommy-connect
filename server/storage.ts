import { 
  users, groups, posts, comments, events, gyms, products, fitnessPrograms, enrollments,
  type User, type InsertUser, type Group, type InsertGroup, type Post, type InsertPost, 
  type Event, type InsertEvent, type Gym, type InsertGym, type Product, type FitnessProgram
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Posts
  getPosts(groupId?: number): Promise<(Post & { author: User; comments: any[] })[]>;
  createPost(post: InsertPost): Promise<Post>;

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPosts(groupId?: number): Promise<(Post & { author: User; comments: any[] })[]> {
    const query = db.query.posts.findMany({
      where: groupId ? eq(posts.groupId, groupId) : undefined,
      with: {
        author: true,
        comments: {
          with: { author: true }
        }
      },
      orderBy: [desc(posts.createdAt)]
    });
    return await query;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups);
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.date);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getGyms(): Promise<Gym[]> {
    return await db.select().from(gyms);
  }

  async createGym(gym: InsertGym): Promise<Gym> {
    const [newGym] = await db.insert(gyms).values(gym).returning();
    return newGym;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getPrograms(): Promise<FitnessProgram[]> {
    return await db.select().from(fitnessPrograms);
  }
}

export const storage = new DatabaseStorage();
