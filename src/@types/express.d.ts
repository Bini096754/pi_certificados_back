declare namespace Express {
    export interface Request {
        userId?: string;
        userRole?: 'student' | 'coordinator';
    }
}

export {}