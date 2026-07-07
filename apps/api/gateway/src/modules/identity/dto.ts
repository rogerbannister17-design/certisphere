import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, Length, Matches } from 'class-validator';

export class RegisterOrganisationRequestDto {
  @ApiProperty({ example: 'Acme Quality Ltd' })
  @IsString()
  @IsNotEmpty()
  readonly organisationName!: string;

  @ApiProperty({ example: 'acme-quality' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  readonly organisationSlug!: string;

  @ApiProperty({ example: 'Ava Owner' })
  @IsString()
  @IsNotEmpty()
  readonly userName!: string;

  @ApiProperty({ example: 'ava.owner@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @Length(12, 256)
  readonly password!: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'acme-quality' })
  @IsString()
  @IsNotEmpty()
  readonly organisationSlug!: string;

  @ApiProperty({ example: 'ava.owner@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}

export class RefreshSessionRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly refreshToken!: string;
}

export class CreateInvitationRequestDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  readonly organisationId!: string;

  @ApiProperty({ example: 'new.user@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ example: 'organisation.member' })
  @IsString()
  @IsNotEmpty()
  readonly roleKey!: string;
}

export class SessionResponseDto {
  @ApiProperty()
  readonly organisationId!: string;

  @ApiProperty()
  readonly userId!: string;

  @ApiProperty()
  readonly sessionId!: string;

  @ApiProperty()
  readonly accessToken!: string;

  @ApiProperty()
  readonly refreshToken!: string;

  @ApiProperty()
  readonly expiresAt!: string;

  @ApiProperty({ type: [String] })
  readonly permissions!: readonly string[];
}

export class RegisteredOrganisationResponseDto {
  @ApiProperty()
  readonly organisationId!: string;

  @ApiProperty()
  readonly userId!: string;

  @ApiProperty()
  readonly email!: string;
}

export class InvitationResponseDto {
  @ApiProperty()
  readonly invitationId!: string;

  @ApiProperty()
  readonly organisationId!: string;

  @ApiProperty()
  readonly email!: string;

  @ApiProperty()
  readonly roleKey!: string;

  @ApiProperty()
  readonly expiresAt!: string;

  @ApiProperty({ description: 'One-time token to deliver through the notification channel.' })
  readonly oneTimeToken!: string;
}
