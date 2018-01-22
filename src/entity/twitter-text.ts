import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('twitter_text')
export class TwitterText {
  @PrimaryColumn('bigint')
  public id: number;

  @Column('text')
  public content: string;
}
