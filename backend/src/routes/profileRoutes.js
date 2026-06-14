const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserById, toggleLookingForMatch } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/looking-for-match', toggleLookingForMatch);
router.get('/users/:id', getUserById);

module.exports = router;
