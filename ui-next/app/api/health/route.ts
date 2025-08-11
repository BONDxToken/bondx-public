import { NextResponse } from "next/server";

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGitHub = !!process.env.GITHUB_TOKEN;

  return NextResponse.json({
    ok: true,
    openaiKey: hasOpenAI ? "present" : "missing",
    githubToken: hasGitHub ? "present" : "missing",
  });
}
