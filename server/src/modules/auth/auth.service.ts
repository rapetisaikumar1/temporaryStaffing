import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory store for password reset tokens (production: use Redis or DB table)
  private readonly resetTokens = new Map<string, { email: string; expiresAt: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Contact admin.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.signAccessToken(user.id, user.email, user.role);

    this.logger.log(`User logged in: ${user.email} [${user.role}]`);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
      return;
    }

    // Generate a cryptographically secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    this.resetTokens.set(token, { email: user.email, expiresAt });

    await this.emailService.sendPasswordReset(user.email, token);
    this.logger.log(`Password reset email sent to: ${user.email}`);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = this.resetTokens.get(dto.token);

    if (!record) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > record.expiresAt) {
      this.resetTokens.delete(dto.token);
      throw new BadRequestException('Reset token has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: record.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    this.resetTokens.delete(dto.token);
    this.logger.log(`Password reset successful for: ${user.email}`);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    this.logger.log(`Password changed for user: ${user.email}`);
  }

  private signAccessToken(userId: string, email: string, role: string): string {
    // Module-level secret + expiresIn configured via JwtModule.registerAsync
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
