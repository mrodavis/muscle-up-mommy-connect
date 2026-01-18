import { z } from "zod";
import {
  insertUserSchema,
  insertGroupSchema,
  insertPostSchema,
  insertCommentSchema,
  insertEventSchema,
  insertGymSchema,
  insertProductSchema,
  insertProgramSchema,
  users,
  groups,
  posts,
  comments,
  events,
  gyms,
  products,
  fitnessPrograms,
} from "./schema";

/* =========================
   ERROR SCHEMAS
========================= */

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

/* =========================
   API CONTRACT
========================= */

export const api = {
  /* ---------- AUTH ---------- */
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  /* ---------- POSTS ---------- */
  posts: {
    list: {
      method: "GET" as const,
      path: "/api/posts",
      input: z
        .object({
          groupId: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(
          z.custom<
            typeof posts.$inferSelect & {
              author: typeof users.$inferSelect;
              comments: typeof comments.$inferSelect[];
              likes: { userId: number }[];
            }
          >(),
        ),
      },
    },

    create: {
      method: "POST" as const,
      path: "/api/posts",
      input: insertPostSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof posts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  /* ---------- COMMENTS ---------- */
  comments: {
    listByPost: {
      method: "GET" as const,
      path: "/api/posts/:id/comments",
      responses: {
        200: z.array(
          z.object({
            id: z.number(),
            content: z.string(),
            createdAt: z.date(),
            author: z.object({
              id: z.number(),
              username: z.string(),
              displayName: z.string(),
              photoUrl: z.string().nullable(),
            }),
          }),
        ),
      },
    },

    create: {
      method: "POST" as const,
      path: "/api/posts/:id/comments",
      input: insertCommentSchema.omit({
        userId: true,
        postId: true,
      }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },

  /* ---------- GROUPS ---------- */
  groups: {
    list: {
      method: "GET" as const,
      path: "/api/groups",
      responses: {
        200: z.array(z.custom<typeof groups.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/groups/:id",
      responses: {
        200: z.custom<typeof groups.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  /* ---------- EVENTS ---------- */
  events: {
    list: {
      method: "GET" as const,
      path: "/api/events",
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/events",
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  /* ---------- GYMS ---------- */
  gyms: {
    list: {
      method: "GET" as const,
      path: "/api/gyms",
      responses: {
        200: z.array(z.custom<typeof gyms.$inferSelect>()),
      },
    },
  },

  /* ---------- PRODUCTS ---------- */
  products: {
    list: {
      method: "GET" as const,
      path: "/api/products",
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
  },

  /* ---------- FITNESS ---------- */
  fitness: {
    programs: {
      method: "GET" as const,
      path: "/api/fitness/programs",
      responses: {
        200: z.array(z.custom<typeof fitnessPrograms.$inferSelect>()),
      },
    },
  },
};

/* =========================
   HELPER
========================= */

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
