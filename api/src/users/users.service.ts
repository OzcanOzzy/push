import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Danışman rolleri
  private consultantRoles: Role[] = [Role.CONSULTANT, Role.BRANCH_MANAGER];
  
  // Yönetici rolleri
  private managerRoles: Role[] = [Role.MANAGER, Role.BROKER, Role.FIRM_OWNER, Role.REAL_ESTATE_EXPERT];

  async findAll(role?: string) {
    const where: any = {};
    
    if (role === 'consultants') {
      where.role = { in: this.consultantRoles };
    } else if (role === 'managers') {
      where.role = { in: this.managerRoles };
    } else if (role) {
      where.role = role as Role;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        photoUrl: true,
        phone: true,
        whatsapp: true,
        title: true,
        createdAt: true,
        consultant: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        photoUrl: true,
        phone: true,
        whatsapp: true,
        title: true,
        createdAt: true,
        consultant: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    // Email kontrolü
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    // Username kontrolü
    if (dto.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Bu kullanıcı adı zaten kullanılıyor');
      }
    }

    // Şifre hash'le
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Kullanıcı oluştur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        name: dto.name,
        role: dto.role as Role,
        photoUrl: dto.photoUrl,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        title: dto.title,
        isActive: dto.isActive ?? true,
      },
    });

    // Danışman rolü ise Consultant kaydı oluştur
    if (this.consultantRoles.includes(dto.role as Role) && dto.branchId) {
      await this.prisma.consultant.create({
        data: {
          userId: user.id,
          branchId: dto.branchId,
          photoUrl: dto.photoUrl,
          title: dto.title,
          whatsappNumber: dto.whatsapp,
          contactPhone: dto.phone,
        },
      });
    }

    return this.findOne(user.id);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Email kontrolü
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    // Username kontrolü
    if (dto.username && dto.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Bu kullanıcı adı zaten kullanılıyor');
      }
    }

    // Güncelleme verileri
    const updateData: any = {
      email: dto.email,
      username: dto.username,
      name: dto.name,
      role: dto.role as Role,
      photoUrl: dto.photoUrl,
      phone: dto.phone,
      whatsapp: dto.whatsapp,
      title: dto.title,
      isActive: dto.isActive,
    };

    // Şifre değişikliği varsa
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Undefined değerleri temizle
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Consultant kaydını güncelle
    const consultant = await this.prisma.consultant.findUnique({
      where: { userId: id },
    });

    if (consultant) {
      await this.prisma.consultant.update({
        where: { userId: id },
        data: {
          photoUrl: dto.photoUrl,
          title: dto.title,
          whatsappNumber: dto.whatsapp,
          contactPhone: dto.phone,
          branchId: dto.branchId,
        },
      });
    } else if (dto.branchId && this.consultantRoles.includes(dto.role as Role)) {
      // Yeni danışman rolü atandıysa Consultant kaydı oluştur
      await this.prisma.consultant.create({
        data: {
          userId: id,
          branchId: dto.branchId,
          photoUrl: dto.photoUrl,
          title: dto.title,
          whatsappNumber: dto.whatsapp,
          contactPhone: dto.phone,
        },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Admin silinmesini engelle
    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Son admin kullanıcısı silinemez');
      }
    }

    // Önce consultant kaydını sil
    await this.prisma.consultant.deleteMany({
      where: { userId: id },
    });

    // Kullanıcıyı sil
    await this.prisma.user.delete({ where: { id } });

    return { success: true };
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return this.findOne(id);
  }

  async changePassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { success: true };
  }

  // Rol yardımcı fonksiyonları
  getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      ADMIN: 'Admin',
      MANAGER: 'Yönetici',
      BROKER: 'Broker',
      FIRM_OWNER: 'Firma Sahibi',
      REAL_ESTATE_EXPERT: 'Emlak Uzmanı',
      BRANCH_MANAGER: 'Şube Müdürü',
      CONSULTANT: 'Danışman',
    };
    return labels[role] || role;
  }

  getRoleCategory(role: Role): 'admin' | 'manager' | 'consultant' {
    if (role === 'ADMIN') return 'admin';
    if (this.managerRoles.includes(role)) return 'manager';
    return 'consultant';
  }
}
