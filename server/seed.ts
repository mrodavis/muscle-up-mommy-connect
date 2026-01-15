import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  // Check if users exist
  const existingUser = await storage.getUserByUsername("mommy1");
  if (existingUser) {
    console.log("Database already seeded.");
    return;
  }

  // Create Users
  const password = await hash("password123");
  
  const admin = await storage.createUser({
    username: "admin",
    password,
    displayName: "Admin Coach",
    role: "admin",
    tier: "vip",
    location: "New York, NY",
    bio: "Head Coach at Muscle Up Mommy",
    interests: ["fitness", "nutrition", "postpartum"],
    stage: "postpartum",
    photoUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400"
  });

  const user1 = await storage.createUser({
    username: "mommy1",
    password,
    displayName: "Sarah Jenkins",
    role: "user",
    tier: "premium",
    location: "Austin, TX",
    bio: "Mom of 2, loving the fitness journey!",
    interests: ["running", "yoga"],
    stage: "toddler",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
  });

  // Create Groups
  const group1 = await storage.createGroup({
    name: "Postpartum Power",
    description: "A safe space for moms recovering and rebuilding strength after birth.",
    isPrivate: false,
    tierRequired: "free",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"
  });

  const group2 = await storage.createGroup({
    name: "VIP Coaching Circle",
    description: "Exclusive coaching with weekly check-ins.",
    isPrivate: true,
    tierRequired: "vip",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800"
  });

  // Create Posts
  await storage.createPost({
    userId: admin.id,
    groupId: group1.id,
    content: "Welcome to the group! What's your biggest challenge this week?",
    likesCount: 5
  });

  await storage.createPost({
    userId: user1.id,
    groupId: group1.id,
    content: "Just finished my first 5k post-baby! Feeling amazing.",
    likesCount: 12
  });

  // Create Events
  await storage.createEvent({
    title: "Morning Stroller Run",
    description: "Join us for a 5k run with the strollers!",
    date: new Date(Date.now() + 86400000 * 2), // 2 days from now
    location: "Central Park, NY",
    hostId: admin.id,
    tierRequired: "free",
    imageUrl: "https://images.unsplash.com/photo-1533230676263-633099955e6c?w=800"
  });

  await storage.createEvent({
    title: "Nutrition Masterclass",
    description: "Learn how to fuel your body for recovery.",
    date: new Date(Date.now() + 86400000 * 5),
    location: "Online Zoom",
    hostId: admin.id,
    tierRequired: "premium",
    imageUrl: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800"
  });

  // Create Gyms
  await storage.createGym({
    name: "Muscle Up Mommy HQ",
    address: "123 Fitness Blvd",
    city: "New York",
    state: "NY",
    lat: "40.7128",
    lng: "-74.0060",
    isPartner: true
  });

  await storage.createGym({
    name: "Gold's Gym Austin",
    address: "456 Workout Ln",
    city: "Austin",
    state: "TX",
    lat: "30.2672",
    lng: "-97.7431",
    isPartner: false
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
