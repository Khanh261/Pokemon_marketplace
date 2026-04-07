import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
export declare const POKEMON_NFT_ABI: ({
    inputs: never[];
    stateMutability: string;
    type: string;
    name?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
export declare function getProvider(configService: ConfigService): ethers.JsonRpcProvider;
export declare function getAdminWallet(configService: ConfigService): ethers.Wallet;
export declare function getContract(configService: ConfigService): ethers.Contract;
export declare function getReadOnlyContract(configService: ConfigService): ethers.Contract;
