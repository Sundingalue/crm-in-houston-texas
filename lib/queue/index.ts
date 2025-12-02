type Job = { type: string; payload: unknown };

// In-memory queue; replace with Redis/BullMQ if REDIS_URL is set.
const jobs: Job[] = [];
const redisUrl = process.env.REDIS_URL || process.env.QUEUE_URL;

export async function enqueueJob(job: Job) {
  if (!redisUrl) {
    jobs.push(job);
    return;
  }
  // TODO: wire BullMQ/Redis here using redisUrl
  jobs.push(job);
}

export function readJobs() {
  return jobs;
}

export async function drainJobs(processor: (job: Job) => Promise<void>) {
  while (jobs.length) {
    const job = jobs.shift();
    if (!job) continue;
    await processor(job);
  }
}
