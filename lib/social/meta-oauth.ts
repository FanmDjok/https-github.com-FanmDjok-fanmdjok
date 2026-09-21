import "server-only";

// Graph API — helpers partagés entre les adaptateurs Instagram et Facebook,
// qui s'authentifient tous les deux via Facebook Login for Business.
// Référence : https://developers.facebook.com/docs/facebook-login
// (non revérifiée en direct dans cet environnement, réseau sortant restreint
// — à confirmer avec la documentation à jour avant la mise en production).

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function metaAuthorizationUrl(scopes: string[], state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: scopes.join(","),
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${GRAPH_BASE}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error?.message || `Erreur Graph API (${res.status})`);
  }
  return body as T;
}

export async function exchangeMetaCode(code: string, redirectUri: string) {
  const shortLived = await graphGet<{ access_token: string; expires_in?: number }>(
    "/oauth/access_token",
    {
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    },
  );

  const longLived = await graphGet<{ access_token: string; expires_in: number }>(
    "/oauth/access_token",
    {
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: shortLived.access_token,
    },
  );

  return longLived;
}

export type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
};

// Renvoie la première page gérée par l'utilisateur. Une véritable interface
// de sélection de page (si l'utilisateur en gère plusieurs) reste à
// construire — limitation connue de cette version.
export async function fetchFirstManagedPage(userAccessToken: string): Promise<MetaPage | null> {
  const result = await graphGet<{ data: MetaPage[] }>("/me/accounts", {
    fields: "id,name,access_token,instagram_business_account",
    access_token: userAccessToken,
  });
  return result.data[0] ?? null;
}

export async function graphPost<T>(
  path: string,
  body: Record<string, string>,
): Promise<T> {
  const url = `${GRAPH_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `Erreur Graph API (${res.status})`);
  }
  return json as T;
}

export { graphGet };
