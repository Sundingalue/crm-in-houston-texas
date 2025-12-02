// Placeholder worker to process enqueued jobs.
// Replace with a real queue (e.g., BullMQ) and run with `ts-node` or build step.

import { drainJobs } from "../lib/queue";

type JobPayload = unknown;

async function processJob(job: { type: string; payload: JobPayload }) {
  if (job.type === "campaign.send") {
    console.log("Processing campaign send job (stub)", job.payload);
    return;
  }
  console.log("Unhandled job type", job.type);
}

async function main() {
  await drainJobs(processJob);
  process.exit(0);
}

void main();
