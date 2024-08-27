import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@uta/env";
import { appRouter } from "@uta/server/api/root";
import { createTRPCContext } from "@uta/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
