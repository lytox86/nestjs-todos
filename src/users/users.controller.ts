import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpException,
  HttpStatus,
  HttpCode,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
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
import { LoginService } from './login.service';
import { RefreshDto } from './refresh.dto';

@Controller({ version: '1', path: 'users' })
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly loginService: LoginService,
  ) {}
  private readonly logger = new Logger(UsersController.name);

  @Post('login')
  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' }) // TODO document all endpoints
  async login(@Body() loginDto: LoginDto) {
    const { tokens, user } = await this.loginService.login(loginDto);

    const hashedRefreshToken = await this.authService.hashString(
      tokens.refreshToken,
    );
    await this.usersService.updateUser(user.id, { hashedRefreshToken });

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  @Post('refresh')
  async refreshToken(@Body() refreshDto: RefreshDto) {
    const { userId, refreshToken } = refreshDto;
    const token = await this.loginService.refreshToken(userId, refreshToken);
    return { access_token: token.accessToken };
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@UserId() userId: number) {
    const wasUpdated = await this.usersService.unsetToken(userId);
    if (!wasUpdated) {
      throw new NotFoundException();
    }
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
    const isOldPasswordValid = await this.authService.verifyHash(
      oldPassword,
      user.hashedPassword,
    );
    if (!isOldPasswordValid) {
      throw new HttpException('Old password invalid', HttpStatus.UNAUTHORIZED);
    }

    // Update the password
    const hashedNewPassword = await this.authService.hashString(newPassword);

    await this.usersService.updateUser(userId, {
      hashedPassword: hashedNewPassword,
    });
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
