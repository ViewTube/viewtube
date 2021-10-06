import {
  Controller,
  UseGuards,
  Get,
  Req,
  Res,
  Delete,
  Body,
  BadRequestException,
  Post,
  Param,
  StreamableFile,
  Header
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
import { FastifyReply } from 'fastify';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { UserprofileDetailsDto } from './dto/userprofile-details.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Req() request: ViewTubeRequest): Promise<UserprofileDto> {
    return this.userService.getProfile(request.user.username);
  }

  @Get('profile/details')
  getProfileDetails(@Req() request: ViewTubeRequest): Promise<UserprofileDetailsDto> {
    return this.userService.getProfileDetails(request.user.username);
  }

  @Get('export')
  @Header(
    'Content-Disposition',
    `attachment; filename="viewtube_export__${UserService.getDateString()}.zip"`
  )
  async getExport(@Req() request: ViewTubeRequest): Promise<StreamableFile> {
    const dataExport = await this.userService.createDataExport(request.user.username);

    return new StreamableFile(dataExport);
  }

  @Get('profile/image/:username')
  async getProfileImage(@Res() reply: FastifyReply, @Param('username') username: string) {
    await this.userService.getProfileImage(username, reply);
  }

  @Post('profile/image')
  uploadProfileImage(@Req() request: ViewTubeRequest) {
    return this.userService.saveProfileImage(request);
  }

  @Delete('profile/image')
  async deleteProfileImage(@Req() request: ViewTubeRequest) {
    await this.userService.deleteProfileImage(request.user.username);
  }

  @Delete()
  deleteUser(
    @Req() request: ViewTubeRequest,
    @Body('username') username: string
  ): Promise<{ subscriptions: boolean; history: boolean; settings: boolean; user: boolean }> {
    const authenticatedUser = request.user.username;
    if (authenticatedUser === username) {
      return this.userService.deleteUserAndData(authenticatedUser);
    } else {
      throw new BadRequestException("username doesn't match");
    }
  }
}
