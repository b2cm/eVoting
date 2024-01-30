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
exports.LookUpservice = void 0;
const lookup_entity_1 = require("./entities/lookup.entity");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const bigint_buffer_1 = require("bigint-buffer");
const typeorm_2 = require("typeorm");
let LookUpservice = class LookUpservice {
    constructor(lookUpTableRep, connection) {
        this.lookUpTableRep = lookUpTableRep;
        this.connection = connection;
    }
    async add(value, point) {
        console.log('mapping: ', value.toString(16), point.compressed.toString(16));
        const LookUpEntry = new lookup_entity_1.LookupTable();
        LookUpEntry.value = (0, bigint_buffer_1.toBufferBE)(value, 1024);
        LookUpEntry.point = (0, bigint_buffer_1.toBufferBE)(point.compressed, 1024);
        await this.connection
            .createQueryBuilder()
            .insert()
            .into(lookup_entity_1.LookupTable)
            .values(LookUpEntry)
            .orIgnore()
            .execute();
    }
    async getAll() {
        const table = await this.lookUpTableRep.find();
        return table.map((mapping) => ({
            value: (0, bigint_buffer_1.toBigIntBE)(mapping.value).toString(16),
            point: (0, bigint_buffer_1.toBigIntBE)(mapping.point).toString(16),
        }));
    }
};
LookUpservice = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lookup_entity_1.LookupTable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Connection])
], LookUpservice);
exports.LookUpservice = LookUpservice;
//# sourceMappingURL=lookup.service.js.map