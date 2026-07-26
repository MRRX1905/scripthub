export const assetUrl = (path: string) => {
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  const base = import.meta.env.BASE_URL;
  return `${base}${path.replace(/^\/+/, "")}`;
};
