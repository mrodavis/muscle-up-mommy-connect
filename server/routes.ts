import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { insertCommentSchema } from "@shared/schema";

/* ======================================================
   ROUTE REGISTRATION
====================================================== */

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  /* =========================
     AUTH
  ========================= */

  setupAuth(app);

  /* =========================
     POSTS
  ========================= */

  // List posts (optionally by group)
  app.get(api.posts.list.path, async (req, res) => {
    const groupId = req.query.groupId
      ? Number(req.query.groupId)
      : undefined;

    if (req.query.groupId && Number.isNaN(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    const posts = await storage.getPosts(groupId);
    res.json(posts);
  });

  // Create post
  app.post(api.posts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const postData = api.posts.create.input
      .omit({ userId: true })
      .parse(req.body);

    const post = await storage.createPost({
      ...postData,
      userId: req.user.id,
    });

    res.status(201).json(post);
  });

  /* =========================
     LIKES
  ========================= */

  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const postId = Number(req.params.id);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    await storage.likePost(postId, req.user.id);
    res.sendStatus(204);
  });

  app.delete("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const postId = Number(req.params.id);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    await storage.unlikePost(postId, req.user.id);
    res.sendStatus(204);
  });

  /* =========================
     COMMENTS
  ========================= */

  // List comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    const postId = Number(req.params.id);

    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const comments = await storage.getCommentsByPost(postId);
    res.json(comments);
  });

  // Create a comment
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const postId = Number(req.params.id);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const commentData = insertCommentSchema
      .omit({ userId: true, postId: true })
      .parse(req.body);

    const comment = await storage.createComment({
      postId,
      userId: req.user.id,
      content: commentData.content,
    });

    res.status(201).json(comment);
  });

  /* =========================
     GROUPS
  ========================= */

  app.get(api.groups.list.path, async (_req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  app.get(api.groups.get.path, async (req, res) => {
    const groupId = Number(req.params.id);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ message: "Invalid group id" });
    }

    const group = await storage.getGroup(groupId);
    if (!group) return res.sendStatus(404);

    res.json(group);
  });

  /* =========================
     EVENTS
  ========================= */

  app.get(api.events.list.path, async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const eventData = api.events.create.input.parse(req.body);

    const event = await storage.createEvent({
      ...eventData,
      hostId: req.user.id,
    });

    res.status(201).json(event);
  });

  /* =========================
     GYMS
  ========================= */

  app.get(api.gyms.list.path, async (_req, res) => {
    const gyms = await storage.getGyms();
    res.json(gyms);
  });

  /* =========================
     PRODUCTS
  ========================= */

  app.get(api.products.list.path, async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  /* =========================
     FITNESS PROGRAMS
  ========================= */

  app.get(api.fitness.programs.path, async (_req, res) => {
    const programs = await storage.getPrograms();
    res.json(programs);
  });

  return httpServer;
}
