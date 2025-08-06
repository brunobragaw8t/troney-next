import { redisClient } from "@/lib/redis";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");

  await redisClient.set(`session:${token}`, userId, {
    ex: SESSION_DURATION_SECONDS,
  });

  return token;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const userId = await redisClient.get(`session:${token}`);

  if (!userId) {
    return null;
  }

  return userId;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
  });
}
