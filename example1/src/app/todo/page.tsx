import TodoList from "./TodoList";
import WeatherDisplay from "./WeatherDisplay";
import styles from "./todo.module.css";

// このページはServer Component（デフォルト）
export default function TodoPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>天気付きTODOリスト</h1>

      {/* 天気表示エリア（Client Component） */}
      <WeatherDisplay />

      {/* TODOリスト（Client Component） */}
      <TodoList />
    </main>
  );
}
