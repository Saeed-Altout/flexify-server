import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  RunDeviceDto,
  SendCommandDto,
  StopDeviceDto,
  ArduinoStatusResponseDto,
  CommandResponseDto,
} from './dto/arduino.dto';

@Injectable()
export class ArduinoService {
  private readonly logger = new Logger(ArduinoService.name);
  private readonly defaultDeviceId = 'Main Arduino'; // We'll get the actual UUID from the database

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Run the Arduino device
   */
  async runDevice(runDeviceDto: RunDeviceDto): Promise<CommandResponseDto> {
    try {
      this.logger.log(
        `Running Arduino device with command: ${runDeviceDto.command}`,
      );

      // Get the default Arduino device
      const device = await this.getDefaultDevice();
      if (!device) {
        throw new NotFoundException('Arduino device not found');
      }

      // Create command record
      const commandData = {
        device_id: device.id,
        command_type: 'on',
        command: runDeviceDto.command,
        status: 'pending',
        time_minutes: null,
      };

      const { data: command, error } = await this.supabaseService.insert(
        'arduino_commands',
        commandData,
      );

      if (error) {
        this.logger.error(`Error creating command: ${error.message}`);
        throw new BadRequestException('Failed to create command');
      }

      // Update device status to online
      await this.updateDeviceStatus(device.id, true, 'online');

      // Simulate command execution (in real implementation, this would communicate with Arduino)
      await this.simulateCommandExecution(command.id, 'completed');

      // Log command in history
      await this.logCommandHistory(
        device.id,
        command.id,
        commandData,
        'completed',
      );

      return this.mapToCommandResponseDto(command);
    } catch (error) {
      this.logger.error(`Error running device: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send command to Arduino device
   */
  async sendCommand(
    sendCommandDto: SendCommandDto,
  ): Promise<CommandResponseDto> {
    try {
      this.logger.log(
        `Sending command to Arduino: ${sendCommandDto.command} for ${sendCommandDto.time} minutes`,
      );

      // Get the default Arduino device
      const device = await this.getDefaultDevice();
      if (!device) {
        throw new NotFoundException('Arduino device not found');
      }

      // Validate time parameter
      if (sendCommandDto.time < 1) {
        throw new BadRequestException('Time must be at least 1 minute');
      }

      // Create command record
      const commandData = {
        device_id: device.id,
        command_type: 'send',
        command: sendCommandDto.command,
        status: 'pending',
        time_minutes: sendCommandDto.time,
      };

      const { data: command, error } = await this.supabaseService.insert(
        'arduino_commands',
        commandData,
      );

      if (error) {
        this.logger.error(`Error creating command: ${error.message}`);
        throw new BadRequestException('Failed to create command');
      }

      // Simulate command execution with timeout
      await this.simulateTimedCommandExecution(command.id, sendCommandDto.time);

      // Log command in history
      await this.logCommandHistory(
        device.id,
        command.id,
        commandData,
        'completed',
      );

      return this.mapToCommandResponseDto(command);
    } catch (error) {
      this.logger.error(`Error sending command: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop the Arduino device
   */
  async stopDevice(stopDeviceDto: StopDeviceDto): Promise<CommandResponseDto> {
    try {
      this.logger.log(
        `Stopping Arduino device with command: ${stopDeviceDto.command}`,
      );

      // Get the default Arduino device
      const device = await this.getDefaultDevice();
      if (!device) {
        throw new NotFoundException('Arduino device not found');
      }

      // Create command record
      const commandData = {
        device_id: device.id,
        command_type: 'off',
        command: stopDeviceDto.command,
        status: 'pending',
        time_minutes: null,
      };

      const { data: command, error } = await this.supabaseService.insert(
        'arduino_commands',
        commandData,
      );

      if (error) {
        this.logger.error(`Error creating command: ${error.message}`);
        throw new BadRequestException('Failed to create command');
      }

      // Update device status to offline
      await this.updateDeviceStatus(device.id, false, 'offline');

      // Simulate command execution
      await this.simulateCommandExecution(command.id, 'completed');

      // Log command in history
      await this.logCommandHistory(
        device.id,
        command.id,
        commandData,
        'completed',
      );

      return this.mapToCommandResponseDto(command);
    } catch (error) {
      this.logger.error(`Error stopping device: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Arduino device status
   */
  async getDeviceStatus(): Promise<ArduinoStatusResponseDto> {
    try {
      this.logger.log('Getting Arduino device status');

      const device = await this.getDefaultDevice();
      if (!device) {
        throw new NotFoundException('Arduino device not found');
      }

      return this.mapToStatusResponseDto(device);
    } catch (error) {
      this.logger.error(`Error getting device status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if Arduino is connected
   */
  async isArduinoConnected(): Promise<{ connected: boolean; status: string }> {
    try {
      const device = await this.getDefaultDevice();
      if (!device) {
        return { connected: false, status: 'Device not found' };
      }

      return {
        connected: device.is_connected,
        status: device.status,
      };
    } catch (error) {
      this.logger.error(`Error checking Arduino connection: ${error.message}`);
      return { connected: false, status: 'Error checking status' };
    }
  }

  /**
   * Get command history for the device
   */
  async getCommandHistory(limit: number = 10): Promise<CommandResponseDto[]> {
    try {
      const device = await this.getDefaultDevice();
      if (!device) {
        throw new NotFoundException('Arduino device not found');
      }

      const { data: commands, error } = await this.supabaseService.select(
        'arduino_commands',
        {
          eq: { device_id: device.id },
          order: { column: 'created_at', options: { ascending: false } },
        },
      );

      if (error) {
        this.logger.error(`Error fetching command history: ${error.message}`);
        throw new BadRequestException('Failed to fetch command history');
      }

      return commands
        .slice(0, limit)
        .map((cmd) => this.mapToCommandResponseDto(cmd));
    } catch (error) {
      this.logger.error(`Error getting command history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update device connection status (for Arduino heartbeat)
   */
  async updateConnectionStatus(isConnected: boolean): Promise<void> {
    try {
      const device = await this.getDefaultDevice();
      if (!device) {
        this.logger.warn('No Arduino device found to update connection status');
        return;
      }

      const status = isConnected ? 'online' : 'offline';
      await this.updateDeviceStatus(device.id, isConnected, status);

      this.logger.log(`Updated Arduino connection status: ${status}`);
    } catch (error) {
      this.logger.error(`Error updating connection status: ${error.message}`);
    }
  }

  // Private helper methods

  private async getDefaultDevice(): Promise<any> {
    try {
      const { data: devices, error } = await this.supabaseService.select(
        'arduino_devices',
        { eq: { device_name: 'Main Arduino' } },
      );

      if (error || !devices || devices.length === 0) {
        return null;
      }

      return devices[0];
    } catch (error) {
      this.logger.error(`Error getting default device: ${error.message}`);
      return null;
    }
  }

  private async updateDeviceStatus(
    deviceId: string,
    isConnected: boolean,
    status: string,
  ): Promise<void> {
    try {
      const updateData = {
        is_connected: isConnected,
        status: status,
        last_seen: new Date().toISOString(),
      };

      const { error } = await this.supabaseService.update(
        'arduino_devices',
        updateData,
        { id: deviceId },
      );

      if (error) {
        this.logger.error(`Error updating device status: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error updating device status: ${error.message}`);
    }
  }

  private async simulateCommandExecution(
    commandId: string,
    status: string,
  ): Promise<void> {
    try {
      const updateData = {
        status: status,
        executed_at: new Date().toISOString(),
      };

      await this.supabaseService.update('arduino_commands', updateData, {
        id: commandId,
      });
    } catch (error) {
      this.logger.error(`Error simulating command execution: ${error.message}`);
    }
  }

  private async simulateTimedCommandExecution(
    commandId: string,
    timeMinutes: number,
  ): Promise<void> {
    try {
      // Simulate command execution with timeout
      setTimeout(
        async () => {
          await this.simulateCommandExecution(commandId, 'completed');
        },
        timeMinutes * 60 * 1000,
      ); // Convert minutes to milliseconds

      // Mark as executing immediately
      await this.simulateCommandExecution(commandId, 'executing');
    } catch (error) {
      this.logger.error(
        `Error simulating timed command execution: ${error.message}`,
      );
    }
  }

  private async logCommandHistory(
    deviceId: string,
    commandId: string,
    commandData: any,
    status: string,
  ): Promise<void> {
    try {
      const historyData = {
        device_id: deviceId,
        command_id: commandId,
        command_type: commandData.command_type,
        command: commandData.command,
        time_minutes: commandData.time_minutes,
        status: status,
        executed_at: new Date().toISOString(),
        response_message: `Command ${commandData.command} executed successfully`,
      };

      await this.supabaseService.insert('arduino_command_history', historyData);
    } catch (error) {
      this.logger.error(`Error logging command history: ${error.message}`);
    }
  }

  private mapToCommandResponseDto(command: any): CommandResponseDto {
    return {
      id: command.id,
      device_id: command.device_id,
      command_type: command.command_type,
      command: command.command,
      time_minutes: command.time_minutes,
      status: command.status,
      executed_at: command.executed_at,
      created_at: command.created_at,
      updated_at: command.updated_at,
    };
  }

  private mapToStatusResponseDto(device: any): ArduinoStatusResponseDto {
    return {
      id: device.id,
      device_name: device.device_name,
      device_type: device.device_type,
      is_connected: device.is_connected,
      last_seen: device.last_seen,
      status: device.status,
      created_at: device.created_at,
      updated_at: device.updated_at,
    };
  }
}
