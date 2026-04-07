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
exports.CreatePokemonDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const pokemon_entity_1 = require("../pokemon.entity");
class CreatePokemonDto {
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
}
exports.CreatePokemonDto = CreatePokemonDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pikachu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePokemonDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Electric' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePokemonDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 9.99 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePokemonDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/pikachu.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePokemonDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePokemonDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'The Electric Mouse Pokemon' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePokemonDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['Static', 'Lightning Rod'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePokemonDto.prototype, "abilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { hp: 35, attack: 55, defense: 40, speed: 90 } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePokemonDto.prototype, "stats", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: pokemon_entity_1.PokemonRarity, example: pokemon_entity_1.PokemonRarity.COMMON }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(pokemon_entity_1.PokemonRarity),
    __metadata("design:type", String)
], CreatePokemonDto.prototype, "rarity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mouse Pokemon' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePokemonDto.prototype, "category", void 0);
//# sourceMappingURL=create-pokemon.dto.js.map