import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

/**
 * 天気APIのテスト
 *
 * このテストでは、外部API（OpenWeatherMap）の呼び出しを「モック」します。
 * モックとは、実際のAPIを呼ばずに、偽のデータを返すようにすることです。
 */

// グローバルなfetchをモック化
// vi.fn()は、Vitestで偽の関数を作る機能です
const mockFetch = vi.fn();
global.fetch = mockFetch as typeof fetch;

// 各テストの前に実行される処理
beforeEach(() => {
  // モックをリセット（前のテストの影響を受けないようにする）
  mockFetch.mockReset();

  // 環境変数を設定（APIキーを偽物として設定）
  process.env.OPENWEATHER_API_KEY = "test-api-key-12345";
});

/**
 * ヘルパー関数: テスト用のNextRequestを作成
 *
 * Next.jsのAPIは NextRequest オブジェクトを受け取るので、
 * テストでもそれを作る必要があります
 */
function createMockRequest(city = "Tokyo"): NextRequest {
  const url = `http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`;
  return new NextRequest(url);
}

/**
 * ヘルパー関数: OpenWeatherMapのモックレスポンスを作成
 *
 * 実際のAPIが返すデータ構造を模倣した偽のデータです
 */
function createMockWeatherResponse() {
  return {
    city: {
      name: "Tokyo",
      country: "JP",
    },
    list: [
      {
        dt: 1701345600, // 2023-11-30 12:00:00 UTC
        dt_txt: "2023-11-30 12:00:00",
        main: {
          temp: 15.5,
          temp_min: 14.0,
          temp_max: 17.0,
        },
        weather: [
          {
            id: 800,
            main: "Clear",
            description: "快晴",
            icon: "01d",
          },
        ],
      },
      {
        dt: 1701356400, // 2023-11-30 15:00:00 UTC
        dt_txt: "2023-11-30 15:00:00",
        main: {
          temp: 16.5,
          temp_min: 15.0,
          temp_max: 18.0,
        },
        weather: [
          {
            id: 801,
            main: "Clouds",
            description: "曇りがち",
            icon: "02d",
          },
        ],
      },
    ],
  };
}

describe("GET /api/weather", () => {
  /**
   * 正常系のテスト
   */
  describe("正常系", () => {
    it("都市名を指定すると、天気情報を返すこと", async () => {
      // モックの設定：fetchが呼ばれたら、偽のデータを返す
      const mockData = createMockWeatherResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      // テスト実行：GETハンドラーを呼び出す
      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：ステータスコードが200であること
      expect(response.status).toBe(200);

      // 検証：レスポンスに必要なフィールドが含まれていること
      expect(data).toHaveProperty("city");
      expect(data).toHaveProperty("country");
      expect(data).toHaveProperty("forecasts");

      // 検証：都市名が正しいこと
      expect(data.city).toBe("Tokyo");
      expect(data.country).toBe("JP");

      // 検証：予報データが配列であること
      expect(Array.isArray(data.forecasts)).toBe(true);
      expect(data.forecasts.length).toBeGreaterThan(0);

      // 検証：予報データの構造が正しいこと
      const forecast = data.forecasts[0];
      expect(forecast).toHaveProperty("date");
      expect(forecast).toHaveProperty("dayOfWeek");
      expect(forecast).toHaveProperty("tempMax");
      expect(forecast).toHaveProperty("tempMin");
      expect(forecast).toHaveProperty("description");
      expect(forecast).toHaveProperty("icon");
    });

    it("都市名を省略すると、デフォルトで東京の天気を返すこと", async () => {
      const mockData = createMockWeatherResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      // 都市名を指定せずにリクエスト
      const request = createMockRequest("");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.city).toBe("Tokyo");
    });

    it("OpenWeatherMap APIが正しいURLで呼ばれること", async () => {
      const mockData = createMockWeatherResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const request = createMockRequest("Osaka");
      await GET(request);

      // fetchが1回呼ばれたことを確認
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // 呼ばれたURLを確認
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("api.openweathermap.org");
      expect(calledUrl).toContain("q=Osaka");
      expect(calledUrl).toContain("appid=test-api-key-12345");
    });
  });

  /**
   * エラーハンドリングのテスト
   *
   * ここからが「より複雑なテスト」です！
   * 様々なエラーケースをテストします
   */
  describe("エラーハンドリング", () => {
    it("APIキーが設定されていない場合、500エラーを返すこと", async () => {
      // 環境変数を削除（APIキーがない状態を作る）
      process.env.OPENWEATHER_API_KEY = undefined;

      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：500エラーが返ること
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("APIキーが設定されていません");

      // テスト後に環境変数を復元
      process.env.OPENWEATHER_API_KEY = "test-api-key-12345";
    });

    it("存在しない都市を指定した場合、404エラーを返すこと", async () => {
      // モックの設定：404エラーを返す
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "city not found" }),
      });

      const request = createMockRequest("NonExistentCity");
      const response = await GET(request);
      const data = await response.json();

      // 検証：404エラーが返ること
      expect(response.status).toBe(404);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("都市が見つかりません");
    });

    it("OpenWeatherMap APIがエラーを返した場合、適切なエラーメッセージを返すこと", async () => {
      // モックの設定：503エラー（サービス利用不可）を返す
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ message: "Service Unavailable" }),
      });

      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：503エラーが返ること
      expect(response.status).toBe(503);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("天気情報の取得に失敗しました");
    });

    it("ネットワークエラーが発生した場合、500エラーを返すこと", async () => {
      // モックの設定：fetchが例外をスロー（ネットワークエラーを模擬）
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：500エラーが返ること
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("サーバーエラーが発生しました");
    });

    it("不正なJSONレスポンスの場合、500エラーを返すこと", async () => {
      // モックの設定：JSONのパースに失敗する
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：500エラーが返ること
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error");
    });
  });

  /**
   * データ変換のテスト
   *
   * APIが返すデータの形式が正しいかをテストします
   */
  describe("データ変換", () => {
    it("気温が正しく丸められること", async () => {
      const mockData = {
        city: { name: "Tokyo", country: "JP" },
        list: [
          {
            dt: 1701345600,
            dt_txt: "2023-11-30 12:00:00",
            main: {
              temp: 14.3, // 最低気温
              temp_min: 14.3,
              temp_max: 17.8,
            },
            weather: [{ id: 800, main: "Clear", description: "快晴", icon: "01d" }],
          },
          {
            dt: 1701356400,
            dt_txt: "2023-11-30 15:00:00",
            main: {
              temp: 17.8, // 最高気温
              temp_min: 14.3,
              temp_max: 17.8,
            },
            weather: [{ id: 800, main: "Clear", description: "快晴", icon: "01d" }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：気温が整数に丸められていること
      const forecast = data.forecasts[0];
      expect(Number.isInteger(forecast.tempMax)).toBe(true);
      expect(Number.isInteger(forecast.tempMin)).toBe(true);
      expect(forecast.tempMax).toBe(18); // 17.8 → 18
      expect(forecast.tempMin).toBe(14); // 14.3 → 14
    });

    it("曜日が正しく設定されること", async () => {
      const mockData = createMockWeatherResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const request = createMockRequest("Tokyo");
      const response = await GET(request);
      const data = await response.json();

      // 検証：曜日が日本語で設定されていること
      const forecast = data.forecasts[0];
      expect(forecast.dayOfWeek).toMatch(/^[日月火水木金土]$/);
    });
  });
});
