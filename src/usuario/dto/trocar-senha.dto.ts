import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class TrocarSenhaDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    senha: string;
} 