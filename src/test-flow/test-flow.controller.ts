import { Controller, Get } from '@nestjs/common';
import { TestFlowService, TestFlowResult } from './test-flow.service';

@Controller('test')
export class TestFlowController {
  constructor(private readonly testFlowService: TestFlowService) {}

  @Get('flow')
  async runFlow(): Promise<TestFlowResult> {
    return this.testFlowService.runFullFlow();
  }
}
