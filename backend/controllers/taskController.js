const Task = require('../models/Task');
const { validationResult } = require('express-validator');

exports.getTasks = async (req, res) => {
  try {
    const tasks = req.user.role === 'admin' ? await Task.find().populate('user', 'username') : await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description } = req.body;
  try {
    const task = new Task({ title, description, user: req.user.id });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  const { title, description, status } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, { title, description, status }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
