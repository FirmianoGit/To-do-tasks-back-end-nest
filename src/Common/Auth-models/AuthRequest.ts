import { Request } from 'express';
import { Usuarios } from 'src/entities/Usuarios';

export interface AuthRequest extends Request {
  user: Usuarios;
}
