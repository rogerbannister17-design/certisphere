import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

interface BootstrapRequest {
  readonly headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class BootstrapRegistrationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configuredToken = process.env.IDENTITY_BOOTSTRAP_TOKEN;

    if (configuredToken === undefined || configuredToken.length < 32) {
      throw new UnauthorizedException({
        code: 'BOOTSTRAP_AUTHENTICATION_NOT_CONFIGURED',
        message: 'Identity bootstrap authentication is not configured.',
      });
    }

    const request = context.switchToHttp().getRequest<BootstrapRequest>();
    const suppliedToken = request.headers['x-certisphere-setup-token'];

    if (suppliedToken !== configuredToken) {
      throw new UnauthorizedException({
        code: 'BOOTSTRAP_AUTHENTICATION_FAILED',
        message: 'A valid setup token is required.',
      });
    }

    return true;
  }
}
