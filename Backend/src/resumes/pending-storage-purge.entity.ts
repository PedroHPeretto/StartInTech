import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('pending_storage_purges')
export class PendingStoragePurge {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
