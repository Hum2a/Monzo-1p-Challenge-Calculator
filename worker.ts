// Custom Cloudflare Worker entry: OpenNext fetch + monthly cron.
// `.open-next/worker.js` is generated at build time by opennextjs-cloudflare.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore generated at build time
import { default as handler } from "./.open-next/worker.js";

type WorkerEnv = {
  AUTH_URL?: string;
  CRON_SECRET?: string;
  ASSETS?: Fetcher;
};

const worker = {
  fetch: handler.fetch,

  /**
   * Optional Cloudflare scheduled handler.
   * Free plan: cron triggers are disabled in wrangler (account limit).
   * Monthly emails run via GitHub Actions (.github/workflows/monthly-transfer-email.yml).
   * Re-enable wrangler triggers.crons when on Workers Paid if preferred.
   */
  async scheduled(
    _controller: ScheduledController,
    env: WorkerEnv,
    ctx: ExecutionContext
  ) {
    const baseUrl = env.AUTH_URL;
    const secret = env.CRON_SECRET;

    if (!baseUrl || !secret) {
      console.error(
        "[scheduled] AUTH_URL or CRON_SECRET missing; skipping monthly transfer emails"
      );
      return;
    }

    const url = `${baseUrl.replace(/\/$/, "")}/api/cron/monthly-transfer`;

    ctx.waitUntil(
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error(
              `[scheduled] monthly-transfer failed: ${res.status} ${body.slice(0, 200)}`
            );
            return;
          }
          const json = await res.json().catch(() => null);
          console.log("[scheduled] monthly-transfer ok", json);
        })
        .catch((err: unknown) => {
          console.error("[scheduled] monthly-transfer error", err);
        })
    );
  },
};

export default worker;
