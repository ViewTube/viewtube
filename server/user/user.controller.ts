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
  UseInterceptors,
  UploadedFile,
  Param,
  Request
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserprofileDto } from 'server/user/dto/userprofile.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import sanitizeFilename from 'sanitize-filename';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileInterceptor } from '@nestjs/platform-express';
import { UserprofileDetailsDto } from './dto/userprofile-details.dto';
import { UserService } from './user.service';

const imageFileFilter = (_, file: any, callback: Function) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req: any): Promise<UserprofileDto> {
    return this.userService.getProfile(req.user.username);
  }

  @Get('profile/details')
  getProfileDetails(@Req() req: any): Promise<UserprofileDetailsDto> {
    return this.userService.getProfileDetails(req.user.username);
  }

  @Get('export')
  async getExport(@Req() req: any, @Res() res: any): Promise<void> {
    const dataExport = await this.userService.createDataExport(req.user.username);

    const date = new Date();

    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

    const fileName = `viewtube_export_${sanitizeFilename(req.user.username)}_${dateString}.json`;
    res.status(200).attachment(fileName).send(dataExport);
  }

  @Get('profile/image/:username')
  async getProfileImage(@Request() req: any, @Param('username') username: string) {
    await this.userService.getProfileImage(username, req);
  }

  @Post('profile/image')
  @UseInterceptors(
    FileInterceptor('image', { fileFilter: imageFileFilter, limits: { fileSize: 4000000 } })
  )
  uploadProfileImage(@Req() req: any, @UploadedFile() file: any) {
    return this.userService.saveProfileImage(req.user.username, file);
  }

  @Delete('profile/image')
  async deleteProfileImage(@Req() req: any) {
    await this.userService.deleteProfileImage(req.user.username);
  }

  @Delete()
  deleteUser(
    @Req() req: any,
    @Body('username') username: string
  ): Promise<{ subscriptions: boolean; history: boolean; settings: boolean; user: boolean }> {
    const authenticatedUser = req.user.username;
    if (authenticatedUser === username) {
      return this.userService.deleteUserAndData(authenticatedUser);
    } else {
      throw new BadRequestException("username doesn't match");
    }
  }
}
