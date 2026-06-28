import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  type LoginInput,
  type RegisterInput,
  type UpdateProfileInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Public } from '../../common/public.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body(new ZodValidationPipe(registerSchema)) input: RegisterInput) {
    return this.auth.register(input);
  }

  @Public()
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) input: LoginInput) {
    return this.auth.login(input);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId);
  }

  @ApiBearerAuth()
  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) input: UpdateProfileInput,
  ) {
    return this.auth.updateProfile(userId, input);
  }
}
