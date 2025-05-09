import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./App.css";

const socket = io("http://localhost:3000");

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:3000/fetchAllTasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = () => {
    if (!task.trim()) return;
    socket.emit("add", task);
    setTasks((prev) => [...prev, task]);
    setTask("");
  };

  return (
    <div className="main-wrapper">
      <div className="card">
        <h2 className="header">📒 Note App</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="New Note..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button onClick={addTask}>➕ Add</button>
        </div>
        <h4 className="subheader">Notes</h4>
        <ul className="note-list">
          {tasks.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
