import { Prisma } from '@services/prisma.service';
import { TreatmentPlan, TreatmentPlanStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { notFound, conflict, badImplementation } from '@hapi/boom';

interface IListOptions {
  limit: number;
  page: number;
  sort: { name: string; order: "asc" | "desc" };
  filter: {
    caseId?: string;
    doctorId?: string;
    status?: TreatmentPlanStatus;
  };
}

class TreatmentPlanRepository extends BaseRepository<TreatmentPlan, string> {
  protected get model() {
    return this.prisma.treatmentPlan;
  }

  async list(options:IListOptions ) {
    console.log('---------options------------',options)
    const { limit, page, sort, filter } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filter.caseId) where.caseId = filter.caseId;
    if (filter.doctorId) where.doctorId = filter.doctorId;
    if (filter.status) where.status = filter.status;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort.name]: sort.order },
        include: {
          doctor: { select: { id: true, name: true, email: true } },
          case: { select: { id: true, description: true, status: true } },
          payments: true,
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      result: data,
      total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    };
  };


  async getAllTreatmentPlans(options: Record<string, any>) {
    return this.model.findMany({
      include: {
        doctor: true,
        case: true,
        payments: true,
      },
    });
  };

  async getTreatmentPlanDetails(id: string) {
    console.log('---------id-----------', id);
    return this.model.findUnique({
      where: { id },
      include: {
        doctor: true,
        case: true,
        payments: true,
      },
    });
  };

  async createTreatmentPlan(data: {
    caseId: string;
    doctorId: string;
    summary: string;
    medication?: string;
    estimatedCost: number;
    status?: TreatmentPlanStatus;
  }) {
    return this.model.create({
      data,
    });
  };

  async updateTreatmentPlan(
    id: string,
    data: Partial<{
      summary: string;
      medication?: string;
      estimatedCost: number;
      status: TreatmentPlanStatus;
    }>
  ) {
    return this.model.update({
      where: { id },
      data,
    });
  };

  async removeTreatmentPlan(id: string) {
    try {
      await this.model.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  };

}

const treatmentPlanRepository = new TreatmentPlanRepository();
export { treatmentPlanRepository as TreatmentPlanRepository };
