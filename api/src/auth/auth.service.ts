import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string) {
    // Email veya username ile login yapabilir
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
      include: {
        consultant: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Geçersiz kullanıcı adı/e-posta veya şifre');
    }

    const payload = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        photoUrl: user.photoUrl,
        phone: user.phone,
        whatsapp: user.whatsapp,
        title: user.title,
        consultantId: user.consultant?.id || null,
        branchId: user.consultant?.branchId || null,
        branchName: user.consultant?.branch?.name || null,
      },
    };
  }

  // Rol bazlı yetki kontrolleri
  isAdmin(role: string): boolean {
    return role === 'ADMIN';
  }

  isManager(role: string): boolean {
    return ['ADMIN', 'BROKER', 'FIRM_OWNER', 'REAL_ESTATE_EXPERT'].includes(role);
  }

  isConsultant(role: string): boolean {
    return ['CONSULTANT', 'BRANCH_MANAGER'].includes(role);
  }

  // Kullanıcının tüm ilanları görebilip göremeyeceği
  canViewAllListings(role: string): boolean {
    return this.isAdmin(role) || this.isManager(role);
  }
}
