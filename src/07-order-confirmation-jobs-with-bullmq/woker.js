import { Worker } from "bullmq";
import { connection } from "./queue.js";

const emailWorker = new Worker(
  "emails",
  async (job) => {
    console.log("Processing Email Job: ", job.id, job.name, job.data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Email Job Completed: ", job.id, job.name, job.data);
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log("Job Completed!", job.id, job.name, job.data);
});

emailWorker.on("failed", (job, err) => {
  console.log("Job Failed!", job.id, job.name, job.data, err);
});
