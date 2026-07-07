import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Operational health status of the API gateway.',
  })
  readonly status!: 'ok';

  @ApiProperty({
    example: '2026-07-07T14:00:00.000Z',
    description: 'Server-side UTC timestamp for the health evaluation.',
  })
  readonly checkedAt!: string;

  @ApiProperty({
    example: '0.1.0',
    description: 'Application version reported by the API gateway.',
  })
  readonly version!: string;
}
