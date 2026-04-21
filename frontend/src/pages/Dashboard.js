import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: Bearer  } });
    setTasks(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (editing) {
      await axios.put(http://localhost:5000/api/tasks/, { title, description }, { headers: { Authorization: Bearer  } });
      setEditing(null);
    } else {
      await axios.post('http://localhost:5000/api/tasks', { title, description }, { headers: { Authorization: Bearer  } });
    }
    setTitle('');
    setDescription('');
    fetchTasks();
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setEditing(task._id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(http://localhost:5000/api/tasks/, { headers: { Authorization: Bearer  } });
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">{editing ? 'Update' : 'Add'} Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <button onClick={() => handleEdit(task)}>Edit</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
