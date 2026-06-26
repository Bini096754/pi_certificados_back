import { Response } from "express";
import mongoose from "mongoose";
import { Certificate } from "../models/Certificate";
import { AuthRequest } from "../middleware/authMiddleware";

// Interface local que junta a autenticação com o arquivo tratado pelo Multer
interface UploadRequest extends AuthRequest {
  file?: Express.Multer.File;
}

export const uploadCertificate = async (
  req: UploadRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { title, hours } = req.body as { title?: string; hours?: number };
    const file = req.file; // Injetado pelo middleware 'upload.single("file")' nas rotas
    const studentId = req.user?.id;

    if (!studentId)
      return res.status(401).json({ error: "Usuário não autenticado" });
    if (!title || !hours)
      return res
        .status(400)
        .json({ error: "Campos de texto obrigatórios ausentes" });
    if (!file)
      return res
        .status(400)
        .json({ error: "Arquivo não enviado ou formato inválido" });

    const certificateId = new mongoose.Types.ObjectId();
    const fileName = `${Date.now()}-${file.originalname}`;
    const baseUrl =
      process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/api/student/certificates/${certificateId}/file`;

    const certificate = await Certificate.create({
      _id: certificateId,
      title,
      hours,
      studentId,
      fileUrl,
      storagePath: `certificates/${fileName}`,
      fileData: file.buffer, // O arquivo está na memória (Buffer) graças ao memoryStorage
      fileName: file.originalname,
      fileMimetype: file.mimetype,
    });

    return res.status(201).json(certificate.toObject());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar upload" });
  }
};

export const getCertificateFile = async (
  req: AuthRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "ID de certificado inválido" });
    }

    const certificate = await Certificate.findById(id).select("+fileData");

    if (!certificate)
      return res.status(404).json({ error: "Certificado não encontrado" });
    if (
      req.user?.role === "student" &&
      certificate.studentId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Acesso negado a este arquivo" });
    }
    if (!certificate.fileData)
      return res
        .status(404)
        .json({ error: "Dados do arquivo não encontrados" });

    res.setHeader("Content-Type", certificate.fileMimetype);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${certificate.fileName}"`,
    );
    return res.send(certificate.fileData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao recuperar arquivo" });
  }
};
