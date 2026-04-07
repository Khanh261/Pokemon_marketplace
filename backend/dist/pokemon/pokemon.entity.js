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
exports.Pokemon = exports.PokemonRarity = void 0;
const typeorm_1 = require("typeorm");
var PokemonRarity;
(function (PokemonRarity) {
    PokemonRarity["COMMON"] = "Common";
    PokemonRarity["UNCOMMON"] = "Uncommon";
    PokemonRarity["RARE"] = "Rare";
    PokemonRarity["LEGENDARY"] = "Legendary";
})(PokemonRarity || (exports.PokemonRarity = PokemonRarity = {}));
let Pokemon = class Pokemon {
    id;
    name;
    type;
    price;
    imageUrl;
    stockQuantity;
    description;
    abilities;
    stats;
    rarity;
    category;
    tokenId;
    priceEth;
    ownerAddress;
    isMinted;
    isForSale;
    createdAt;
    updatedAt;
};
exports.Pokemon = Pokemon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Pokemon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Pokemon.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pokemon.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pokemon.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pokemon.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Pokemon.prototype, "stockQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Pokemon.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Pokemon.prototype, "abilities", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Pokemon.prototype, "stats", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PokemonRarity,
        default: PokemonRarity.COMMON,
    }),
    __metadata("design:type", String)
], Pokemon.prototype, "rarity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pokemon.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'int' }),
    __metadata("design:type", Number)
], Pokemon.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '0.001' }),
    __metadata("design:type", String)
], Pokemon.prototype, "priceEth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pokemon.prototype, "ownerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Pokemon.prototype, "isMinted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Pokemon.prototype, "isForSale", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pokemon.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Pokemon.prototype, "updatedAt", void 0);
exports.Pokemon = Pokemon = __decorate([
    (0, typeorm_1.Entity)('pokemon')
], Pokemon);
//# sourceMappingURL=pokemon.entity.js.map