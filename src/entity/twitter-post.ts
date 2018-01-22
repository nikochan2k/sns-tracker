import {
  Column,
  Entity,
  Index,
  PrimaryColumn
  } from 'typeorm';

@Entity('twitter_post')
@Index('ix_twitter_post', (tl: TwitterPost) => [tl.userId])
export class TwitterPost {
  @PrimaryColumn('bigint')
  public id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  public userId: number;

  @Column('bigint')
  public created: number;

  @Column('real')
  public lat: number;

  @Column('real')
  public lng: number;

  @Column('varchar')
  public geohash: string;
}
