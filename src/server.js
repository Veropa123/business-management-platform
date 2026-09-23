import { createApp } from "./app.js";
import { config } from "./config.js";
import { createStore } from "./store/index.js";

const store = createStore();

try {
  await store.init();
  const app = createApp(store);

  app.listen(config.port, "0.0.0.0", () => {
    console.log(
      `Business Management Platform running on http://0.0.0.0:${config.port}`
    );
  });
} catch (error) {
  console.error("Failed to start application:", error);
  process.exit(1);
}
