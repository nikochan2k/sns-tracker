import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from 'typeorm';

@Entity('twitter_user')
@Index('ix_twitter_user', (tu: TwitterUser) => [tu.screenName])
export class TwitterUser {
  @PrimaryColumn('bigint')
  public id: number;

  @Column('varchar', { name: 'screen_name' })
  public screenName: string;

  @Column('varchar', { nullable: true })
  public name: string;

  @Column('bigint')
  public maxId: number;
}
