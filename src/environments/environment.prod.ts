import { ServerConfig, NetworkTypes } from 'nem-library';
export const environment: any = {
    production: '#{production}#',
    routeNodesJson: '#{routeNodesJson}#',
    itemBooksAddress: '#{itemBooksAddress}#',
    version: '#{version}#',
    cacheVersion: '#{cacheVersion}#',
    nameKeyBlockStorage: '#{nameKeyBlockStorage}#',
    nameKeyNodeSelected: '#{nameKeyNodeSelected}#',
    nameKeyWalletStorage: '#{nameKeyWalletStorage}#',
    nameKeyNodeStorage: '#{nameKeyNodeStorage}#',
    nameKeyNamespaces: '#{nameKeyNamespaces}#',
    nameKeyMosaicStorage: '#{nameKeyMosaicStorage}#',
    nameKeyVersion: '#{nameKeyVersion}#',
    nameKeyWalletTransactionsNis: '#{nameKeyWalletTransactionsNis}#',
    activeModulesBox: {
        voting: {
            viewChildrenParam: '#{activeModulesBox-voting-viewChildrenParam}#',
            createPoll: '#{activeModulesBox-voting-createPoll}#',
            vote: '#{activeModulesBox-voting-vote}#',
            viewResult: '#{activeModulesBox-voting-viewResult}#',
            classNameParam: '#{activeModulesBox-voting-classNameParam}#'
        },
        storage: {
            viewChildrenParam: '#{activeModulesBox-storage-viewChildrenParam}#',
            files: '#{activeModulesBox-storage-files}#',
            uploadFiles: '#{activeModulesBox-storage-uploadFiles}#',
            sendShare: '#{activeModulesBox-storage-sendShare}#',
            classNameParam: '#{activeModulesBox-storage-classNameParam}#'
        },
        notarization: {
            viewChildrenParam: '#{activeModulesBox-notarization-viewChildrenParam}#',
            attest: '#{activeModulesBox-notarization-attest}#',
            audit: '#{activeModulesBox-notarization-audit}#',
            classNameParam: '#{activeModulesBox-notarization-classNameParam}#'
        },
    },
    protocol: '#{protocol}#',
    protocolWs: '#{protocolWs}#',
    nodeExplorer: '#{nodeExplorer}#',
    mosaicXpxInfo: {
        name: '#{mosaicXpxInfo-name}#',
        coin: '#{mosaicXpxInfo-coin}#',
        id: '#{mosaicXpxInfo-id}#',
        mosaicIdUint64: '#{mosaicXpxInfo-mosaicIdUint64}#',
        namespaceIdUint64: '#{mosaicXpxInfo-namespaceIdUint64}#',
        namespaceId: '#{mosaicXpxInfo-namespaceId}#',
        divisibility: '#{mosaicXpxInfo-divisibility}#'
    },
    deadlineTransfer: {
        deadline: '#{deadlineTransfer-deadline}#',
        chronoUnit: '#{deadlineTransfer-chronoUnit}#'
    },
    timeOutTransactionNis1: '#{timeOutTransactionNis1}#',
    blockchainConnection: {
        host: '#{blockchainConnection-host}#',
        port: '#{blockchainConnection-port}#',
        protocol: '#{blockchainConnection-protocol}#',
        useSecureMessage: '#{blockchainConnection-useSecureMessage}#'
    },
    storageConnection: {
        host: '#{storageConnection-host}#',
        port: '#{storageConnection-port}#',
        options: {
            protocol: '#{storageConnection-options-protocol}#'
        }

    },
    storageConnectionUnload: {
        host: '#{storageConnectionUnload-host}#',
        port: '#{storageConnectionUnload-port}#',
        options: {
            protocol: '#{storageConnectionUnload-options-protocol}#'
        }

    },
    namespaceRentalFeeSink: {
        public_key: '#{namespaceRentalFeeSink-public_key}#',
        address_public_test: '#{namespaceRentalFeeSink-address_public_test}#'
    },
    mosaicRentalFeeSink: {
        public_key: '#{mosaicRentalFeeSink-public_key}#',
        address_public_test: '#{mosaicRentalFeeSink-address_public_test}#'
    },
    pollsContent: {
        public_key: '#{pollsContent-public_key}#',
        address_public_test: '#{pollsContent-address_public_test}#'
    },
    attestation: {
        address_public_test: '#{attestation-address_public_test}#'
    },
    nis1: {
        url: '#{nis1-url}#',
        urlExplorer: '#{nis1-urlExplorer}#',
        networkType: '#{nis1-networkType}#',
        burnAddress: '#{nis1-burnAddress}#',
        nodes: [
            {
                protocol: '#{nodes-protocol}#',
                domain: '#{nodes-domain}#',
                port: '#{nodes-port}#'
            } as ServerConfig | any],
    },
    swapAccount: {
        addressAccountMultisig: '#{swapAccount-addressAccountMultisig}#',
        addressAccountSimple: '#{swapAccount-addressAccountSimple}#'
    },
    swapAllowedMosaics: [
        {
            namespaceId: '#{swapAllowedMosaics-namespaceId-01}#',
            name: '#{swapAllowedMosaics-name-01}#',
            divisibility: '#{swapAllowedMosaics-divisibility-01}#'
        },
        {
            namespaceId: '#{swapAllowedMosaics-namespaceId-02}#',
            name: '#{swapAllowedMosaics-name-02}#',
            divisibility: '#{swapAllowedMosaics-divisibility-02}#'
        }
    ],
    typeNetwork: {
        value: '#{typeNetwork-value}#',
        label: '#{typeNetwork-label}#'
    },
    coingecko: {
        url: '#{coingecko-url}#',
    },
    blockHeightMax: {
        heightMax: '#{blockHeightMax-heightMax}#'
    },
    lockFundDuration: '#{lockFundDuration}#',
    delayBetweenLockFundABT: '#{delayBetweenLockFundABT}#',
    peerHosting: {
        host: '#{peerHosting-host}#',
        port: '#{peerHosting-port}#',
        path: '#{peerHosting-path}#',
        secure: '#{peerHosting-secure}#',
        debug: '#{peerHosting-debug}#'
    }
};
