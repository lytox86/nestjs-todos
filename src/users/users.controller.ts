import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpException,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/authenticated.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import { ChangePasswordDto } from './change-password.dto';
import { UserId } from './user.decorator';
import { RegisterDto } from './register.dto';

@Controller({ version: '1', path: 'users' })
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  private readonly logger = new Logger(UsersController.name);

  @Post('login')
  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' }) // TODO document all endpoints
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto; // TODO move logic to service without HTTP exceptions
    const user = await this.usersService.findByUsername(username);
    if (user === null || user.isDeleted) {
      this.logger.debug(
        `no user found ${username}, ${JSON.stringify(loginDto)}`,
      );
      throw new UnauthorizedException('Invalid username or password');
    }

    // Check password validity
    const isPasswordValid = await this.authService.verifyPassword(
      password,
      user.hashedPassword,
    );
    if (!isPasswordValid) {
      this.logger.debug('wrong password');
      throw new UnauthorizedException('Invalid username or password');
    }

    // Issue JWT token
    const accessToken = await this.authService.login(user);
    return {
      access_token: accessToken,
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password } = registerDto;
    // TODO email is not checked yet
    const anotherUser = await this.usersService.findByUsername(username);
    if (anotherUser) {
      throw new HttpException('Username taken', HttpStatus.BAD_REQUEST);
    }
    const user = await this.usersService.createUser(username, password);
    return user.toResponseObject();
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserId() userId: number,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Fetch the current user by ID
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    // Check if the old password is correct
    const isOldPasswordValid = await this.authService.verifyPassword(
      oldPassword,
      user.hashedPassword,
    );
    if (!isOldPasswordValid) {
      throw new HttpException('Old password invalid', HttpStatus.UNAUTHORIZED);
    }

    // Update the password
    const hashedNewPassword = await this.authService.hashPassword(newPassword);

    await this.usersService.updatePassword(userId, hashedNewPassword);
  }

  @Get('who-am-i')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async showMe(@UserId() userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return user.toResponseObject();
  }
}
