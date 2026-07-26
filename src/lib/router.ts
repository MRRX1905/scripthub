import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};

const getSnapshot = () => {
  const value = window.location.hash.slice(1) || "/";
  return value.startsWith("/") ? value : `/${value}`;
};

export const useHashLocation = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => "/");

export const routePath = (location: string) => location.split("?")[0];

export const navigate = (path: string) => {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
