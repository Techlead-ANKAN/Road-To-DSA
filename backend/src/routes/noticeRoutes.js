import express from 'express';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  markNoticeDone,
} from '../controllers/noticeController.js';

const router = express.Router();

// RESTful routes
router.get('/:userId', getNotices);
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

// Custom route for marking notice as done
router.patch('/:id/done', markNoticeDone);

export default router;
