import type { CommonDto } from "../dtos/common";
import { useGet, usePost } from "../global.fetch";
import type { InstanceType } from "./okx.type";
const baseUrl = "https://www.okx.com";
const publicInstruments = "/api/v5/public/instruments";

export const publicFetch = {
	instruments: (instType: InstanceType, uly: string = "", instFamily: string = "", instld: string = "") =>
		useGet<CommonDto>(baseUrl, publicInstruments, {
			instType,
			uly,
			instFamily,
			instld
		})
};
