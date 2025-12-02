import { NextRequest, NextResponse } from 'next/server'

// OpenWeatherMap APIのレスポンス型定義（3時間ごとの予報）
type WeatherItem = {
  dt: number
  dt_txt: string
  main: {
    temp: number
    temp_min: number
    temp_max: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
}

type OpenWeatherResponse = {
  city: {
    name: string
    country: string
  }
  list: WeatherItem[]
}

// クライアントに返すシンプルな天気データ型
export type WeatherForecast = {
  date: string
  dayOfWeek: string
  tempMax: number
  tempMin: number
  description: string
  icon: string
}

export type WeatherApiResponse = {
  city: string
  country: string
  forecasts: WeatherForecast[]
}

// GET /api/weather?city=Tokyo
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータから都市名を取得
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city') || 'Tokyo'

    // 環境変数からAPIキーを取得
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 500 }
      )
    }

    // OpenWeatherMap APIを呼び出し（5日間の3時間ごとの予報）
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=ja&appid=${apiKey}`

    const response = await fetch(url, {
      // 5分間キャッシュ（API呼び出しを減らすため）
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: '都市が見つかりません' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: '天気情報の取得に失敗しました' },
        { status: response.status }
      )
    }

    const data: OpenWeatherResponse = await response.json()

    // 曜日を日本語で取得する関数
    const getDayOfWeek = (timestamp: number): string => {
      const days = ['日', '月', '火', '水', '木', '金', '土']
      const date = new Date(timestamp * 1000)
      return days[date.getDay()]
    }

    // 日付をフォーマットする関数（MM/DD形式）
    const formatDate = (timestamp: number): string => {
      const date = new Date(timestamp * 1000)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}/${day}`
    }

    // 3時間ごとのデータを日ごとに集約
    const dailyData: { [key: string]: {
      temps: number[]
      weatherItems: WeatherItem[]
      date: string
      timestamp: number
    } } = {}

    data.list.forEach(item => {
      const date = formatDate(item.dt)

      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          weatherItems: [],
          date,
          timestamp: item.dt
        }
      }

      dailyData[date].temps.push(item.main.temp)
      dailyData[date].weatherItems.push(item)
    })

    // 日ごとのデータを整形（最大7日分）
    const forecasts: WeatherForecast[] = Object.values(dailyData)
      .slice(0, 7)
      .map(day => {
        // その日の最高気温と最低気温を計算
        const tempMax = Math.round(Math.max(...day.temps))
        const tempMin = Math.round(Math.min(...day.temps))

        // その日の正午前後（12時）の天気を代表として使用
        const noonWeather = day.weatherItems.find(item => {
          const hour = new Date(item.dt * 1000).getHours()
          return hour >= 11 && hour <= 14
        }) || day.weatherItems[0]

        return {
          date: day.date,
          dayOfWeek: getDayOfWeek(day.timestamp),
          tempMax,
          tempMin,
          description: noonWeather.weather[0].description,
          icon: noonWeather.weather[0].icon
        }
      })

    const responseData: WeatherApiResponse = {
      city: data.city.name,
      country: data.city.country,
      forecasts
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('天気API エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
