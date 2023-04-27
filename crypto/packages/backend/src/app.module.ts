import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBService } from './db.service';
import { LiveGateway } from './live.gateway';
import { SubmitVoteService } from './submit.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './entities/candidate.entity';
import { Session } from './entities/session.entity';
import { Voter } from './entities/voter.entity';
import { pubkeys } from './entities/pubkeys.entity';
import { HashedId } from './entities/HashedId.entity';
import { Proof, SignatureC, Vote } from './entities/vote.entity';
import { LookupTable } from './entities/lookup.entity';
import { LookUpservice } from './lookup.service';
import { LookUpController } from './lookUp.controller';
import { Limit } from './entities/limit.entity';
import { Token } from './entities/tokens.entity';
import { Trigger } from './entities/trigger.entity';
import { FilteredVotes } from './entities/FilteredVotes.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'sys',
      synchronize: true,
      entities: [
        Session,
        Candidate,
        Vote,
        SignatureC,
        Proof,
        Voter,
        LookupTable,
        pubkeys,
        HashedId,
        Limit,
        Token,
        Trigger,
        FilteredVotes
      ],
    }),
    TypeOrmModule.forFeature([
      Session,
      Candidate,
      Vote,
      SignatureC,
      Proof,
      Voter,
      LookupTable,
      pubkeys,
      HashedId,
      Limit,
      Token,
      Trigger,
      FilteredVotes
    ]),
  ],
  controllers: [AppController, VoteController, LookUpController],
  providers: [
    LiveGateway,
    AppService,
    DBService,
    SubmitVoteService,
    LookUpservice,
  ],
})
export class AppModule {}
