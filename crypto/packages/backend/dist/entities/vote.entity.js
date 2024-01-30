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
exports.Proof = exports.SignatureC = exports.Vote = void 0;
const typeorm_1 = require("typeorm");
const session_entity_1 = require("./session.entity");
let Vote = class Vote {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'char',
        length: 36,
        nullable: false,
    }),
    __metadata("design:type", String)
], Vote.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((t) => session_entity_1.Session, (s) => s),
    (0, typeorm_1.JoinColumn)({ name: 'sessionId' }),
    __metadata("design:type", session_entity_1.Session)
], Vote.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'char',
        length: 36,
        nullable: false,
    }),
    __metadata("design:type", String)
], Vote.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 4096,
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], Vote.prototype, "vote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], Vote.prototype, "y0", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], Vote.prototype, "s", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 4096,
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], Vote.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.OneToMany)((t) => SignatureC, (c) => c.vote),
    __metadata("design:type", Array)
], Vote.prototype, "c", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Proof, (p) => p.vote),
    __metadata("design:type", Array)
], Vote.prototype, "proofs", void 0);
Vote = __decorate([
    (0, typeorm_1.Entity)()
], Vote);
exports.Vote = Vote;
let SignatureC = class SignatureC {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'singatureId' }),
    __metadata("design:type", Number)
], SignatureC.prototype, "idx", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], SignatureC.prototype, "c", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vote, (v) => v.c),
    __metadata("design:type", Vote)
], SignatureC.prototype, "vote", void 0);
SignatureC = __decorate([
    (0, typeorm_1.Entity)()
], SignatureC);
exports.SignatureC = SignatureC;
let Proof = class Proof {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'proofId' }),
    __metadata("design:type", Number)
], Proof.prototype, "idx", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], Proof.prototype, "p", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vote, (v) => v.proofs),
    __metadata("design:type", Vote)
], Proof.prototype, "vote", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Proof.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Proof.prototype, "sign", void 0);
Proof = __decorate([
    (0, typeorm_1.Entity)()
], Proof);
exports.Proof = Proof;
//# sourceMappingURL=vote.entity.js.map