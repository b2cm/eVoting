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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitVoteService = void 0;
const common_1 = require("@nestjs/common");
const lrs_1 = require("lrs");
const db_service_1 = require("./db.service");
const BigInteger = require("big-integer");
const elgammal_1 = require("elgammal");
const groups = [
    '3dab9a0c-7ac6-46f8-93ad-659723058b38',
    'a0c4a4cb-e627-4afe-a9f3-2c7fbb4af1be',
    'cf3f9f79-bbbe-472c-bebb-13641d3d8328',
    'aa8e90c1-3889-4dfe-a083-af13717e68e2',
    'eb33a74b-e8b2-4ca0-9346-555d5c4ce043',
];
const groupLimit = 5;
let SubmitVoteService = class SubmitVoteService {
    constructor(db) {
        this.db = db;
    }
    async submitVote(sessionId, ciphertext, proof, signature, groupId, token) {
        const sign = new lrs_1.Signature({
            value0: BigInteger(signature.y0),
            value1: BigInteger(signature.s),
            value2: signature.c.map((n) => BigInteger(n)),
        });
        await this.db.addVote(sessionId, ciphertext, sign, groupId, proof, token);
    }
    async getSessionVotes(sessionId) {
        const votes = await this.db.getSessionVotes(sessionId);
        return votes;
    }
    async getVoter(pubKey) {
        const hashId = await this.db.getVoterHash(pubKey);
        if (!hashId)
            return null;
        const tokens = await this.db.getTokens(hashId.Hash);
        tokens.forEach((token) => {
            const HashedId = token.HashedId.toString();
            token.counter.toString();
            token.vid.toString();
        });
        const formattedTokens = tokens.map((token) => ({
            HashedId: token.HashedId.toString(),
            counter: token.counter.toString(),
            vid: token.vid.toString(),
        }));
        formattedTokens.sort(function (a, b) {
            return parseInt(a.counter) - parseInt(b.counter);
        });
        return formattedTokens;
    }
    getVoterGroups() {
        return this.db.getGroups();
    }
    async addVoter(pubKey) {
        const dbGroups = await this.db.getGroups();
        const selectableGroups = groups.filter((gid) => !dbGroups[gid] || dbGroups[gid].length < groupLimit);
        const gIdx = Math.round(Math.random() * (selectableGroups.length - 1));
        const group = selectableGroups[gIdx];
        const Vid = (0, elgammal_1.GenerateRandom)();
        const counter = BigInt(Math.floor(Math.random() * 10000000).toString(10));
        return this.db.addVoter(pubKey, group, Vid, counter);
    }
    async addHashedId(hashid, pubKey) {
        return this.db.addHashedId(hashid, pubKey);
    }
    async getKeys(sessionID) {
        const keys = this.db.getKeys(sessionID);
        return keys;
    }
    async storeFilteredVotes(partyID, votes) {
        await this.db.storeFilteredVotes(partyID, votes);
    }
    async getFilteredVotes() {
        const filteredVotes = await this.db.getFilteredVotes();
        console.log('filteredVotes', filteredVotes);
        return filteredVotes;
    }
    async getEncryptedTokens(publicKey) {
        console.log('publicKey', publicKey);
        return await this.db.getEncryptedTokens(publicKey);
    }
};
SubmitVoteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DBService])
], SubmitVoteService);
exports.SubmitVoteService = SubmitVoteService;
//# sourceMappingURL=submit.service.js.map