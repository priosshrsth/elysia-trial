import { Worker } from "bullmq";
import { Elysia } from "elysia";
import { appConfig } from "src/config/app.config";
import { getConnection, type QueueableService } from "src/lib/queueable";
import { emailService } from "src/modules/emails/email.service";

const PORT = Number(appConfig.PORT) || 8080;

const services: QueueableService<unknown>[] = [emailService];

for (const service of services) {
  const worker = new Worker(
    service.jobName,
    async (job) => {
      await service.process(job.data);
    },
    { connection: getConnection() },
  );

  worker.on("completed", (job) => {
    console.log(`[worker:${service.jobName}] job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker:${service.jobName}] job ${job?.id} failed:`, err);
  });

  console.log(`[worker] registered processor for "${service.jobName}"`);
}

new Elysia()
  .get("/health", () => "ok")
  .listen(PORT, () => {
    console.log(`[worker] health server on :${PORT}`);
  });
