import "server-only";
import type { ClientConfig, GroupConfig } from "@/config/clients";
import type { DateRange } from "../types";
import * as meta from "./meta";
import * as mock from "./mock";

export type SourceMode = "mock" | "meta";

export function sourceMode(): SourceMode {
  return process.env.DATA_SOURCE === "meta" ? "meta" : "mock";
}

/** In mock mode the data covers one fixed export period. */
export function fixedRange(client: ClientConfig): DateRange | null {
  return sourceMode() === "mock" ? mock.mockRange(client) : null;
}

export function getGroup(client: ClientConfig, group: GroupConfig, range: DateRange) {
  return sourceMode() === "meta" ? meta.getGroup(client, group, range) : mock.getGroup(client, group);
}

export function getAds(client: ClientConfig, group: GroupConfig, range: DateRange) {
  return sourceMode() === "meta" ? meta.getAds(client, group, range) : mock.getAds(client, group);
}
