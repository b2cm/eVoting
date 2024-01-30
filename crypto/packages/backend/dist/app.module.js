"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const db_service_1 = require("./db.service");
const live_gateway_1 = require("./live.gateway");
const submit_service_1 = require("./submit.service");
const vote_controller_1 = require("./vote.controller");
const typeorm_1 = require("@nestjs/typeorm");
const candidate_entity_1 = require("./entities/candidate.entity");
const session_entity_1 = require("./entities/session.entity");
const voter_entity_1 = require("./entities/voter.entity");
const pubkeys_entity_1 = require("./entities/pubkeys.entity");
const HashedId_entity_1 = require("./entities/HashedId.entity");
const vote_entity_1 = require("./entities/vote.entity");
const lookup_entity_1 = require("./entities/lookup.entity");
const lookup_service_1 = require("./lookup.service");
const lookUp_controller_1 = require("./lookUp.controller");
const limit_entity_1 = require("./entities/limit.entity");
const tokens_entity_1 = require("./entities/tokens.entity");
const trigger_entity_1 = require("./entities/trigger.entity");
const FilteredVotes_entity_1 = require("./entities/FilteredVotes.entity");
const TokenTrigger_entity_1 = require("./entities/TokenTrigger.entity");
const encryptedTokens_entity_1 = require("./entities/encryptedTokens.entity");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: '1234',
                database: 'sys',
                synchronize: true,
                entities: [
                    session_entity_1.Session,
                    candidate_entity_1.Candidate,
                    vote_entity_1.Vote,
                    vote_entity_1.SignatureC,
                    vote_entity_1.Proof,
                    voter_entity_1.Voter,
                    lookup_entity_1.LookupTable,
                    pubkeys_entity_1.pubkeys,
                    HashedId_entity_1.HashedId,
                    limit_entity_1.Limit,
                    tokens_entity_1.Token,
                    trigger_entity_1.Trigger,
                    FilteredVotes_entity_1.FilteredVotes,
                    TokenTrigger_entity_1.TokenTrigger,
                    encryptedTokens_entity_1.encryptedTokens
                ],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                session_entity_1.Session,
                candidate_entity_1.Candidate,
                vote_entity_1.Vote,
                vote_entity_1.SignatureC,
                vote_entity_1.Proof,
                voter_entity_1.Voter,
                lookup_entity_1.LookupTable,
                pubkeys_entity_1.pubkeys,
                HashedId_entity_1.HashedId,
                limit_entity_1.Limit,
                tokens_entity_1.Token,
                trigger_entity_1.Trigger,
                FilteredVotes_entity_1.FilteredVotes,
                TokenTrigger_entity_1.TokenTrigger,
                encryptedTokens_entity_1.encryptedTokens
            ]),
        ],
        controllers: [app_controller_1.AppController, vote_controller_1.VoteController, lookUp_controller_1.LookUpController],
        providers: [
            live_gateway_1.LiveGateway,
            app_service_1.AppService,
            db_service_1.DBService,
            submit_service_1.SubmitVoteService,
            lookup_service_1.LookUpservice,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map