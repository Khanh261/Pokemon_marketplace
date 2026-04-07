export declare enum UserRole {
    ADMIN = "Admin",
    USER = "User"
}
export declare class User {
    id: string;
    walletAddress: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
