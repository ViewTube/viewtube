import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserprofileDetailsDto } from './dto/userprofile-details.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any): Promise<UserprofileDto> {
    return this.userService.getProfile(req.user.username);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile/details')
  getProfileDetails(@Req() req: any): Promise<UserprofileDetailsDto> {
    return this.userService.getProfileDetails(req.user.username);
  }
}
