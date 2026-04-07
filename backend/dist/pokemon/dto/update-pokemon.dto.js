"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePokemonDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_pokemon_dto_1 = require("./create-pokemon.dto");
class UpdatePokemonDto extends (0, swagger_1.PartialType)(create_pokemon_dto_1.CreatePokemonDto) {
}
exports.UpdatePokemonDto = UpdatePokemonDto;
//# sourceMappingURL=update-pokemon.dto.js.map