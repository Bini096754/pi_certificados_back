import { Response } from "express";
import { Certificate } from "../models/Certificate";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

export const getStudentDashboard = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const studentId = req.user?.id;

    if (!studentId) return res.status(401).json({ error: "Não autorizado" });

    const student = await User.findById(studentId);
    if (!student)
      return res.status(404).json({ error: "Aluno não encontrado" });

    const certificates = await Certificate.find({ studentId }).sort({
      createdAt: -1,
    });

    const stats = {
      totalSent: certificates.length,
      approvedCount: certificates.filter((c) => c.status === "approved").length,
      pendingCount: certificates.filter((c) => c.status === "pending").length,
      rejectedCount: certificates.filter((c) => c.status === "rejected").length,
      totalHours: student.totalHours,
    };

    return res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
      stats,
      history: certificates,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao carregar dashboard do aluno" });
  }
};
