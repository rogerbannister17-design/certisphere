export interface Organisation {
  readonly id: string;
  readonly organisationId: string;
  readonly name: string;
  readonly slug: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly version: number;
}
