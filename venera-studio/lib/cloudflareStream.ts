import { createPrivateKey } from "node:crypto";
import { SignJWT, importPKCS8 } from "jose";
import {
  getVideoAssetFallback,
  isVideoAssetKey,
  type VideoAssetKey,
} from "@/data/videoAssets";

const TOKEN_TTL_SEC = 60 * 60;

type StreamEnv = {
  customerSubdomain: string;
  signingKeyId: string;
  signingKeyPem: string;
};

function readStreamEnv(): StreamEnv | null {
  const customerSubdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
  const signingKeyId = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
  const signingKeyPem = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_PEM;

  if (!customerSubdomain || !signingKeyId || !signingKeyPem) {
    return null;
  }

  return {
    customerSubdomain,
    signingKeyId,
    signingKeyPem: signingKeyPem.replace(/\\n/g, "\n"),
  };
}

function parseStreamUidMap(): Record<string, string> {
  const raw = process.env.STREAM_VIDEO_MAP;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function isStreamPlaybackConfigured(): boolean {
  return readStreamEnv() !== null && Object.keys(parseStreamUidMap()).length > 0;
}

export function getStreamUidForKey(key: VideoAssetKey): string | null {
  const uid = parseStreamUidMap()[key];
  return uid && uid.length > 0 ? uid : null;
}

export function isAllowedPlaybackReferer(referer: string | null): boolean {
  if (!referer) return process.env.NODE_ENV !== "production";
  try {
    const { hostname } = new URL(referer);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname === "venerastudio.com" || hostname.endsWith(".venerastudio.com")) {
      return true;
    }
    if (hostname.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
}

async function signStreamToken(
  videoUid: string,
  env: StreamEnv,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
  const key = await importPKCS8(env.signingKeyPem, "RS256");

  return new SignJWT({
    sub: videoUid,
    kid: env.signingKeyId,
    exp,
    accessRules: [{ type: "any", action: "allow" }],
  })
    .setProtectedHeader({ alg: "RS256", kid: env.signingKeyId })
    .sign(key);
}

export type PlaybackPayload = {
  url: string;
  format: "hls" | "mp4";
  signed: boolean;
  expiresAt: number | null;
};

export async function resolvePlaybackForKey(
  key: string,
): Promise<PlaybackPayload | null> {
  if (!isVideoAssetKey(key)) return null;

  const streamEnv = readStreamEnv();
  const streamUid = getStreamUidForKey(key);
  const fallback = getVideoAssetFallback(key);

  if (streamEnv && streamUid) {
    const token = await signStreamToken(streamUid, streamEnv);
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
    const base = `https://${streamEnv.customerSubdomain}.cloudflarestream.com/${streamUid}`;
    return {
      url: `${base}/manifest/video.m3u8?token=${token}`,
      format: "hls",
      signed: true,
      expiresAt,
    };
  }

  if (process.env.NODE_ENV === "production" && process.env.STREAM_REQUIRE_SIGNED === "1") {
    return null;
  }

  return {
    url: fallback,
    format: "mp4",
    signed: false,
    expiresAt: null,
  };
}

/** Node key sanity check for upload / setup scripts. */
export function assertSigningKeyReadable(): boolean {
  const env = readStreamEnv();
  if (!env) return false;
  try {
    createPrivateKey({ key: env.signingKeyPem, format: "pem" });
    return true;
  } catch {
    return false;
  }
}
