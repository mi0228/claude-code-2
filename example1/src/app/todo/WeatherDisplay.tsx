'use client'

import { useState, useEffect } from 'react'
import styles from './todo.module.css'
import type { WeatherApiResponse } from '../api/weather/route'

export default function WeatherDisplay() {
  // LocalStorageのキー名
  const STORAGE_KEY = 'weatherCity'

  // 天気データの状態管理
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null)
  // 都市名の状態管理
  const [city, setCity] = useState('Tokyo')
  // 都市名入力フィールドの状態管理
  const [cityInput, setCityInput] = useState('Tokyo')
  // ローディング状態
  const [loading, setLoading] = useState(false)
  // エラー状態
  const [error, setError] = useState<string | null>(null)

  // 天気データを取得する関数
  const fetchWeather = async (cityName: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '天気情報の取得に失敗しました')
      }

      const data: WeatherApiResponse = await response.json()
      setWeatherData(data)
      setCity(cityName)

      // LocalStorageに都市名を保存
      try {
        localStorage.setItem(STORAGE_KEY, cityName)
      } catch (error) {
        console.error('都市名の保存に失敗しました:', error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '天気情報の取得に失敗しました')
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  // 初回マウント時にLocalStorageから都市名を読み込んで天気を取得
  useEffect(() => {
    try {
      const savedCity = localStorage.getItem(STORAGE_KEY)
      const initialCity = savedCity || 'Tokyo'
      setCityInput(initialCity)
      fetchWeather(initialCity)
    } catch (error) {
      console.error('都市名の読み込みに失敗しました:', error)
      fetchWeather('Tokyo')
    }
  }, [])

  // 都市名変更ボタンのハンドラー
  const handleCityChange = () => {
    if (cityInput.trim() === '') return
    fetchWeather(cityInput.trim())
  }

  // Enterキーで都市名変更
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCityChange()
    }
  }

  return (
    <div className={styles.weatherContainer}>
      <h2>天気予報</h2>

      {/* 都市名変更エリア */}
      <div className={styles.cityInputArea}>
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="都市名を入力 (例: Tokyo, Osaka, London)"
          className={styles.cityInput}
        />
        <button
          onClick={handleCityChange}
          className={styles.changeCityButton}
          disabled={loading}
        >
          {loading ? '読込中...' : '変更'}
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.weatherError}>
          <p>{error}</p>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && !weatherData && (
        <div className={styles.weatherLoading}>
          <p>天気情報を読み込んでいます...</p>
        </div>
      )}

      {/* 天気予報表示 */}
      {weatherData && !loading && (
        <div className={styles.weatherContent}>
          <p className={styles.cityName}>
            {weatherData.city} ({weatherData.country})
          </p>

          <div className={styles.forecastGrid}>
            {weatherData.forecasts.map((forecast, index) => (
              <div key={index} className={styles.forecastCard}>
                <div className={styles.forecastDate}>
                  {forecast.date}
                  <span className={styles.forecastDay}>({forecast.dayOfWeek})</span>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
                  alt={forecast.description}
                  className={styles.weatherIcon}
                />
                <div className={styles.forecastTemp}>
                  <span className={styles.tempMax}>{forecast.tempMax}°</span>
                  <span className={styles.tempSeparator}>/</span>
                  <span className={styles.tempMin}>{forecast.tempMin}°</span>
                </div>
                <div className={styles.forecastDescription}>
                  {forecast.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
