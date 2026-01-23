import Elysia from "elysia";
import { TaskController } from "../task/http/task.controller";

export const TaskModule = new Elysia({
  detail: {
    tags: ["Tasks"],
  },
}).use(TaskController);
