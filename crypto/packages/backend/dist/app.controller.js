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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const constants_1 = require("./constants");
const constants_2 = require("./constants");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    createSession() {
        const id = this.appService.createSession();
        return {
            sessionId: id,
        };
    }
    async getSessionData(sessionId) {
        const { pubKey, candidates } = await this.appService.getSessionDetails(sessionId);
        return {
            pubKey: pubKey.toString(16),
            candidates: candidates.map((c) => (Object.assign(Object.assign({}, c), { message: c.message.toString(16) }))),
        };
    }
    async putSessionData(body) {
        await this.appService.addSessionDetails(body.sessionId, BigInt('0x' + body.N));
    }
    GetTallyServerPubKey() {
        return { TallyKey: constants_1.TALLY_SERVER_KEY.toString(16) };
    }
    GetTallyServerPrivKey() {
        return { TallyPrivKey: constants_2.TALLY_SERVER_KEY_PRIV };
    }
    async submitKey(body) {
        await this.appService.submitKey(body.userId, body.pubKey, body.sessionId);
    }
    async setcounterlimit(body) {
        await this.appService.counterlimit(body.limit, body.HashedId);
    }
    async getcounterlimit() {
        const res = await this.appService.getcounterlimit();
        const limits = res.map((element) => element.limit);
        const HashIds = res.map((element) => element.HashedId.toString());
        return { limits: limits, HashIds: HashIds };
    }
    async setTriggerVal(body) {
        console.log('body', body.flag);
        await this.appService.setTriggerVal(body.flag);
    }
    async getTriggerVal() {
        const result = await this.appService.getTriggerVal();
        return { result: result };
    }
    async getTokenTriggerVal() {
        const result = await this.appService.getTokenTriggerVal();
        return { result: result };
    }
    async setTokenTriggerVal(body) {
        console.log('body', body.flag);
        await this.appService.setTokenTriggerVal(body.flag);
    }
    async storeTokens(body) {
        await this.appService.storeTokens(body.vid, body.HashedId, body.counter);
    }
    async storeEncryptedTokens(body) {
        await this.appService.storeEncryptedTokens(body.encryptedTokens);
    }
    async getTokens() {
        const res = await this.appService.getTokens();
        return { tokens: res };
    }
    async registrationEnded() {
    }
    async getHashedIDs() {
        const hashedIDs = await this.appService.getHashedIDs();
        return { hashedIDs };
    }
    async getLRSGroup() {
        const group = await this.appService.getLRSGroup();
        return { group };
    }
    async getVotes(body) {
        const votes = await this.appService.getVotes(body.voteID);
        return { votes };
    }
};
__decorate([
    (0, common_1.Post)('CreateSession'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('SessionData/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getSessionData", null);
__decorate([
    (0, common_1.Put)('SessionData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "putSessionData", null);
__decorate([
    (0, common_1.Get)('TallyServerPubKey'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "GetTallyServerPubKey", null);
__decorate([
    (0, common_1.Get)('TallyServerPrivKey'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "GetTallyServerPrivKey", null);
__decorate([
    (0, common_1.Post)('Submitkey'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "submitKey", null);
__decorate([
    (0, common_1.Post)('counterlimit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "setcounterlimit", null);
__decorate([
    (0, common_1.Get)('getCounterlimit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getcounterlimit", null);
__decorate([
    (0, common_1.Post)('SetTriggerVal'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "setTriggerVal", null);
__decorate([
    (0, common_1.Get)('TriggerVal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTriggerVal", null);
__decorate([
    (0, common_1.Get)('TokenTriggerVal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTokenTriggerVal", null);
__decorate([
    (0, common_1.Post)('SetTokenTriggerVal'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "setTokenTriggerVal", null);
__decorate([
    (0, common_1.Post)('StoreTokens'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "storeTokens", null);
__decorate([
    (0, common_1.Post)('StoreEncryptedTokens'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "storeEncryptedTokens", null);
__decorate([
    (0, common_1.Get)('getTokensAll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTokens", null);
__decorate([
    (0, common_1.Post)('RegistrationEnded'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "registrationEnded", null);
__decorate([
    (0, common_1.Get)('getHashedIDs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHashedIDs", null);
__decorate([
    (0, common_1.Get)('getLRSGroup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getLRSGroup", null);
__decorate([
    (0, common_1.Get)('getVotes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getVotes", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map