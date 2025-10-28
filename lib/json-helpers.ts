/**
 * Helpers para manejar campos JSON que están guardados como strings en SQLite
 */

export function parseImages(imagesString: string | null): string[] {
  if (!imagesString) return [];
  try {
    return JSON.parse(imagesString);
  } catch {
    return [];
  }
}

export function stringifyImages(images: string[]): string {
  return JSON.stringify(images);
}

export function parseAttributes(
  attributesString: string | null
): Record<string, any> {
  if (!attributesString) return {};
  try {
    return JSON.parse(attributesString);
  } catch {
    return {};
  }
}

export function stringifyAttributes(attributes: Record<string, any>): string {
  return JSON.stringify(attributes);
}

export function parseTimeline(
  timelineString: string | null
): Array<{ status: string; timestamp: string; note?: string }> {
  if (!timelineString) return [];
  try {
    return JSON.parse(timelineString);
  } catch {
    return [];
  }
}

export function stringifyTimeline(
  timeline: Array<{ status: string; timestamp: string; note?: string }>
): string {
  return JSON.stringify(timeline);
}

export function parseAddress(
  addressString: string | null
): Record<string, any> | null {
  if (!addressString) return null;
  try {
    return JSON.parse(addressString);
  } catch {
    return null;
  }
}

export function stringifyAddress(address: Record<string, any>): string {
  return JSON.stringify(address);
}

export function parseCustomerData(
  customerDataString: string | null
): Record<string, any> | null {
  if (!customerDataString) return null;
  try {
    return JSON.parse(customerDataString);
  } catch {
    return null;
  }
}

export function stringifyCustomerData(
  customerData: Record<string, any>
): string {
  return JSON.stringify(customerData);
}
