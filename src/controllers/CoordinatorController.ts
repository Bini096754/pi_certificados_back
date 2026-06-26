import { Response } from "express";
import { Certificate } from "../models/Certificate";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

export const listPendingCertificates = async (
  _req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const pendings = await Certificate.find({ status: "pending" }).populate(
      "studentId",
      "name email",
    );
    return res.json(pendings);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar certificados" });
  }
};

export const evaluateCertificate = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const certificate = await Certificate.findById(id);
    if (!certificate)
      return res.status(404).json({ error: "Certificado não encontrado" });

    if (certificate.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Este certificado já foi avaliado" });
    }

    certificate.status = status as "approved" | "rejected";
    await certificate.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(certificate.studentId, {
        $inc: { totalHours: certificate.hours },
      });
    }

    return res.json({
      message: `Certificado ${status} com sucesso`,
      certificate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar avaliação" });
  }
};
