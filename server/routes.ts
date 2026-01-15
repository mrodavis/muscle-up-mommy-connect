import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // API Routes
  
  // Posts
  app.get(api.posts.list.path, async (req, res) => {
    const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
    const posts = await storage.getPosts(groupId);
    res.json(posts);
  });

  app.post(api.posts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postData = api.posts.create.input.parse(req.body);
    const post = await storage.createPost({
      ...postData,
      userId: req.user.id,
    });
    res.status(201).json(post);
  });

  // Groups
  app.get(api.groups.list.path, async (req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  app.get(api.groups.get.path, async (req, res) => {
    const group = await storage.getGroup(Number(req.params.id));
    if (!group) return res.sendStatus(404);
    res.json(group);
  });

  // Events
  app.get(api.events.list.path, async (req, res) => {
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

  // Gyms
  app.get(api.gyms.list.path, async (req, res) => {
    const gyms = await storage.getGyms();
    res.json(gyms);
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Fitness Programs
  app.get(api.fitness.programs.path, async (req, res) => {
    const programs = await storage.getPrograms();
    res.json(programs);
  });

  return httpServer;
}
