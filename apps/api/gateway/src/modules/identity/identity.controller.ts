import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  type AuthenticatedSession,
  InvitationService,
  LoginService,
  RefreshSessionService,
  RegisterOrganisationService,
} from '@certisphere/identity';

import { AuthenticationGuard } from '../auth/authentication.guard.js';
import { type AuthenticatedRequest } from '../auth/authenticated-principal.js';
import { AuthorisationGuard } from '../auth/authorisation.guard.js';
import { OrganisationAccessGuard } from '../auth/organisation-access.guard.js';
import { RequiredPermissions } from '../auth/required-permissions.decorator.js';
import { BootstrapRegistrationGuard } from './bootstrap-registration.guard.js';
import {
  CreateInvitationRequestDto,
  InvitationResponseDto,
  LoginRequestDto,
  RefreshSessionRequestDto,
  RegisteredOrganisationResponseDto,
  RegisterOrganisationRequestDto,
  SessionResponseDto,
} from './dto.js';

@ApiTags('Identity')
@Controller({ path: 'identity', version: '1' })
export class IdentityController {
  constructor(
    private readonly registerOrganisation: RegisterOrganisationService,
    private readonly login: LoginService,
    private readonly refreshSession: RefreshSessionService,
    private readonly invitations: InvitationService,
  ) {}

  @Post('organisations/register')
  @UseGuards(BootstrapRegistrationGuard)
  @ApiHeader({ name: 'x-certisphere-setup-token', required: true })
  @ApiOperation({ summary: 'Register the first organisation owner' })
  @ApiCreatedResponse({ type: RegisteredOrganisationResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Bootstrap registration token is missing or invalid.' })
  async register(
    @Body() body: RegisterOrganisationRequestDto,
  ): Promise<RegisteredOrganisationResponseDto> {
    const user = await this.registerOrganisation.execute(body);

    return {
      organisationId: user.organisationId,
      userId: user.id,
      email: user.email,
    };
  }

  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with organisation credentials' })
  @ApiOkResponse({ type: SessionResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Credentials are invalid.' })
  @ApiForbiddenResponse({ description: 'User account is inactive.' })
  async createSession(
    @Body() body: LoginRequestDto,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
  ): Promise<SessionResponseDto> {
    return toSessionResponse(
      await this.login.execute({
        organisationSlug: body.organisationSlug,
        email: body.email,
        password: body.password,
        ...(forwardedFor === undefined ? {} : { ipAddress: forwardedFor }),
        ...(userAgent === undefined ? {} : { userAgent }),
      }),
    );
  }

  @Post('sessions/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a refresh token and issue a new access token' })
  @ApiOkResponse({ type: SessionResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token is invalid, expired, or revoked.' })
  async refresh(@Body() body: RefreshSessionRequestDto): Promise<SessionResponseDto> {
    return toSessionResponse(await this.refreshSession.execute(body));
  }

  @Post('invitations')
  @UseGuards(AuthenticationGuard, AuthorisationGuard, OrganisationAccessGuard)
  @RequiredPermissions('identity.invitations.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an organisation invitation' })
  @ApiCreatedResponse({ type: InvitationResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Bearer token is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Permission or organisation access check failed.' })
  async createInvitation(
    @Body() body: CreateInvitationRequestDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InvitationResponseDto> {
    const actorUserId = request.principal?.subject;

    if (actorUserId === undefined) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_FAILED',
        message: 'Valid bearer authentication is required.',
      });
    }

    const created = await this.invitations.create({
      organisationId: body.organisationId,
      email: body.email,
      roleKey: body.roleKey,
      actorUserId,
    });

    return {
      invitationId: created.invitation.id,
      organisationId: created.invitation.organisationId,
      email: created.invitation.email,
      roleKey: created.invitation.roleKey,
      expiresAt: created.invitation.expiresAt.toISOString(),
      oneTimeToken: created.oneTimeToken,
    };
  }
}

function toSessionResponse(session: AuthenticatedSession): SessionResponseDto {
  return {
    organisationId: session.organisationId,
    userId: session.userId,
    sessionId: session.sessionId,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt.toISOString(),
    permissions: session.permissions,
  };
}
