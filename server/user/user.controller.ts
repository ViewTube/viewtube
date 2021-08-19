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
  // UseInterceptors,
  UploadedFile,
  Param
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
import sanitizeFilename from 'sanitize-filename';
import { FastifyReply } from 'fastify';
import { ViewTubeRequest } from 'server/common/viewtube-request';
// import { FileInterceptor } from '@nestjs/platform-express';
import { UserprofileDetailsDto } from './dto/userprofile-details.dto';
import { UserService } from './user.service';

// const imageFileFilter = (_, file: any, callback: Function) => {
//   if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
//     return callback(new Error('Only image files are allowed!'), false);
//   }
//   callback(null, true);
// };

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
  async getExport(@Req() request: ViewTubeRequest, @Res() reply: FastifyReply): Promise<void> {
    const dataExport = await this.userService.createDataExport(request.user.username);

    const date = new Date();

    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

    const fileName = `viewtube_export_${sanitizeFilename(request.user.username)}_${dateString}.zip`;
    reply
      .code(200)
      .header('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(dataExport);
  }

  @Get('profile/image/:username')
  async getProfileImage(@Res() reply: FastifyReply, @Param('username') username: string) {
    await this.userService.getProfileImage(username, reply);
  }

  @Post('profile/image')
  // @UseInterceptors(
  //   FileInterceptor('image', { fileFilter: imageFileFilter, limits: { fileSize: 4000000 } })
  // )
  uploadProfileImage(@Req() request: ViewTubeRequest, @UploadedFile() file: any) {
    return this.userService.saveProfileImage(request.user.username, file);
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
