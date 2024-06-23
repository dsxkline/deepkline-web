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

export interface SubMsg {
    arg: SubArgs,
    op: string
}

export interface SubArgs {
    instId: string,
    channel: string
}

export interface SubData {
    event: string,
    arg: SubArgs,
    code: string,
    msg: string,
    connId: string
}

export interface SendData {
    arg: SubArgs,
    data: any[]
}

export enum CandleCannel {
    candle3M = 'candle3M',
    candle1M = 'candle1M',
    candle1W = 'candle1W',
    candle1D = 'candle1D',
    candle2D = 'candle2D',
    candle3D = 'candle3D',
    candle5D = 'candle5D',
    candle12H = 'candle12H',
    candle6H = 'candle6H',
    candle4H = 'candle4H',
    candle2H = 'candle2H',
    candle1H = 'candle1H',
    candle30m = 'candle30m',
    candle15m = 'candle15m',
    candle5m = 'candle5m',
    candle3m = 'candle3m',
    candle1m = 'candle1m',
    candle1s = 'candle1s',
    candle3Mutc = 'candle3Mutc',
    candle1Mutc = 'candle1Mutc',
    candle1Wutc = 'candle1Wutc',
    candle1Dutc = 'candle1Dutc',
    candle2Dutc = 'candle2Dutc',
    candle3Dutc = 'candle3Dutc',
    candle5Dutc = 'candle5Dutc',
    candle12Hutc = 'candle12Hutc',
    candle6Hutc = 'candle6Hutc',
}

export enum WsChannel{
    public = 'public',
    private = 'private',
    business = 'business',
}

export interface Ticker{
    instId: string,
    last: string,
    lastSz: string,
    askPx: string,
    askSz: string,
    bidPx: string,
    bidSz: string,
    open24h: string,
    high24h: string,
    low24h: string,
    volCcy24h: string,
    vol24h: string,
    ts: number,
    sodUtc0: string,
}
export interface TickersMessage{
    arg: SubArgs,
    data: Ticker[]
}

export type Candle = [ts,o,h,l,c,vol,volCcy,volCcyQuote,confirm]
export interface CandleMessage{
    arg: SubArgs,
    data: Candle[]
}