import { describe, expect, it } from "vitest";
import { GET } from "./route";

/**
 * ヘルスチェックAPIのテスト
 *
 * このテストでは、/api/health エンドポイントが正しく動作するかを確認します
 */
describe("GET /api/health", () => {
  it("200ステータスコードを返すこと", async () => {
    // GETハンドラーを呼び出す
    const response = await GET();

    // ステータスコードが200であることを確認
    expect(response.status).toBe(200);
  });

  it("レスポンスボディにstatusフィールドが含まれること", async () => {
    const response = await GET();
    const data = await response.json();

    // statusフィールドが存在し、値が"ok"であることを確認
    expect(data).toHaveProperty("status");
    expect(data.status).toBe("ok");
  });

  it("レスポンスボディにtimestampフィールドが含まれること", async () => {
    const response = await GET();
    const data = await response.json();

    // timestampフィールドが存在することを確認
    expect(data).toHaveProperty("timestamp");
    expect(data.timestamp).toBeDefined();
  });

  it("timestampがISO 8601形式であること", async () => {
    const response = await GET();
    const data = await response.json();

    // ISO 8601形式の正規表現パターン
    // 例: 2025-12-02T10:30:00.000Z
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    // timestampがISO 8601形式に一致することを確認
    expect(data.timestamp).toMatch(iso8601Pattern);
  });

  it("レスポンスのContent-TypeがJSONであること", async () => {
    const response = await GET();

    // Content-Typeヘッダーを確認
    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("application/json");
  });
});
