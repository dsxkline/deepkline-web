import { useGet, usePost } from "../global.fetch";
import type { InstanceType, Instruments } from "./okx.type";
const baseUrl = "https://www.okx.com";
const publicInstruments = "/api/v5/public/instruments";

export const publicFetch = {
	instruments: (instType: InstanceType, uly: string = "", instFamily: string = "", instld: string = "") =>
		useGet<Instruments>(baseUrl, publicInstruments, {
			instType,
			uly,
			instFamily,
			instld
		})
};
