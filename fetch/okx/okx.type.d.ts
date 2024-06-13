export enum InstanceType {
    SPOT = 'SPOT',
    FUTURES = 'FUTURES',
    SWAP = 'SWAP',
    OPTION = 'OPTION'
}

export interface Instruments {
    alias: string,
    baseCcy: string,
    category: number,
    ctMult: string,
    ctType: string,
    ctVal: string,
    ctValCcy: string,
    expTime: string,
    instFamily: string,
    instId: string,
    instType: string,
    lever: number,
    listTime: number,
    lotSz: number,
    maxIcebergSz: number,
    maxLmtAmt: number,
    maxLmtSz: number,
    maxMktAmt: number,
    maxMktSz: string,
    maxStopSz: string,
    maxTriggerSz: number,
    maxTwapSz: number,
    minSz: number,
    optType: string,
    quoteCcy: string,
    settleCcy: string,
    state: string,
    stk: string,
    tickSz: number,
    uly: string
}