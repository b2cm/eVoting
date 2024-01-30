"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBService = void 0;
const common_1 = require("@nestjs/common");
const bigint_buffer_1 = require("bigint-buffer");
const typeorm_1 = require("typeorm");
const session_entity_1 = require("./entities/session.entity");
const typeorm_2 = require("@nestjs/typeorm");
const candidate_entity_1 = require("./entities/candidate.entity");
const voter_entity_1 = require("./entities/voter.entity");
const pubkeys_entity_1 = require("./entities/pubkeys.entity");
const HashedId_entity_1 = require("./entities/HashedId.entity");
const vote_entity_1 = require("./entities/vote.entity");
const BigInteger = require("big-integer");
const trigger_entity_1 = require("./entities/trigger.entity");
const tokens_entity_1 = require("./entities/tokens.entity");
const limit_entity_1 = require("./entities/limit.entity");
const FilteredVotes_entity_1 = require("./entities/FilteredVotes.entity");
const TokenTrigger_entity_1 = require("./entities/TokenTrigger.entity");
const encryptedTokens_entity_1 = require("./entities/encryptedTokens.entity");
let DBService = class DBService {
    constructor(sessionRep, candRep, voterRep, voteRep, pubkeysRep, hashedIdRep, triggerRep, tokenTriggerRep, tokensRep, limitRep, encryptedTokensRep, filteredVotesRep, connection) {
        this.sessionRep = sessionRep;
        this.candRep = candRep;
        this.voterRep = voterRep;
        this.voteRep = voteRep;
        this.pubkeysRep = pubkeysRep;
        this.hashedIdRep = hashedIdRep;
        this.triggerRep = triggerRep;
        this.tokenTriggerRep = tokenTriggerRep;
        this.tokensRep = tokensRep;
        this.limitRep = limitRep;
        this.encryptedTokensRep = encryptedTokensRep;
        this.filteredVotesRep = filteredVotesRep;
        this.connection = connection;
    }
    async addSession(id, pubKey, candidates) {
        const sesEntity = new session_entity_1.Session();
        sesEntity.id = id;
        sesEntity.pubKey = (0, bigint_buffer_1.toBufferBE)(pubKey, 64);
        await this.sessionRep.insert(sesEntity);
        const candidateEntities = candidates.map((c) => {
            const ent = new candidate_entity_1.Candidate();
            ent.message = (0, bigint_buffer_1.toBufferBE)(c.message, 64);
            ent.name = c.name;
            ent.session = sesEntity;
            return ent;
        });
        await this.candRep.insert(candidateEntities);
    }
    async getSessionDetails(sessionId) {
        const session = await this.sessionRep.findOne(sessionId, {
            relations: ['candidates'],
        });
        if (!session) {
            throw new Error('Session Not created');
        }
        return {
            pubKey: (0, bigint_buffer_1.toBigIntBE)(session.pubKey),
            candidates: session.candidates.map((c) => ({
                title: c.name,
                message: (0, bigint_buffer_1.toBigIntBE)(c.message),
            })),
        };
    }
    async getGroups() {
        const voters = await this.voterRep.find();
        let groups = {};
        for (const voter of voters) {
            const id = voter.groupId;
            if (!groups[id]) {
                groups[id] = [];
            }
            groups[id].push([voter.id, (0, bigint_buffer_1.toBigIntBE)(voter.pubKey)]);
        }
        for (const id in groups) {
            groups[id] = groups[id]
                .sort(([idx1], [idx2]) => idx1 - idx2)
                .map(([_, key]) => key);
        }
        return groups;
    }
    getVoter(pubKey) {
        return this.voterRep.findOne({
            pubKey: (0, bigint_buffer_1.toBufferBE)(pubKey, 1024),
        });
    }
    getVoterHash(pubKey) {
        return this.hashedIdRep.findOne({
            where: { PubKey: (0, bigint_buffer_1.toBufferBE)(pubKey, 1024) },
        });
    }
    getTokens(hashedId) {
        return this.tokensRep.find({
            where: { HashedId: hashedId },
        });
    }
    async saveVoter(voter) {
        await this.voterRep.update({
            pubKey: voter.pubKey,
        }, voter);
    }
    async addVoter(key, groupId, Vid, counter) {
        const voter = new voter_entity_1.Voter();
        voter.groupId = groupId;
        voter.pubKey = (0, bigint_buffer_1.toBufferBE)(key, 1024);
        voter.counter = (0, bigint_buffer_1.toBufferBE)(counter, 1024);
        voter.voterID = (0, bigint_buffer_1.toBufferBE)(Vid, 1024);
        await this.voterRep.insert(voter);
    }
    async addVote(sessionId, vote, signature, groupId, proof, token) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const voteEnt = new vote_entity_1.Vote();
            voteEnt.sessionId = sessionId;
            voteEnt.vote = (0, bigint_buffer_1.toBufferBE)(vote, 1024);
            voteEnt.y0 = (0, bigint_buffer_1.toBufferBE)(signature.y0.value, 1024);
            voteEnt.s = (0, bigint_buffer_1.toBufferBE)(signature.s.value, 1024);
            voteEnt.groupId = groupId;
            voteEnt.token = Buffer.from(token);
            await queryRunner.manager.insert(vote_entity_1.Vote, voteEnt);
            const cEnts = signature.c.map((c) => {
                const cEnt = new vote_entity_1.SignatureC();
                cEnt.c = (0, bigint_buffer_1.toBufferBE)(c.value, 1024);
                cEnt.vote = voteEnt;
                return cEnt;
            });
            await queryRunner.manager.insert(vote_entity_1.SignatureC, cEnts);
            const proofs = proof.flat().map((p, ind) => {
                const pEnt = new vote_entity_1.Proof();
                pEnt.p = (0, bigint_buffer_1.toBufferBE)(BigInteger(p).abs().value, 1024);
                pEnt.sign = p < BigInt(0) ? -1 : 1;
                pEnt.vote = voteEnt;
                pEnt.order = ind;
                return pEnt;
            });
            await queryRunner.manager.insert(vote_entity_1.Proof, proofs);
            await queryRunner.commitTransaction();
        }
        catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getSessionVotes(sessionId) {
        const votes = await this.voteRep.find({
            where: {
                sessionId,
            },
            relations: ['proofs', 'c'],
        });
        if (votes.length == 0) {
            console.log('Session does not exist');
        }
        return votes.map((vote) => {
            const y0 = (0, bigint_buffer_1.toBigIntBE)(vote.y0);
            const proof = [];
            let currProof = [];
            const nProofs = vote.proofs.length / 3;
            vote.proofs.sort((a, b) => a.order - b.order);
            for (const p of vote.proofs) {
                const baseNumber = (0, bigint_buffer_1.toBigIntBE)(p.p);
                let proofNumber;
                if (p.sign < 1) {
                    proofNumber = baseNumber * BigInt(-1);
                }
                else {
                    proofNumber = baseNumber;
                }
                currProof.push(proofNumber);
                if (currProof.length >= nProofs) {
                    proof.push(currProof);
                    currProof = [];
                }
            }
            return {
                vote: (0, bigint_buffer_1.toBigIntBE)(vote.vote),
                y0,
                s: (0, bigint_buffer_1.toBigIntBE)(vote.s),
                c: vote.c.sort((a, b) => a.idx - b.idx).map((c) => (0, bigint_buffer_1.toBigIntBE)(c.c)),
                proof,
                groupId: vote.groupId,
                token: vote.token.toString(),
            };
        });
    }
    async submitKey(partyId, pubKey, sessionID) {
        const partykey = new pubkeys_entity_1.pubkeys();
        partykey.partyid = Buffer.from(partyId);
        partykey.Tallypubkey = (0, bigint_buffer_1.toBufferBE)(BigInt('0x' + pubKey), 1024);
        partykey.sessionId = Buffer.from(sessionID);
        await this.pubkeysRep.insert(partykey);
        const keys = await this.pubkeysRep.find();
    }
    async addHashedId(hashedId, pubKey) {
        const hashedIdEnt = new HashedId_entity_1.HashedId();
        hashedIdEnt.Hash = Buffer.from(hashedId);
        hashedIdEnt.PubKey = (0, bigint_buffer_1.toBufferBE)(pubKey, 1024);
        await this.hashedIdRep.insert(hashedIdEnt);
    }
    async counterlimit(limit, HashedId) {
        const rows = await this.limitRep.find();
        if (rows.length == 15) {
            console.log('limit reached');
            return;
        }
        else {
            const counterlimit = new limit_entity_1.Limit();
            counterlimit.limit = limit;
            counterlimit.HashedId = Buffer.from(HashedId);
            await this.limitRep.insert(counterlimit);
        }
    }
    async getcounterlimit() {
        const limit = await this.limitRep.find();
        return limit;
    }
    async getTriggerVal() {
        const trigger = await this.triggerRep.find();
        console.log('gettrigger', trigger);
        if (trigger.length == 0) {
            return 0;
        }
        else
            return 1;
    }
    async setTriggerVal(flag) {
        const result = await this.getTriggerVal();
        console.log('result', result);
        if (result == 1) {
            console.log('updating');
            await this.triggerRep.update({ name: 'limitset' }, { val: flag });
        }
        else {
            console.log('creating trigger');
            const trigger = new trigger_entity_1.Trigger();
            trigger.name = 'limitset';
            trigger.val = flag;
            await this.triggerRep.insert(trigger);
        }
    }
    async storeTokens(vid, HashedId, counter) {
        const token = new tokens_entity_1.Token();
        token.vid = Buffer.from(vid);
        token.HashedId = Buffer.from(HashedId);
        token.counter = Buffer.from(counter);
        await this.tokensRep.insert(token);
    }
    async getKeys(sessionID) {
        const keys = await this.pubkeysRep.find({
            where: {
                sessionId: Buffer.from(sessionID),
            },
        });
        return keys.map((key) => {
            return {
                partyId: key.partyid.toString(),
                TallypubKey: (0, bigint_buffer_1.toBigIntBE)(key.Tallypubkey).toString(16),
            };
        });
    }
    async storeFilteredVotes(partyID, votes) {
        const filteredVotes = new FilteredVotes_entity_1.FilteredVotes();
        filteredVotes.partyID = Buffer.from(partyID);
        filteredVotes.votes = Buffer.from(votes);
        await this.filteredVotesRep.insert(filteredVotes);
    }
    async getFilteredVotes() {
        const votes = await this.filteredVotesRep.find();
        return votes.map((vote) => {
            return {
                partyID: vote.partyID.toString(),
                votes: vote.votes.toString(),
            };
        });
    }
    async getTokenTriggerVal() {
        const trigger = await this.tokenTriggerRep.find();
        console.log('get trigger token', trigger);
        if (trigger.length == 0) {
            return 0;
        }
        else
            return 1;
    }
    async setTokenTriggerVal(flag) {
        const result = await this.getTokenTriggerVal();
        console.log('result', result);
        if (result == 1) {
            console.log('updating token Trigger Value');
            await this.tokenTriggerRep.update({ name: 'limitset' }, { val: flag });
        }
        else {
            console.log('creating trigger');
            const trigger = new TokenTrigger_entity_1.TokenTrigger();
            trigger.name = 'limitset';
            trigger.val = flag;
            await this.tokenTriggerRep.insert(trigger);
        }
    }
    async getTokensAll() {
        const tokens = await this.tokensRep.find();
        const allTokens = tokens.map((token) => {
            return {
                vid: token.vid.toString(),
                HashedId: token.HashedId.toString(),
                counter: token.counter.toString(),
            };
        });
        let groupedTokens = [];
        allTokens.forEach((token) => {
            const index = groupedTokens.findIndex((element) => element.vid == token.vid);
            if (index == -1) {
                groupedTokens.push({
                    vid: token.vid,
                    counters: [token.counter],
                    HashedId: token.HashedId,
                });
            }
            else {
                groupedTokens[index].counters.push(token.counter);
            }
        });
        groupedTokens.forEach((token) => {
            token.counters.sort(function (a, b) {
                return parseInt(a) - parseInt(b);
            });
        });
        console.log('groupedTokens', groupedTokens);
        return groupedTokens;
    }
    async storeEncryptedTokens(tokens) {
        await Promise.all(tokens.map(async (token) => {
            console.log('storing token', token);
            const tokenToStore = new encryptedTokens_entity_1.encryptedTokens();
            tokenToStore.encryptedCounter = Buffer.from(token.counter);
            tokenToStore.encryptedVid = Buffer.from(token.vid);
            tokenToStore.HashedId = Buffer.from(token.HashedId);
            tokenToStore.signature = Buffer.from(token.signature);
            tokenToStore.counterIndex = token.counterIndex;
            tokenToStore.pubkey = token.pubkey;
            await this.encryptedTokensRep.insert(token);
        }));
        const encTokens = await this.encryptedTokensRep.find();
        console.log('encTokens', encTokens.length);
    }
    async getEncryptedTokens(pubKey) {
        const hash = await this.getVoterHash(BigInt('0x' + pubKey));
        console.log('hash', hash);
        const tokens = await this.encryptedTokensRep.find({});
        console.log('tokens from the vote page ', tokens);
        return tokens.map((token) => {
            return {
                encryptedCounter: token.encryptedCounter.toString(),
                encryptedVid: token.encryptedVid.toString(),
                signature: token.signature.toString(),
                counterIndex: token.counterIndex,
                pubkey: token.pubkey,
            };
        });
    }
};
DBService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_2.InjectRepository)(candidate_entity_1.Candidate)),
    __param(2, (0, typeorm_2.InjectRepository)(voter_entity_1.Voter)),
    __param(3, (0, typeorm_2.InjectRepository)(vote_entity_1.Vote)),
    __param(4, (0, typeorm_2.InjectRepository)(pubkeys_entity_1.pubkeys)),
    __param(5, (0, typeorm_2.InjectRepository)(HashedId_entity_1.HashedId)),
    __param(6, (0, typeorm_2.InjectRepository)(trigger_entity_1.Trigger)),
    __param(7, (0, typeorm_2.InjectRepository)(TokenTrigger_entity_1.TokenTrigger)),
    __param(8, (0, typeorm_2.InjectRepository)(tokens_entity_1.Token)),
    __param(9, (0, typeorm_2.InjectRepository)(limit_entity_1.Limit)),
    __param(10, (0, typeorm_2.InjectRepository)(encryptedTokens_entity_1.encryptedTokens)),
    __param(11, (0, typeorm_2.InjectRepository)(FilteredVotes_entity_1.FilteredVotes)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Connection])
], DBService);
exports.DBService = DBService;
//# sourceMappingURL=db.service.js.map