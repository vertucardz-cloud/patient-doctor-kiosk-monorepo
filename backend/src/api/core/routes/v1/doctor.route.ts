import { Router } from '@classes';
import { DoctorController } from '@controllers/doctor.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Validator } from '@middlewares/validator.middleware';
import { ROLE, MIME_TYPE } from '@enums';

import { listDoctors, getDoctor, createDoctor, replaceDoctor, updateDoctor, removeDoctor } from '@validations/doctor.validation';

export class DoctorRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router.route('/')
      .get(Validator.check(listDoctors), DoctorController.getDoctors)
      .post(Guard.authorize([ROLE.admin]), Validator.check(createDoctor), DoctorController.createDoctor);

    this.router.route('/:doctorId')
      .get(Validator.check(getDoctor), DoctorController.getDoctorById)
      .patch(Guard.authorize([ROLE.admin, ROLE.doctor]), Validator.check(getDoctor), DoctorController.deactivateDoctor)
      .put(Guard.authorize([ROLE.admin, ROLE.doctor]), Validator.check(updateDoctor), DoctorController.updateDoctor)
      .delete(Guard.authorize([ROLE.admin]), Validator.check(removeDoctor), DoctorController.deleteDoctor);

    // this.router.route('/:doctorId/cases').get(DoctorController.getDoctorCases);
  }

}
