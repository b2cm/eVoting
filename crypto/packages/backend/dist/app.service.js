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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const utils_1 = require("./utils");
const uuid_1 = require("uuid");
const db_service_1 = require("./db.service");
const zksync_web3_1 = require("zksync-web3");
const Register_json_1 = require("./artifacts-zk/contracts/Register.sol/Register.json");
const FactoryEvoting_json_1 = require("./artifacts-zk/contracts/FactoryEvoting.sol/FactoryEvoting.json");
const Evoting_json_1 = require("./artifacts-zk/contracts/Evoting.sol/Evoting.json");
const REGISTER_ADDR = '0x3041abcb251FF01A41a9FA7D533186D9C92FbDb4';
const FACTORY_ADDR = '0x3516FdFB9997A225901212cF090d339f0804739D';
const l2Provider = new zksync_web3_1.Provider("https://zksync2-testnet.zksync.dev");
const register = new zksync_web3_1.Contract(REGISTER_ADDR, Register_json_1.abi, l2Provider);
const factory = new zksync_web3_1.Contract(FACTORY_ADDR, FactoryEvoting_json_1.abi, l2Provider);
let AppService = class AppService {
    constructor(db) {
        this.db = db;
        this.sessions = new rxjs_1.BehaviorSubject(new Map());
    }
    createSession() {
        const id = (0, uuid_1.v4)();
        const s = this.sessions.getValue();
        s.set(id + '/encrypt', { parties: [] });
        s.set(id + '/decrypt', { parties: [] });
        this.sessions.next(s);
        return id;
    }
    hasSession(id) {
        return this.sessions.getValue().has(id);
    }
    addParty(sessionId, sock, userId) {
        const uId = userId || (0, uuid_1.v4)();
        const p = {
            id: uId,
            socket: sock,
        };
        (0, utils_1.updateBehaviorSubject)(this.sessions, (s) => {
            let session = s.get(sessionId);
            if (!session) {
                if (!sessionId.endsWith('decrypt')) {
                    return s;
                }
                session = {
                    parties: [],
                };
                s.set(sessionId, session);
            }
            session.parties.push(p);
            return s;
        });
        return p;
    }
    async addSessionDetails(sessionId, pubKey) {
        const b = BigInt(50);
        let pow = BigInt(0);
        const candidates = Array(3)
            .fill({})
            .map((_, idx) => {
            const message = b ** pow;
            pow++;
            return {
                name: 'Candidate ' + (idx + 1),
                message,
            };
        });
        await this.db.addSession(sessionId, pubKey, candidates);
    }
    async getSessionDetails(sessionId) {
        return await this.db.getSessionDetails(sessionId);
    }
    async submitKey(partyId, pubKey, sessionId) {
        await this.db.submitKey(partyId, pubKey, sessionId);
    }
    async counterlimit(limit, HashedId) {
        await this.db.counterlimit(limit, HashedId);
    }
    async getcounterlimit() {
        return await this.db.getcounterlimit();
    }
    async getTokenTriggerVal() {
        return await this.db.getTokenTriggerVal();
    }
    async setTokenTriggerVal(flag) {
        await this.db.setTokenTriggerVal(flag);
    }
    async getTriggerVal() {
        return await this.db.getTriggerVal();
    }
    async setTriggerVal(flag) {
        await this.db.setTriggerVal(flag);
    }
    async storeTokens(vid, HashedId, counter) {
        await this.db.storeTokens(vid, HashedId, counter);
    }
    async getTokens() {
        return await this.db.getTokensAll();
    }
    async storeEncryptedTokens(tokens) {
        await this.db.storeEncryptedTokens(tokens);
    }
    async getHashedIDs() {
        try {
            const voters = await register.getVoterIDs();
            return voters;
        }
        catch (error) {
            console.error('Error:', error);
            return error;
        }
    }
    async getLRSGroup() {
        try {
            const voters = await register.getLRSGroup();
            return voters;
        }
        catch (error) {
            console.error('Error:', error);
            return error;
        }
    }
    async getVotes(voteID) {
        const message = 'Wrong vote id';
        try {
            const voteAddr = await factory.get_voting(voteID);
            const STATE = ['IN_PREPARATION', 'LIVE', 'COMPLETED', 'CANCELLED'];
            const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
            if (voteAddr != ZERO_ADDRESS) {
                const voting = new zksync_web3_1.Contract(voteAddr, Evoting_json_1.abi, l2Provider);
                const state = STATE[await voting.get_state()];
                if (state === STATE[2]) {
                    const votes = await voting.get_votes();
                    return votes;
                }
                else {
                    return { message: 'No votes' };
                }
            }
            else {
                return { message };
            }
        }
        catch (error) {
            console.log('Error:', error);
            const code = error.code;
            const reason = error.reason;
            const status = 'Wrong vote id';
            return { message, reason, code };
        }
    }
};
AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DBService])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map