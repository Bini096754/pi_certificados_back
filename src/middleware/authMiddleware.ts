import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_fallback";

interface TokenPayload extends JwtPayload {
  id: string;
  role: "student" | "coordinator";
}

// Interface estendida para garantir o req.user tipado nos controllers
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (roles: ("student" | "coordinator")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token: string | undefined = req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: "Acesso negado. Token não fornecido." });
      return;
    }

    // Tipagem estrita no callback para eliminar o uso de 'any'
    jwt.verify(
      token,
      JWT_SECRET,
      (
        err: VerifyErrors | null,
        decoded: string | JwtPayload | undefined,
      ): void => {
        if (err || !decoded) {
          res.status(401).json({ error: "Sessão expirada ou token inválido." });
          return;
        }

        const payload = decoded as TokenPayload;

        if (!roles.includes(payload.role)) {
          res
            .status(403)
            .json({ error: "Acesso negado. Permissão insuficiente." });
          return;
        }

        req.user = {
          id: payload.id,
          role: payload.role,
        };

        next();
      },
    );
  };
};
