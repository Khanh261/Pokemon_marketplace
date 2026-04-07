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
exports.PokemonController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pokemon_service_1 = require("./pokemon.service");
const create_pokemon_dto_1 = require("./dto/create-pokemon.dto");
const update_pokemon_dto_1 = require("./dto/update-pokemon.dto");
const pokemon_query_dto_1 = require("./dto/pokemon-query.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../auth/user.entity");
let PokemonController = class PokemonController {
    pokemonService;
    constructor(pokemonService) {
        this.pokemonService = pokemonService;
    }
    create(createPokemonDto) {
        return this.pokemonService.create(createPokemonDto);
    }
    findAll(query) {
        return this.pokemonService.findAll(query);
    }
    getContractStats() {
        return this.pokemonService.getContractStats();
    }
    findOne(id) {
        return this.pokemonService.findOne(id);
    }
    getMetadata(id) {
        return this.pokemonService.getMetadata(id);
    }
    mintPokemon(id) {
        return this.pokemonService.mintPokemon(id);
    }
    confirmPurchase(id, body) {
        return this.pokemonService.confirmPurchase(id, body.txHash, body.buyerAddress);
    }
    update(id, updatePokemonDto) {
        return this.pokemonService.update(id, updatePokemonDto);
    }
    remove(id) {
        return this.pokemonService.remove(id);
    }
};
exports.PokemonController = PokemonController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Pokemon (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pokemon created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pokemon_dto_1.CreatePokemonDto]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Pokemon with pagination and filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated Pokemon list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pokemon_query_dto_1.PokemonQueryDto]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('contract/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "getContractStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single Pokemon by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the Pokemon' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pokemon not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/metadata'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ERC-721 metadata JSON for a Pokemon' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns ERC-721 compliant metadata' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "getMetadata", null);
__decorate([
    (0, common_1.Post)(':id/mint'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mint a Pokemon as NFT on-chain (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pokemon minted as NFT' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "mintPokemon", null);
__decorate([
    (0, common_1.Post)(':id/purchase'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm NFT purchase after blockchain transaction' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "confirmPurchase", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a Pokemon (Admin only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pokemon_dto_1.UpdatePokemonDto]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a Pokemon (Admin only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PokemonController.prototype, "remove", null);
exports.PokemonController = PokemonController = __decorate([
    (0, swagger_1.ApiTags)('pokemon'),
    (0, common_1.Controller)('pokemon'),
    __metadata("design:paramtypes", [pokemon_service_1.PokemonService])
], PokemonController);
//# sourceMappingURL=pokemon.controller.js.map