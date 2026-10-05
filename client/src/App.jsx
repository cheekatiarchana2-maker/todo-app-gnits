import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api";
import { FILTERS } from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

const TODOS_PER_PAGE = 10;

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("todo-app-theme") === "dark" ? "dark" : "light"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs an API action and shows its error in the banner if it fails
  const run = async (action) => {
    try {
      setError("");
      await action();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    run(async () => setTodos(await getTodos())).finally(() =>
      setLoading(false)
    );
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("todo-app-theme", theme);
  }, [theme]);

  const handleAdd = (title, priority, dueDate, category) =>
    run(async () => {
      const newTodo = await createTodo(title, priority, dueDate, category);
      setTodos((prev) => [newTodo, ...prev]);
    });

  const handleUpdate = (id, data) =>
    run(async () => {
      const updated = await updateTodo(id, data);
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? updated : todo))
      );
    });

  const handleDelete = (id) =>
    run(async () => {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    });

  const handleClearDone = () =>
    run(async () => {
      const done = todos.filter(FILTERS.done.test);
      await Promise.all(done.map((t) => deleteTodo(t._id)));
      setTodos((prev) => prev.filter((t) => !t.completed));
    });

  const filteredTodos = todos
    .filter(FILTERS[filter].test)
    .filter((todo) =>
      todo.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  const pageCount = Math.ceil(filteredTodos.length / TODOS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const pageTodos = filteredTodos.slice(
    (currentPage - 1) * TODOS_PER_PAGE,
    currentPage * TODOS_PER_PAGE
  );

  return (
    <div className="layout">
      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={(nextFilter) => {
          setFilter(nextFilter);
          setPage(1);
        }}
        onClearDone={handleClearDone}
        theme={theme}
        onToggleTheme={() =>
          setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
          )
        }
      />

      <main className="panel content">
        <header className="content-header">
          <h2>{FILTERS[filter].label}</h2>
          <span className="content-count">
            {filteredTodos.length} {filteredTodos.length === 1 ? "task" : "tasks"}
          </span>
        </header>

        <TodoForm onAdd={handleAdd} />
        <input
          className="search-input"
          type="search"
          aria-label="Search todos"
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {loading ? (
          <p className="empty">Loading...</p>
        ) : filteredTodos.length === 0 ? (
          <div className="empty">
            <img src="/logo.png" alt="" />
            <p>
              {search.trim()
                ? `No tasks found for "${search.trim()}".`
                : filter === "done"
                ? "Nothing completed yet"
                : "You're all caught up. Add a task above."}
            </p>
          </div>
        ) : (
          <ul className="todo-list">
            {pageTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}

        {!loading && pageCount > 1 && (
          <nav className="pagination" aria-label="Todo list pages">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default App;
