const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/', auth, taskController.getTasks);
router.post('/', [auth, body('title').notEmpty().withMessage('Title is required')], taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
