import {
  Controller,
  Get,
  Param,
  Body,
  UseGuards,
  Delete,
  Put,
  Query,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/authenticated.guard';
import { ResetPasswordDto } from './reset-password.dto';

@Controller({ version: '1', path: 'admin/users' })
@UseGuards(JwtAuthGuard, AdminGuard) // JwtAuthGuard first, it injects user in request
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  async getAllUsers(@Query('page') page: number = 1) {
    const users = await this.adminService.getAllUsers(page || 1);
    return users.map((user) => user.toResponseObject());
  }

  @Get(':id')
  async getUsers(@Param('id') userId: number) {
    const user = await this.adminService.getUserById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return user.toResponseObject();
  }

  @Delete(':id/delete')
  @HttpCode(HttpStatus.ACCEPTED)
  async markUserAsDeleted(@Param('id') userId: number) {
    await this.adminService.markUserAsDeleted(userId);
  }

  @Put(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserPassword(
    @Param('id') userId: number,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const wasUpdated = await this.adminService.changeUserPassword(
      userId,
      resetPasswordDto.newPassword,
    );
    if (!wasUpdated) {
      throw new NotFoundException();
    }
  }
}
