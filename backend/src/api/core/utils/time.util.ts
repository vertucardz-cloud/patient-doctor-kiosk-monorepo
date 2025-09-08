export type MonthKey = `${number}-${number}`; // YYYY-M

export function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function monthsBack(n: number): Date[] {
    const arr: Date[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
        arr.push(dt);
    }
    return arr;
}

export function monthKey(d: Date): MonthKey {
    return `${d.getFullYear()}-${d.getMonth() + 1}` as MonthKey;
}

export function emptyMonthlySeries(n: number): { keys: MonthKey[]; map: Map<MonthKey, number> } {
    const keys = monthsBack(n).map(startOfMonth).map(monthKey);
    const map = new Map<MonthKey, number>();
    keys.forEach((k) => map.set(k, 0));
    return { keys, map };
}

export function toSeriesArray(map: Map<MonthKey, number>, keys: MonthKey[]): number[] {
    return keys.map((k) => map.get(k) ?? 0);
}
