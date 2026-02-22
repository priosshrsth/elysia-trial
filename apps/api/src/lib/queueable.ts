import { type ConnectionOptions, Queue } from "bullmq";
import { appConfig } from "src/config/app.config";

let connection: ConnectionOptions | null = null;

export function getConnection(): ConnectionOptions {
  if (connection) return connection;

  const url = new URL(appConfig.REDIS_URL);
  connection = {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    maxRetriesPerRequest: null,
  };
  return connection;
}

const queues = new Map<string, Queue>();

function getQueue(name: string): Queue {
  const existing = queues.get(name);
  if (existing) return existing;

  const q = new Queue(name, { connection: getConnection() });
  queues.set(name, q);
  return q;
}

export abstract class QueueableService<TData> {
  abstract readonly jobName: string;

  async enqueue(data: TData): Promise<void> {
    if (appConfig.QUEUE_DRIVER === "redis") {
      await getQueue(this.jobName).add(this.jobName, data);
    } else {
      await this.execute(data);
    }
  }

  /** Called by the worker — do not call directly */
  async process(raw: unknown): Promise<void> {
    await this.execute(raw as TData);
  }

  protected abstract execute(data: TData): Promise<void>;
}
