import { Router } from 'express';
import { submitResults, getResults } from '../controllers/resultController';

const router = Router();

router.post('/tournaments/:id/results', submitResults);
router.get('/tournaments/:id/results', getResults);

export default router;
