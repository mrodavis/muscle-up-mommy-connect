import { storage } from "./storage";
import { hashPassword } from "./auth"; // I need to export this or re-implement
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
    stage: "postpartum"
  });

  const user1 = await storage.createUser({
    username: "sarah_mom",
    password,
    displayName: "Sarah Jenkins",
    role: "user",
    tier: "premium",
    location: "Austin, TX",
    bio: "Mom of 2, loving the fitness journey!",
    interests: ["running", "yoga"],
    stage: "toddler"
  });

  // Create Groups
  const group1 = await storage.createGroup({ // Need to add createGroup to storage interface
    name: "Postpartum Power",
    description: "A safe space for moms recovering and rebuilding strength after birth.",
    isPrivate: false,
    tierRequired: "free"
  });

  const group2 = await storage.createGroup({
    name: "VIP Coaching Circle",
    description: "Exclusive coaching with weekly check-ins.",
    isPrivate: true,
    tierRequired: "vip"
  });

  // Create Events
  await storage.createEvent({
    title: "Morning Stroller Run",
    description: "Join us for a 5k run with the strollers!",
    date: new Date(Date.now() + 86400000 * 2), // 2 days from now
    location: "Central Park, NY",
    hostId: admin.id,
    tierRequired: "free"
  });

  await storage.createEvent({
    title: "Nutrition Masterclass",
    description: "Learn how to fuel your body for recovery.",
    date: new Date(Date.now() + 86400000 * 5),
    location: "Online Zoom",
    hostId: admin.id,
    tierRequired: "premium"
  });

  // Create Gyms (Need createGym in storage or just direct DB insert, but strict storage is better)
  // I'll update storage.ts to include these methods first, then run seed.
  
  console.log("Seeding complete!");
}

// I need to update storage.ts first to support createGroup, createGym etc. 
// For now I will just log that I am skipping advanced seeding until storage is updated.
// Actually, I'll update storage.ts in the next turn.
