import { Request} from "express";
import { badRequest, notFound } from "@hapi/boom";
import { IResponse } from "@interfaces";
import { Safe } from "@decorators/safe.decorator";
import { DoctorRepository } from "@repositories/doctor.repository";
import { toDoctorResponseDto, DoctorCreateDto, DoctorUpdateDto } from "@dtos/doctor.dto";

class DoctorController {
  private static instance: DoctorController;
  private constructor() {}

  static get(): DoctorController {
    if (!DoctorController.instance) {
      DoctorController.instance = new DoctorController();
    }
    return DoctorController.instance;
  }

  @Safe()
  async getDoctors(_: Request, res: IResponse): Promise<void> {
    const doctors = await DoctorRepository.findAll();
    res.locals.data = doctors.map(toDoctorResponseDto) as Record<string, any>;
  }

  @Safe()
  async getDoctorById(req: Request, res: IResponse): Promise<void> {
    const doctor = await DoctorRepository.findById(req.params.doctorId);
    if (!doctor) throw notFound("Doctor not found");
    res.locals.data = toDoctorResponseDto(doctor) as Record<string, any>;
  }

  @Safe()
  async createDoctor(req: Request, res: IResponse): Promise<void> {
    const dto: DoctorCreateDto = req.body;
    const doctor = await DoctorRepository.createDoctor(dto);
    res.locals.data = toDoctorResponseDto(doctor) as Record<string, any>;
  }

  @Safe()
  async deactivateDoctor(req: Request, res: IResponse): Promise<void> {
    const doctorId = req.params.doctorId;
    const dto: DoctorCreateDto = req.body;
    const doctor = await DoctorRepository.deactivate(doctorId,dto);
    res.locals.data = toDoctorResponseDto(doctor) as Record<string, any>;
  }


  
  @Safe()
  async updateDoctor(req: Request, res: IResponse): Promise<void> {
    const dto: DoctorUpdateDto = req.body;
    const doctor = await DoctorRepository.updateDoctor(req.params.doctorId, dto);
    res.locals.data = toDoctorResponseDto(doctor) as Record<string, any>;
  }

  @Safe()
  async deleteDoctor(req: Request, res: IResponse): Promise<void> {
    await DoctorRepository.deleteDoctor(req.params.doctorId);
    res.locals.data = {};
  }
}

const doctorController = DoctorController.get();
export { doctorController as DoctorController };
