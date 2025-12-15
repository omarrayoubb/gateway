import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSync } from '../users/users-sync.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserSync)
    private userSyncRepository: Repository<UserSync>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    // Validate that user exists in CRM database
    const user = await this.userSyncRepository.findOne({
      where: { id: payload.sub },
      relations: ['role', 'profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found in CRM system');
    }

    // Return user with role and profile for authorization checks
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      workId: user.workId,
      roleId: user.roleId,
      role: user.role,
      profileId: user.profileId,
      profile: user.profile,
    };
  }
}
