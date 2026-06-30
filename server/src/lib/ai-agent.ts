import prisma from "../db";
import { AI_AGENT_EMAIL } from "./constants";

let cachedId: string | null = null;

export async function getAIAgentId(): Promise<string> {
  if (cachedId) return cachedId;

  const agent = await prisma.user.findUnique({
    where: { email: AI_AGENT_EMAIL },
    select: { id: true },
  });

  if (!agent) throw new Error(`AI agent not found — run "bun run db:seed" first`);

  cachedId = agent.id;
  return cachedId;
}
