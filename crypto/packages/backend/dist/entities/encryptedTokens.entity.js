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
exports.encryptedTokens = void 0;
const typeorm_1 = require("typeorm");
let encryptedTokens = class encryptedTokens {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], encryptedTokens.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        default: () => '0x' + Buffer.alloc(1024).toString('hex')
    }),
    __metadata("design:type", Buffer)
], encryptedTokens.prototype, "encryptedCounter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        default: () => '0x' + Buffer.alloc(1024).toString('hex')
    }),
    __metadata("design:type", Buffer)
], encryptedTokens.prototype, "encryptedVid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        default: () => '0x' + Buffer.alloc(1024).toString('hex')
    }),
    __metadata("design:type", Buffer)
], encryptedTokens.prototype, "HashedId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        unique: true,
        default: () => '0x' + Buffer.alloc(1024).toString('hex')
    }),
    __metadata("design:type", Buffer)
], encryptedTokens.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
    }),
    __metadata("design:type", Number)
], encryptedTokens.prototype, "counterIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 1024,
        default: ""
    }),
    __metadata("design:type", String)
], encryptedTokens.prototype, "pubkey", void 0);
encryptedTokens = __decorate([
    (0, typeorm_1.Entity)()
], encryptedTokens);
exports.encryptedTokens = encryptedTokens;
//# sourceMappingURL=encryptedTokens.entity.js.map