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
exports.Candidate = void 0;
const typeorm_1 = require("typeorm");
const session_entity_1 = require("./session.entity");
let Candidate = class Candidate {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'varbinary',
        length: 1024,
    }),
    __metadata("design:type", Buffer)
], Candidate.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'char',
        length: 36,
    }),
    __metadata("design:type", String)
], Candidate.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((t) => session_entity_1.Session, (s) => s.candidates),
    (0, typeorm_1.JoinColumn)({ name: 'sessionId' }),
    __metadata("design:type", session_entity_1.Session)
], Candidate.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "name", void 0);
Candidate = __decorate([
    (0, typeorm_1.Entity)()
], Candidate);
exports.Candidate = Candidate;
//# sourceMappingURL=candidate.entity.js.map