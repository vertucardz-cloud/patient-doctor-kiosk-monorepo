
import { Prisma } from '@services/prisma.service';
import { Doctor, User, Prisma as Prismas } from '@prisma/client';
import { notFound, conflict, badRequest, badImplementation } from '@hapi/boom';
import { BaseRepository } from './base.repository';
import { countryToRegion, stateToRegion, IndiaRegion } from '@utils/regions.util';
import { startOfMonth, endOfMonth, monthsBack, emptyMonthlySeries, monthKey, toSeriesArray } from '@utils/time.util';



const PENDING_CASE_STATUSES = [
    "NEW",
    "IN_REVIEW",
    "DOCTOR_ASSIGNED",
    "TREATMENT_PLANNED",
] as const;



class DashboardRepository {

    private prisma;

    constructor() {
        this.prisma = Prisma.client;
    }

    private monthAbbrev(m: number): string {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] ?? String(m);
    }

    async overview() {
        try {
            const MONTHS = 9; // matches your UI
            const monthStarts = monthsBack(MONTHS).map(startOfMonth);
            const monthEnds = monthsBack(MONTHS).map(endOfMonth);
            const monthKeys = monthStarts.map(monthKey);

            // Parallel base counts
            const [
                totalCases,
                activeLocations,
                pendingCases,
                casesForSeries,
                franchisesForSeries,
                patientsForSeries,
                plansMinByCase,
                patients
            ] = await Promise.all([
                this.prisma.case.count(),
                this.prisma.franchise.count({ where: { isActive: true } }),
                this.prisma.case.count({ where: { status: { in: PENDING_CASE_STATUSES as any } } }),
                this.prisma.case.findMany({ select: { createdAt: true, status: true } }),
                this.prisma.franchise.findMany({ select: { createdAt: true, country: true, isActive: true } }),
                this.prisma.patient.findMany({ select: { createdAt: true, franchise: { select: { country: true } } } }),
                this.prisma.treatmentPlan.groupBy({ by: ["caseId"], _min: { createdAt: true } }),
                this.prisma.patient.findMany({ include: { franchise: true } }),
            ]);

            // Build maps for monthly counts
            const casesMonthly = emptyMonthlySeries(MONTHS);
            const pendingCasesMonthly = emptyMonthlySeries(MONTHS);
            const franchisesMonthly = emptyMonthlySeries(MONTHS);
            const patientsMonthly = emptyMonthlySeries(MONTHS);

            for (const c of casesForSeries) {
                const k = monthKey(startOfMonth(new Date(c.createdAt)));
                if (casesMonthly.map.has(k)) {
                    casesMonthly.map.set(k, (casesMonthly.map.get(k) ?? 0) + 1);
                    if ((PENDING_CASE_STATUSES as readonly string[]).includes(c.status)) {
                        pendingCasesMonthly.map.set(k, (pendingCasesMonthly.map.get(k) ?? 0) + 1);
                    }
                }
            }

            for (const f of franchisesForSeries) {
                const k = monthKey(startOfMonth(new Date(f.createdAt)));
                if (franchisesMonthly.map.has(k)) {
                    franchisesMonthly.map.set(k, (franchisesMonthly.map.get(k) ?? 0) + 1);
                }
            }

            for (const p of patientsForSeries) {
                const k = monthKey(startOfMonth(new Date(p.createdAt)));
                if (patientsMonthly.map.has(k)) {
                    patientsMonthly.map.set(k, (patientsMonthly.map.get(k) ?? 0) + 1);
                }
            }

            // Avg response time = avg hours from Case.createdAt -> first TreatmentPlan (by case)
            const caseIds = plansMinByCase.map((x) => x.caseId);
            const casesForResponse = await this.prisma.case.findMany({
                where: { id: { in: caseIds } },
                select: { id: true, createdAt: true },
            });
            const caseCreatedAtMap = new Map<string, Date>(casesForResponse.map((c) => [c.id, c.createdAt]));

            const avgResponseMonthly = emptyMonthlySeries(MONTHS);
            const sums = new Map<string, { totalHours: number; count: number }>();

            for (const x of plansMinByCase) {
                const firstPlanAt = x._min.createdAt as Date | null;
                if (!firstPlanAt) continue;
                const caseCreated = caseCreatedAtMap.get(x.caseId);
                if (!caseCreated) continue;
                const hours = Math.max(0, (firstPlanAt.getTime() - caseCreated.getTime()) / 36e5);
                const mk = monthKey(startOfMonth(firstPlanAt));
                if (!avgResponseMonthly.map.has(mk)) continue;
                const s = sums.get(mk) ?? { totalHours: 0, count: 0 };
                s.totalHours += hours;
                s.count += 1;
                sums.set(mk, s);
            }

            for (const [mk, s] of sums.entries()) {
                avgResponseMonthly.map.set(mk as any, s.count ? +(s.totalHours / s.count).toFixed(1) : 0);
            }

            // Current visits pie -> distribution by region from Franchise countries
            // const regionCounts = { America: 0, Asia: 0, Europe: 0, Africa: 0 } as const;

            const regionCounts: Record<IndiaRegion, number> = {
                North: 0,
                South: 0,
                East: 0,
                West: 0,
                Central: 0,
                "North-East": 0,
                Other: 0,
            };

            // const mutableRegionCounts: Record<keyof typeof regionCounts, number> = { America: 0, Asia: 0, Europe: 0, Africa: 0 };


            patients.forEach((p) => {
                const region = stateToRegion(p.franchise.state);
                regionCounts[region] += 1;
            });

            // for (const f of franchisesForSeries) {
            //     const r = countryToRegion(f.country);
            //     if (r in mutableRegionCounts) mutableRegionCounts[r as keyof typeof mutableRegionCounts]++;
            // }

            // Conversion rates per country (top 5 by cases). Rate = completed TreatmentPlans / Cases * 100.
            const casesWithCountry = await this.prisma.case.findMany({
                select: { id: true, franchise: { select: { country: true } }, createdAt: true },
            });

            const byCountry = new Map<string, { cases: number; lastYear: { completed: number; total: number }; thisYear: { completed: number; total: number } }>();
            const now = new Date();
            const year = now.getFullYear();

            const completedPlans = await this.prisma.treatmentPlan.findMany({
                where: { status: "COMPLETED" },
                select: { caseId: true, createdAt: true },
            });
            const completedByCase = new Map<string, Date>();
            for (const p of completedPlans) completedByCase.set(p.caseId, p.createdAt);

            for (const c of casesWithCountry) {
                const country = c.franchise?.country ?? "Other";
                const bucket = byCountry.get(country) ?? {
                    cases: 0,
                    lastYear: { completed: 0, total: 0 },
                    thisYear: { completed: 0, total: 0 },
                };
                bucket.cases++;
                const y = c.createdAt.getFullYear();
                const entry = y === year - 1 ? bucket.lastYear : y === year ? bucket.thisYear : null;
                if (entry) {
                    entry.total++;
                    const compAt = completedByCase.get(c.id);
                    if (compAt && compAt.getFullYear() === y) entry.completed++;
                }
                byCountry.set(country, bucket);
            }

            const topCountries = Array.from(byCountry.entries())
                .sort((a, b) => b[1].cases - a[1].cases)
                .slice(0, 5)
                .map(([country]) => country);

            const conversionSeries2024 = topCountries.map((country) => {
                const b = byCountry.get(country)!;
                const y = year - 1;
                const pct = b.lastYear.total ? Math.round((b.lastYear.completed / b.lastYear.total) * 100) : 0;
                return pct;
            });

            const conversionSeries2025 = topCountries.map((country) => {
                const b = byCountry.get(country)!;
                const pct = b.thisYear.total ? Math.round((b.thisYear.completed / b.thisYear.total) * 100) : 0;
                return pct;
            });

            // Build payload
            const payload = {
                widgets: {
                    totalRequests: {
                        percent: 0, // set by business logic if needed
                        total: totalCases,
                        series: toSeriesArray(casesMonthly.map, monthKeys),
                    },
                    activeLocations: {
                        percent: 0,
                        total: activeLocations,
                        series: toSeriesArray(franchisesMonthly.map, monthKeys),
                    },
                    pendingCases: {
                        percent: 0,
                        total: pendingCases,
                        series: toSeriesArray(pendingCasesMonthly.map, monthKeys),
                    },
                    avgResponse: {
                        percent: 0,
                        total: Number((Array.from(sums.values()).reduce((a, b) => a + b.totalHours, 0) / (Array.from(sums.values()).reduce((a, b) => a + b.count, 0) || 1)).toFixed(1)),
                        series: toSeriesArray(avgResponseMonthly.map, monthKeys),
                    },
                },

                currentVisits: {
                    series: Object.entries(regionCounts).map(([label, value]) => ({
                        label,
                        value,
                    })),
                },
                // currentVisits: {
                //     series: [
                //         { label: "America", value: mutableRegionCounts.America },
                //         { label: "Asia", value: mutableRegionCounts.Asia },
                //         { label: "Europe", value: mutableRegionCounts.Europe },
                //         { label: "Africa", value: mutableRegionCounts.Africa },
                //     ],
                // },
                websiteVisits: {
                    categories: monthKeys.map((k) => k.split("-")[1]).map((m) => this.monthAbbrev(Number(m))),
                    series: [
                        { name: "Cases", data: toSeriesArray(casesMonthly.map, monthKeys) },
                        { name: "Patients", data: toSeriesArray(patientsMonthly.map, monthKeys) },
                    ],
                },
                conversionRates: {
                    categories: topCountries.length ? topCountries : ["N/A"],
                    series: [
                        { name: String(year - 1), data: topCountries.length ? conversionSeries2024 : [0] },
                        { name: String(year), data: topCountries.length ? conversionSeries2025 : [0] },
                    ],
                },
            } as const;

            return payload;
        } catch (err) {
            return []
        }
    };
}

const dashbordRepository = new DashboardRepository();
export { dashbordRepository as DashboardRepository };










