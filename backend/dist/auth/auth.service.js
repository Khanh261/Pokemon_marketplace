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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const ethers_1 = require("ethers");
const user_entity_1 = require("./user.entity");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    configService;
    ownerAddress;
    constructor(userRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.ownerAddress = this.configService.get('OWNER_ADDRESS', '').toLowerCase();
    }
    async walletAuth(walletAuthDto) {
        const { walletAddress, signature, message } = walletAuthDto;
        let recoveredAddress;
        try {
            recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid signature');
        }
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            throw new common_1.UnauthorizedException('Signature does not match wallet address');
        }
        let user = await this.userRepository.findOne({
            where: { walletAddress: walletAddress.toLowerCase() },
        });
        if (!user) {
            const isOwner = walletAddress.toLowerCase() === this.ownerAddress;
            user = this.userRepository.create({
                walletAddress: walletAddress.toLowerCase(),
                name: walletAuthDto.name || `User-${walletAddress.slice(0, 6)}`,
                role: isOwner ? user_entity_1.UserRole.ADMIN : user_entity_1.UserRole.USER,
            });
            await this.userRepository.save(user);
        }
        const token = this.jwtService.sign({
            sub: user.id,
            walletAddress: user.walletAddress,
            role: user.role,
        });
        return { user, token };
    }
    async getNonce() {
        const nonce = Math.floor(Math.random() * 1000000);
        return { message: `Sign in to Pokemon NFT Marketplace: ${nonce}` };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map