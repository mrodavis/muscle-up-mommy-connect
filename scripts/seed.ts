import "dotenv/config";
import { db } from "../server/db";
import {
  users,
  groups,
  posts,
  events,
  gyms,
} from "../shared/schema";
import { randomBytes, scryptSync } from "crypto";

// =======================
// Password helper (Passport-compatible)
// =======================
function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${hash}.${salt}`;
}

async function seed() {
  console.log("🌱 Seeding full demo data...");

  // -----------------------
  // CLEAN SLATE (DEV ONLY)
  // -----------------------
  await db.delete(posts);
  await db.delete(events);
  await db.delete(groups);
  await db.delete(gyms);
  await db.delete(users);

  // -----------------------
  // USERS
  // -----------------------
  const [admin, mommy] = await db
    .insert(users)
    .values([
      {
        username: "admin",
        password: hashPassword("password123"),
        displayName: "Admin Coach",
        role: "admin",
        tier: "vip",
      },
      {
        username: "mommy1",
        password: hashPassword("password123"),
        displayName: "Sarah Jenkins",
        role: "user",
        tier: "premium",
      },
    ])
    .returning();

  // -----------------------
  // GROUPS
  // -----------------------
  const [postpartumGroup, vipGroup] = await db
    .insert(groups)
    .values([
      {
        name: "Postpartum Power",
        description:
          "A safe space for moms rebuilding strength after birth.",
        isPrivate: false,
        tierRequired: "free",
      },
      {
        name: "VIP Coaching Circle",
        description:
          "Exclusive access to coaching, accountability, and live check-ins.",
        isPrivate: true,
        tierRequired: "vip",
      },
    ])
    .returning();

  // -----------------------
  // POSTS
  // -----------------------
  await db.insert(posts).values([
    {
      userId: admin.id,
      groupId: postpartumGroup.id,
      content:
        "Welcome to Postpartum Power 💪 What’s one goal you’re working on this week?",
      likesCount: 5,
    },
    {
      userId: mommy.id,
      groupId: postpartumGroup.id,
      content:
        "Just finished my first workout post-baby and I feel AMAZING 😭🔥",
      likesCount: 12,
    },
  ]);

  // -----------------------
  // EVENTS
  // -----------------------
  await db.insert(events).values([
    {
      title: "Morning Stroller Walk",
      description:
        "Casual community walk — strollers welcome!",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      location: "Central Park, NY",
      hostId: admin.id,
      tierRequired: "free",
    },
    {
      title: "VIP Nutrition Masterclass",
      description:
        "Fuel your recovery and performance with expert guidance.",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      location: "Zoom (Live)",
      hostId: admin.id,
      tierRequired: "vip",
    },
  ]);

  // -----------------------
  // GYMS
  // -----------------------
  await db.insert(gyms).values([
    {
      name: "Muscle Up Mommy HQ",
      address: "123 Fitness Blvd",
      city: "New York",
      state: "NY",
      lat: "40.7128",
      lng: "-74.0060",
      isPartner: true,
    },
    {
      name: "Austin Strength Lab",
      address: "456 Power Dr",
      city: "Austin",
      state: "TX",
      lat: "30.2672",
      lng: "-97.7431",
      isPartner: false,
    },
  ]);

  console.log("✅ Full demo seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
