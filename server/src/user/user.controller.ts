import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { Private } from 'server/auth/decorators/private.decorator';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
import { SessionDto } from './dto/session.dto';
import { UserprofileDetailsDto } from './dto/userprofile-details.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Private()
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

  @Get('sessions')
  getSessions(@Req() request: ViewTubeRequest): Promise<Array<SessionDto>> {
    return this.userService.getSessions(request);
  }

  @Get('sessions/current')
  getCurrentSession(@Req() request: ViewTubeRequest): Promise<SessionDto> {
    return this.userService.getCurrentSession(request);
  }

  @Put('sessions/:id')
  updateSession(
    @Req() request: ViewTubeRequest,
    @Param('id') id: string,
    @Body('deviceName') deviceName: string,
    @Body('deviceType') deviceType: string
  ) {
    return this.userService.renameSession(request, id, deviceName, deviceType);
  }

  @Delete('sessions/:id')
  deleteSession(@Req() request: ViewTubeRequest, @Param('id') id: string) {
    return this.userService.deleteSession(request, id);
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

  @Post('profile/password')
  @HttpCode(201)
  async changePassword(
    @Req() request: ViewTubeRequest,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string
  ): Promise<void> {
    await this.userService.changePassword(request.user.username, oldPassword, newPassword);
  }
}
