import { Router } from "express";
import { register, login, logout } from "../controllers/AuthController";
import { getStudentDashboard } from "../controllers/StudentController";
import {
  uploadCertificate,
  getCertificateFile,
} from "../controllers/CertificateController";
import { upload } from "../middleware/upload";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/dashboard", authMiddleware(["student"]), getStudentDashboard);

router.post(
  "/upload",
  authMiddleware(["student"]),
  upload.single("file"),
  uploadCertificate,
);

// --- Rota Segura de Visualização do Ficheiro ---
// Permite que tanto o aluno dono quanto o coordenador que vai avaliar consigam abrir o arquivo binário
router.get(
  "/certificates/:id/file",
  authMiddleware(["student", "coordinator"]),
  getCertificateFile,
);

export default router;
