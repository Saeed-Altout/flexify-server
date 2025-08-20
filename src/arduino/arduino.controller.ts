import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ArduinoService } from './arduino.service';
import {
  RunDeviceDto,
  SendCommandDto,
  StopDeviceDto,
  ArduinoStatusResponseDto,
  CommandResponseDto,
} from './dto/arduino.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Arduino Control')
@Controller('arduino')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ArduinoController {
  constructor(private readonly arduinoService: ArduinoService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run Arduino device',
    description: 'Turns on the Arduino device and sets it to online status',
  })
  @ApiResponse({
    status: 200,
    description: 'Device started successfully',
    type: CommandResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid command',
  })
  @ApiResponse({
    status: 404,
    description: 'Arduino device not found',
  })
  async runDevice(
    @Body() runDeviceDto: RunDeviceDto,
  ): Promise<CommandResponseDto> {
    return this.arduinoService.runDevice(runDeviceDto);
  }

  @Post('send-command')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send command to Arduino',
    description:
      'Sends a specific command to the Arduino device with optional timing',
  })
  @ApiResponse({
    status: 200,
    description: 'Command sent successfully',
    type: CommandResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid command or time',
  })
  @ApiResponse({
    status: 404,
    description: 'Arduino device not found',
  })
  async sendCommand(
    @Body() sendCommandDto: SendCommandDto,
  ): Promise<CommandResponseDto> {
    return this.arduinoService.sendCommand(sendCommandDto);
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop Arduino device',
    description: 'Turns off the Arduino device and sets it to offline status',
  })
  @ApiResponse({
    status: 200,
    description: 'Device stopped successfully',
    type: CommandResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid command',
  })
  @ApiResponse({
    status: 404,
    description: 'Arduino device not found',
  })
  async stopDevice(
    @Body() stopDeviceDto: StopDeviceDto,
  ): Promise<CommandResponseDto> {
    return this.arduinoService.stopDevice(stopDeviceDto);
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Arduino device status',
    description:
      'Retrieves the current status and connection information of the Arduino device',
  })
  @ApiResponse({
    status: 200,
    description: 'Device status retrieved successfully',
    type: ArduinoStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Arduino device not found',
  })
  async getDeviceStatus(): Promise<ArduinoStatusResponseDto> {
    return this.arduinoService.getDeviceStatus();
  }

  @Get('connected')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check Arduino connection',
    description: 'Quick check to see if the Arduino device is connected',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        connected: { type: 'boolean' },
        status: { type: 'string' },
      },
    },
  })
  async isArduinoConnected(): Promise<{ connected: boolean; status: string }> {
    return this.arduinoService.isArduinoConnected();
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get command history',
    description: 'Retrieves the command history for the Arduino device',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of commands to retrieve (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Command history retrieved successfully',
    type: [CommandResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Arduino device not found',
  })
  async getCommandHistory(
    @Query('limit') limit: number = 10,
  ): Promise<CommandResponseDto[]> {
    return this.arduinoService.getCommandHistory(limit);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update connection status',
    description:
      'Updates the Arduino device connection status (used for heartbeat monitoring)',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Connection status updated successfully',
  })
  @UseGuards(AdminGuard) // Only admins can update connection status
  async updateConnectionStatus(
    @Body() body: { connected: boolean },
  ): Promise<{ message: string }> {
    await this.arduinoService.updateConnectionStatus(body.connected);
    return {
      message: `Connection status updated to ${body.connected ? 'connected' : 'disconnected'}`,
    };
  }
}
