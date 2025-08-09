import { redisClient } from "@/lib/redis";
import crypto from "crypto";
import { cookies } from "next/headers";
import z from "zod";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

const sessionDataSchema = z.object({
  userId: z.string().uuid(),
});

type SessionData = z.infer<typeof sessionDataSchema>;

/**
 * Redis
 */

export async function createSession(data: SessionData): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");

  await redisClient.set(`session:${token}`, data, {
    ex: SESSION_DURATION_SECONDS,
  });

  return token;
}

export async function getSession() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  const res = await redisClient.get(`session:${token}`);

  const { success, data } = sessionDataSchema.safeParse(res);

  if (!success) {
    await unsetSessionCookie();
    await deleteSession(token);
    return null;
  }

  return data;
}

export async function deleteSession(token: string): Promise<void> {
  await redisClient.del(`session:${token}`);
}

/**
 * Cookies
 */

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

export async function getSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return token;
}

export async function unsetSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const res = cookieStore.delete(SESSION_COOKIE_NAME);
}
