import { Redis } from "@upstash/redis";
import Elysia from "elysia";
import z from "zod";

const redis = Redis.fromEnv();

const TaskSchema = z.object({
  id: z.uuidv4(),
  title: z.string(),
  description: z.string(),
});

const CreateTaskSchema = TaskSchema.omit({ id: true });

export const TaskController = new Elysia({
  prefix: "/tasks",
})
  .post(
    "/",
    ({ body, status }) => {
      const id = crypto.randomUUID();
      redis.set(id, JSON.stringify(body));
      return status(201, {
        id,
        ...body,
      });
    },
    {
      body: CreateTaskSchema,
      response: {
        201: TaskSchema,
      },
    },
  )
  .get("/", async ({ status }) => {
    const [cursor, keys] = await redis.scan(0, { match: "*", count: 10 });
    const tasks = keys.length > 0 ? await redis.mget<z.infer<typeof TaskSchema>[]>(...keys) : [];
    return status(200, {
      tasks: tasks.map((task, index) => ({
        ...task,
        id: keys[index],
      })),
      cursor,
    });
  })
  .put(
    ":id",
    async ({ status, params: { id }, body }) => {
      const existingTask = await redis.get<z.infer<typeof CreateTaskSchema>>(id);

      if (!existingTask) {
        return status(404, { error: "Task not found" });
      }

      const updatedTask = {
        ...existingTask,
        ...body,
      };

      await redis.set(id, JSON.stringify(updatedTask));

      return status(200, {
        id,
        ...updatedTask,
      });
    },
    {
      params: z.object({
        id: z.uuidv4(),
      }),
      body: CreateTaskSchema.partial(),
      response: {
        200: TaskSchema,
        404: z.object({
          error: z.string(),
        }),
      },
    },
  );
