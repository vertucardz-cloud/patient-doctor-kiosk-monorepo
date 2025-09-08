/**
 * Minimal UUID matcher (case-insensitive).
 * Accepts canonical 8-4-4-4-12 hex format.
 */
const UUID_REGEX = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;


const extractFirstUuid = (text: string): string | null => {
    if (!text) return null;
    const m = text.match(UUID_REGEX);
    return m ? m[0].toLowerCase() : null; // normalize to lowercase for DB keys
}

const extractFranchiseId = (text: string): string | null => {
    if (!text) return null;

    const labeled = text.match(/franchise\s*id\s*[:\-]?\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (labeled && labeled[1]) return labeled[1].toLowerCase();

    return extractFirstUuid(text);
}

const extractAllUuids = (text: string): string[] => {
    if (!text) return [];
    const regex = new RegExp(UUID_REGEX.source, 'ig');
    const seen = new Set<string>();
    const out: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
        const id = m[0].toLowerCase();
        if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
        }
    }
    return out;
}


export {
    extractFirstUuid,
    extractFranchiseId,
    extractAllUuids
}