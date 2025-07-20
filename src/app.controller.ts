import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de teste para verificar se a aplicação está funcionando.
   * 
   * @returns Mensagem de saudação da aplicação
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
