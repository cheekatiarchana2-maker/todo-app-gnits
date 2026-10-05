import { useState } from "react";

const getDateInputValue = (date) => (date ? String(date).slice(0, 10) : "");

const formatDueDate = (date) => {
  const [year, month, day] = getDateInputValue(date).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.title);
  const [priority, setPriority] = useState(todo.priority || "Medium");
  const [dueDate, setDueDate] = useState(getDateInputValue(todo.dueDate));
  const [category, setCategory] = useState(todo.category || "Other");
  const dueDateValue = getDateInputValue(todo.dueDate);
  const isOverdue =
    Boolean(dueDateValue) && !todo.completed && dueDateValue < getTodayInputValue();

  const handleSave = () => {
    const title = text.trim();
    const updates = {};
    if (title && title !== todo.title) updates.title = title;
    if (priority !== (todo.priority || "Medium")) updates.priority = priority;
    if (dueDate !== getDateInputValue(todo.dueDate)) {
      updates.dueDate = dueDate || null;
    }
    if (category !== (todo.category || "Other")) updates.category = category;
    if (Object.keys(updates).length > 0) onUpdate(todo._id, updates);
    if (!title) setText(todo.title);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(todo.title);
    setPriority(todo.priority || "Medium");
    setDueDate(getDateInputValue(todo.dueDate));
    setCategory(todo.category || "Other");
    setIsEditing(false);
  };

  const startEditing = () => {
    setText(todo.title);
    setPriority(todo.priority || "Medium");
    setDueDate(getDateInputValue(todo.dueDate));
    setCategory(todo.category || "Other");
    setIsEditing(true);
  };

  const handleEditBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) handleSave();
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onUpdate(todo._id, { completed: !todo.completed })}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "not done" : "done"}`}
      />

      {isEditing ? (
        <div className="todo-edit-fields" onBlur={handleEditBlur}>
          <input
            className="edit-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
          />
          <select
            className="priority-select edit-priority"
            aria-label={`Priority for ${todo.title}`}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            className="date-input edit-due-date"
            type="date"
            aria-label={`Due date for ${todo.title}`}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <select
            className="category-select edit-category"
            aria-label={`Category for ${todo.title}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          >
            <option value="Study">Study</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>
        </div>
      ) : (
        <div className="todo-text" onDoubleClick={startEditing}>
          <span className="title">{todo.title}</span>
          <span className="meta">
            Added{" "}
            {new Date(todo.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })}
          </span>
          {todo.dueDate && (
            <span className={`due-date ${isOverdue ? "overdue" : ""}`}>
              {`Due ${formatDueDate(todo.dueDate)}${isOverdue ? " · Overdue" : ""}`}
            </span>
          )}
        </div>
      )}

      {!isEditing && (
        <span
          className={`category-label category-${(todo.category || "Other").toLowerCase()}`}
        >
          {todo.category || "Other"}
        </span>
      )}

      {!isEditing && (
        <span
          className={`priority-label priority-${(todo.priority || "Medium").toLowerCase()}`}
        >
          {todo.priority || "Medium"}
        </span>
      )}

      {!isEditing && (
        <div className="actions">
          <button onClick={startEditing}>Edit</button>
          <button className="delete" onClick={() => onDelete(todo._id)}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default TodoItem;
