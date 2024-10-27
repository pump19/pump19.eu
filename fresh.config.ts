import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import oauth from "./plugins/oauth.ts";

export default defineConfig({
  plugins: [oauth(), tailwind()],
});
