import { Router } from "express";
import {
  listPendingCertificates,
  evaluateCertificate,
} from "../controllers/CoordinatorController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware(["coordinator"]));

router.get("/certificates/pending", listPendingCertificates);

router.patch("/certificates/:id/evaluate", evaluateCertificate);

export default router;
