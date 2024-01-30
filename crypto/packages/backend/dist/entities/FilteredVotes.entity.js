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
exports.FilteredVotes = void 0;
const typeorm_1 = require("typeorm");
let FilteredVotes = class FilteredVotes {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", Buffer)
], FilteredVotes.prototype, "partyID", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", Buffer)
], FilteredVotes.prototype, "votes", void 0);
FilteredVotes = __decorate([
    (0, typeorm_1.Entity)()
], FilteredVotes);
exports.FilteredVotes = FilteredVotes;
//# sourceMappingURL=FilteredVotes.entity.js.map