import type {
  ContentData,
  GitHubConnection,
  GitHubFile,
} from "../types";

const API_ROOT = "https://api.github.com";
const API_VERSION = "2026-03-10";

const headers = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": API_VERSION,
});

const parseError = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;
  const message = body?.message || `GitHub API error ${response.status}`;

  if (response.status === 401) {
    return new Error("Token GitHub tidak valid atau sudah kedaluwarsa.");
  }
  if (response.status === 403) {
    return new Error(
      "Token belum memiliki izin Contents: Read and write untuk repositori ini.",
    );
  }
  if (response.status === 404) {
    return new Error(
      "Repositori atau file konten tidak ditemukan. Periksa owner, repo, branch, dan path.",
    );
  }
  if (response.status === 409) {
    return new Error(
      "Konten berubah di GitHub. Muat ulang data sebelum menyimpan lagi.",
    );
  }

  return new Error(message);
};

const encodeBase64Utf8 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
};

const decodeBase64Utf8 = (value: string) => {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const getAuthenticatedUser = async (token: string) => {
  const response = await fetch(`${API_ROOT}/user`, {
    headers: headers(token),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as { login: string; avatar_url: string };
};

export const getRepository = async (
  owner: string,
  repo: string,
  token: string,
) => {
  const response = await fetch(
    `${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers: headers(token) },
  );

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as {
    default_branch: string;
    permissions?: { push?: boolean };
  };
};

export const getContentFile = async (
  connection: Omit<GitHubConnection, "login">,
): Promise<GitHubFile<ContentData>> => {
  const { owner, repo, branch, contentPath, token } = connection;
  const path = contentPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const response = await fetch(
    `${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    { headers: headers(token) },
  );

  if (!response.ok) {
    throw await parseError(response);
  }

  const payload = (await response.json()) as {
    content: string;
    encoding: string;
    sha: string;
  };

  if (payload.encoding !== "base64") {
    throw new Error("Format file konten dari GitHub tidak didukung.");
  }

  return {
    data: JSON.parse(decodeBase64Utf8(payload.content)) as ContentData,
    sha: payload.sha,
  };
};

export const updateContentFile = async (
  connection: GitHubConnection,
  content: ContentData,
  sha: string,
  message: string,
) => {
  const { owner, repo, branch, contentPath, token } = connection;
  const path = contentPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const response = await fetch(
    `${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        ...headers(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: encodeBase64Utf8(`${JSON.stringify(content, null, 2)}\n`),
        sha,
        branch,
      }),
    },
  );

  if (!response.ok) {
    throw await parseError(response);
  }

  const payload = (await response.json()) as {
    content: { sha: string };
    commit: { html_url: string };
  };

  return {
    sha: payload.content.sha,
    commitUrl: payload.commit.html_url,
  };
};
