import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const adminUser = process.env.VIEWTUBE_ADMIN_USER;

    if (!adminUser) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user.username === adminUser;
  }
}
