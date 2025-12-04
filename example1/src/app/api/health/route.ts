import type { HealthCheckResponse } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * ヘルスチェックエンドポイント
 * GET /api/health
 *
 * サーバーの稼働状態を確認するためのシンプルなエンドポイント
 */
export async function GET() {
  const response: HealthCheckResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 200 });
}
