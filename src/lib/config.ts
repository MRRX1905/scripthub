const env = import.meta.env;

export const adminDefaults = {
  owner: env.VITE_GITHUB_OWNER || "",
  repo: env.VITE_GITHUB_REPO || "",
  branch: env.VITE_GITHUB_BRANCH || "main",
  contentPath:
    env.VITE_GITHUB_CONTENT_PATH || "public/data/content.json",
  allowedLogin: env.VITE_GITHUB_ADMIN_LOGIN || env.VITE_GITHUB_OWNER || "",
};

export const SESSION_KEY = "scripthub.admin.session.v1";
export const REPOSITORY_KEY = "scripthub.admin.repository.v1";
