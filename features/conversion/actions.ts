"use server"

import { convertUrl } from "./extract"
import type { ConversionOutcome } from "./types"

export async function requestConversion(url: string): Promise<ConversionOutcome> {
  return convertUrl(url)
}
