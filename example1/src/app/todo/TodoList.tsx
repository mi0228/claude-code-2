'use client'

import { useState, useEffect } from 'react'
import styles from './todo.module.css'

// TODOアイテムの型定義
type Todo = {
  id: number
  text: string
  completed: boolean
  dueDate?: string // 期限日（YYYY-MM-DD形式）
}

export default function TodoList() {
  // TODOリストの状態管理
  const [todos, setTodos] = useState<Todo[]>([])
  // 入力フィールドの状態管理
  const [inputText, setInputText] = useState('')
  // 期限日の状態管理
  const [inputDueDate, setInputDueDate] = useState('')

  // LocalStorageのキー名
  const STORAGE_KEY = 'todoList'

  // 初回マウント時: LocalStorageからTODOを読み込む
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEY)
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos))
      }
    } catch (error) {
      console.error('TODOの読み込みに失敗しました:', error)
    }
  }, []) // 空の依存配列 = 初回マウント時のみ実行

  // todos が変更されたら LocalStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch (error) {
      console.error('TODOの保存に失敗しました:', error)
    }
  }, [todos]) // todos が変更されるたびに実行

  // TODOを追加する関数
  const addTodo = () => {
    if (inputText.trim() === '') return // 空白の場合は追加しない

    const newTodo: Todo = {
      id: Date.now(), // ユニークなIDとして現在時刻を使用
      text: inputText,
      completed: false,
      dueDate: inputDueDate || undefined // 期限が入力されていれば設定
    }

    setTodos([...todos, newTodo])
    setInputText('') // 入力フィールドをクリア
    setInputDueDate('') // 期限フィールドをクリア
  }

  // TODOを削除する関数
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // TODOの完了状態を切り替える関数
  const toggleComplete = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // Enterキーで追加できるようにする
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // 期限の状態を判定する関数
  const getDueDateStatus = (dueDate?: string): 'overdue' | 'soon' | 'normal' | 'none' => {
    if (!dueDate) return 'none'

    const today = new Date()
    today.setHours(0, 0, 0, 0) // 時刻をリセット

    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)

    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'overdue' // 期限切れ
    if (diffDays <= 3) return 'soon' // 3日以内
    return 'normal'
  }

  // 期限日をフォーマットする関数（MM/DD形式）
  const formatDueDate = (dueDate: string): string => {
    const date = new Date(dueDate)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // TODOを期限でソート（期限が近い順、期限なしは最後）
  const sortedTodos = [...todos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className={styles.todoContainer}>
      <h2>TODOリスト</h2>

      {/* 入力エリア */}
      <div className={styles.inputArea}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="新しいTODOを入力..."
          className={styles.input}
        />
        <input
          type="date"
          value={inputDueDate}
          onChange={(e) => setInputDueDate(e.target.value)}
          className={styles.dateInput}
        />
        <button onClick={addTodo} className={styles.addButton}>
          追加
        </button>
      </div>

      {/* TODOリスト表示 */}
      <ul className={styles.todoList}>
        {sortedTodos.length === 0 ? (
          <p className={styles.emptyMessage}>TODOがありません。上から追加してください。</p>
        ) : (
          sortedTodos.map(todo => {
            const dueDateStatus = getDueDateStatus(todo.dueDate)
            const itemClass = `${styles.todoItem} ${
              dueDateStatus === 'overdue' ? styles.overdue :
              dueDateStatus === 'soon' ? styles.dueSoon :
              ''
            }`

            return (
              <li key={todo.id} className={itemClass}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                  className={styles.checkbox}
                />
                <div className={styles.todoContent}>
                  <span className={todo.completed ? styles.completedText : styles.todoText}>
                    {todo.text}
                  </span>
                  {todo.dueDate && (
                    <span className={styles.dueDate}>
                      期限: {formatDueDate(todo.dueDate)}
                      {dueDateStatus === 'overdue' && <span className={styles.overdueLabel}> (期限切れ)</span>}
                      {dueDateStatus === 'soon' && <span className={styles.soonLabel}> (まもなく)</span>}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className={styles.deleteButton}
                >
                  削除
                </button>
              </li>
            )
          })
        )}
      </ul>

      {/* 統計情報 */}
      <div className={styles.stats}>
        <p>
          合計: {todos.length}件 |
          完了: {todos.filter(t => t.completed).length}件 |
          未完了: {todos.filter(t => !t.completed).length}件
          {todos.filter(t => getDueDateStatus(t.dueDate) === 'overdue' && !t.completed).length > 0 && (
            <span className={styles.overdueCount}>
              {' '}| 期限切れ: {todos.filter(t => getDueDateStatus(t.dueDate) === 'overdue' && !t.completed).length}件
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
