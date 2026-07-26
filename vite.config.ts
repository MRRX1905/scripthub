import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrganizationSite = repositoryName?.endsWith(".github.io");
const inferredPagesBase =
  process.env.GITHUB_ACTIONS && repositoryName && !isUserOrOrganizationSite
    ? `/${repositoryName}/`
    : "/";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || inferredPagesBase,
  plugins: [react()],
  build: {
    sourcemap: true,
  },
});
