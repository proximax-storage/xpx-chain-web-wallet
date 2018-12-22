export interface commonInterface {
    password: string;
    privateKey: string;
}

export interface walletInterface {
    encrypted;
    iv;
}

export interface WalletAccountInterface {
    name: string,
    accounts: object;
}

export interface AccountsInterface {
    brain: boolean;
    algo: string;
    encrypted: string;
    iv: string;
    address: string;
    label: string;
    network: number;
}


export interface FileInterface {
    dataHash: string;
    contentType: string;
    name: string;
}