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
exports.LiveGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const rxjs_1 = require("rxjs");
const app_service_1 = require("./app.service");
const utils_1 = require("./utils");
let LiveGateway = class LiveGateway {
    constructor(appService) {
        this.appService = appService;
        this.messages$ = new rxjs_1.Subject();
    }
    handleDisconnect(client) {
        (0, utils_1.updateBehaviorSubject)(this.appService.sessions, (sessions) => {
            const sesId = client.data.sessionId;
            if (!sesId) {
                return sessions;
            }
            const ses = sessions.get(sesId);
            if (!ses) {
                return sessions;
            }
            ses.parties = ses.parties.filter((p) => p.id != client.data.userId);
            if (ses.parties.length == 0) {
                sessions.delete(sesId);
            }
            return sessions;
        });
    }
    joinSession(data, sock) {
        if (data.sessionId.endsWith('decrypt') ||
            this.appService.hasSession(data.sessionId)) {
            const { id } = this.appService.addParty(data.sessionId, sock, data.userId);
            sock.data.userId = id;
            sock.data.sessionId = data.sessionId;
            return (0, rxjs_1.merge)((0, rxjs_1.of)({
                event: 'userId',
                data: id,
            }), this.partiesInSession(data.sessionId), this.incominMessages(data.sessionId, id));
        }
    }
    sendMessage(data, sock) {
        this.messages$.next(Object.assign(Object.assign({}, data), { from: sock }));
    }
    incominMessages(sessionId, uId) {
        return this.messages$.pipe((0, rxjs_1.filter)((m) => m.sessionId === sessionId && m.toId === uId), (0, rxjs_1.map)((m) => ({
            event: 'rtcMessage',
            data: {
                message: m.message,
                from: m.from.data.userId,
            },
        })));
    }
    partiesInSession(id) {
        return this.appService.sessions.pipe((0, rxjs_1.startWith)(this.appService.sessions.getValue()), (0, rxjs_1.map)((ses) => ses.get(id)), (0, rxjs_1.switchMap)((ses) => {
            if (!ses) {
                return rxjs_1.EMPTY;
            }
            else {
                return (0, rxjs_1.of)(ses.parties.map((party) => ({ id: party.id })));
            }
        }), (0, rxjs_1.delay)(1000), (0, rxjs_1.map)((parties) => ({
            event: 'parties',
            data: { parties },
        })));
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('joinSession'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LiveGateway.prototype, "joinSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LiveGateway.prototype, "sendMessage", null);
LiveGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], LiveGateway);
exports.LiveGateway = LiveGateway;
//# sourceMappingURL=live.gateway.js.map