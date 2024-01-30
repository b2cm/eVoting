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
exports.VoteController = void 0;
const common_1 = require("@nestjs/common");
const submit_service_1 = require("./submit.service");
const elgammal_1 = require("elgammal");
const lookup_service_1 = require("./lookup.service");
let VoteController = class VoteController {
    constructor(voteService, LookUpService) {
        this.voteService = voteService;
        this.LookUpService = LookUpService;
    }
    async submitVote(body) {
        const conv = (arr) => arr.map((v) => (v.startsWith('-') ? BigInt(-1) : BigInt(1)) *
            BigInt('0x' + v.replace('-', '')));
        await this.voteService.submitVote(body.sessionId, BigInt('0x' + body.ciphertext), [conv(body.proof[0]), conv(body.proof[1]), conv(body.proof[2])], {
            y0: BigInt('0x' + body.signature.y0),
            s: BigInt('0x' + body.signature.s),
            c: body.signature.c.map((x) => BigInt('0x' + x)),
        }, body.groupId, body.token);
    }
    async getFilteredVotes() {
        console.log('request received for filtered votes');
        return await this.voteService.getFilteredVotes();
    }
    async getFilteredOne() {
        console.log('request received for filtered one');
        const results = await this.voteService.getFilteredVotes();
        const parsed = JSON.parse(results[0].votes);
        console.log('parsed', parsed);
        const filteredData = parsed.map((vote) => ({ vote }));
        return filteredData;
    }
    async getVoterData(pubkey, body) {
        const tokens = await this.voteService.getVoter(BigInt('0x' + pubkey));
        if (!tokens) {
            console.log('No voter found');
        }
        const vidP = elgammal_1.Generator.multiplyCT(BigInt(tokens[0].vid));
        const counterPoints = tokens.map((n) => elgammal_1.Generator.multiplyCT(BigInt(n.counter)));
        console.log('cpppp', counterPoints);
        const limit = counterPoints.length;
        const keys = await this.voteService.getKeys(body.sessionId);
        const encryptedTokensAll = [];
        for (let j = 0; j < counterPoints.length; j++) {
            const encryptedTokens = [];
            for (let i = 0; i < keys.length; i++) {
                const TallypubKey = elgammal_1.Point.fromCompressed(BigInt('0x' + keys[i].TallypubKey));
                const encryptedVid = (0, elgammal_1.ElgammalEncrypt)(TallypubKey, vidP)
                    .map((n) => n.compressed.toString(16).padStart(elgammal_1.BITS / 4 + 1))
                    .join('');
                const encryptedCounter = (0, elgammal_1.ElgammalEncrypt)(TallypubKey, counterPoints[j])
                    .map((n) => n.compressed.toString(16).padStart(elgammal_1.BITS / 4 + 1))
                    .join('');
                encryptedTokens.push({
                    vid: encryptedVid,
                    partyId: keys[i].partyId,
                    counter: encryptedCounter,
                });
            }
            encryptedTokensAll.push(encryptedTokens);
        }
        await Promise.all([
            ...counterPoints.map((counterP, index) => {
                return this.LookUpService.add(BigInt(tokens[index].counter), counterP);
            }),
            this.LookUpService.add(BigInt(tokens[0].vid), vidP),
        ]);
        return {
            publicKey: pubkey,
            tokens: encryptedTokensAll,
        };
    }
    async getVoterGroups() {
        const groups = await this.voteService.getVoterGroups();
        for (const id in groups) {
            groups[id] = groups[id].map((n) => n.toString(16));
        }
        return groups;
    }
    async getEncryptedTokens(body) {
        console.log('hitting API');
        const res = await this.voteService.getEncryptedTokens(body.publicKey);
        return res;
    }
    async getVotes(sessionId) {
        console.log('here at wrong place');
        const v = await this.voteService.getSessionVotes(sessionId);
        return v.map((vote) => {
            return {
                vote: vote.vote.toString(16),
                groupId: vote.groupId,
                y0: vote.y0.toString(16),
                s: vote.s.toString(16),
                c: vote.c.map((c) => c.toString(16)),
                proof: vote.proof.map((pArr) => pArr.map((p) => p.toString(16))),
                token: vote.token,
            };
        });
    }
    async addVoter(body) {
        const key = BigInt('0x' + body.pubKey);
        await this.voteService.addVoter(key);
        const groups = await this.voteService.getVoterGroups();
        for (const id in groups) {
            groups[id] = groups[id].map((n) => n.toString(16));
        }
        return groups;
    }
    async addHashedId(body) {
        const key = BigInt('0x' + body.pubKey);
        console.log(body.pubKey);
        await this.voteService.addHashedId(body.hashedId, key);
    }
    async storefilteredVotes(body) {
        await this.voteService.storeFilteredVotes(body.partyID, body.votes);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "submitVote", null);
__decorate([
    (0, common_1.Get)('FilterVotes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getFilteredVotes", null);
__decorate([
    (0, common_1.Get)('FilterOne'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getFilteredOne", null);
__decorate([
    (0, common_1.Post)('Voter/:pubkey'),
    __param(0, (0, common_1.Param)('pubkey')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoterData", null);
__decorate([
    (0, common_1.Get)('Voter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoterGroups", null);
__decorate([
    (0, common_1.Post)('getEncryptedTokens'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getEncryptedTokens", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVotes", null);
__decorate([
    (0, common_1.Post)('Voter'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "addVoter", null);
__decorate([
    (0, common_1.Post)('HashedId'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "addHashedId", null);
__decorate([
    (0, common_1.Post)('StoreFiltered'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "storefilteredVotes", null);
VoteController = __decorate([
    (0, common_1.Controller)('Vote'),
    __metadata("design:paramtypes", [submit_service_1.SubmitVoteService,
        lookup_service_1.LookUpservice])
], VoteController);
exports.VoteController = VoteController;
//# sourceMappingURL=vote.controller.js.map