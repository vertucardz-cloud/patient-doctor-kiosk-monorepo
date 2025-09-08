import { Prisma } from '@services/prisma.service';
import { Doctor, Prisma as Prismas } from '@prisma/client';
import { notFound,conflict, badRequest, badImplementation } from '@hapi/boom';
import { BaseRepository } from './base.repository';
import {generateApiKey} from '@utils/string.util'

class DoctorRepository extends BaseRepository<Doctor, string> {
  protected get model() {
    return this.prisma.doctor;
  }

  async deactivate(id: string, updateData: any): Promise<Doctor> {
    try {
      return await this.model.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new Error(`Doctor deactivate failed: ${error}`);
    }
  }

  async findById(id: string): Promise<Doctor> {
    try {
      const doctor = await this.model.findUnique({ where: { id },  include: { user: true, cases: true } });
      if (!doctor) throw notFound('Doctor not found');
      return doctor;
    } catch (error) {
      throw new Error(`Franchise findById failed: ${error}`);
    }
  }

  async findAll(): Promise<Doctor[]> {
    try {
      return await this.model.findMany({ where: { isActive: true } });
    } catch (error) {
      throw new Error(`Doctor findAll failed: ${error}`);
    }
  }

  async createDoctor(data: any) {
    return Prisma.client.$transaction(async (tx) => {
      // 1. Check required fields
      if (!data.username || !data.email || !data.password) {
        throw badRequest("Missing required user fields");
      }

      // 2. Check conflict: username or email already exists
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [{ username: data.username }, { email: data.email.toLowerCase()}],
        },
      });

      if (existingUser) {
        throw conflict("Username or email already exists");
      }

      const existingPhone = await tx.doctor.findFirst({
        where: { phone: data.phone},
      });

      if (existingPhone) {
        throw conflict("Contact already exists");
      }

      // 3. Create User with role = doctor
      const user = await tx.user.create({
        data: {
          username: data.username,
          email: data.email.toLowerCase(),
          password: data.password,
          apikey: generateApiKey(),
          role: "doctor",
        },
      });

      // 4. Create Doctor linked to User
      return tx.doctor.create({
        data: {
          userId: user.id,
          name: data.name,
          specialty: data.specialty,
          phone: data.phone,
          email: user.email,
        },
      });
    });
  }

  async updateDoctor(id: string, data: any) {
    const {
      username,
      email,
      isUpdatePassword,
      password,
      passwordToRevoke,
      name,
      specialty,
      phone,
      status
    } = data;

    const doctor =  await this.findById(id);
    if(!doctor) throw notFound('Doctor not found');
  
    const doctorFields: Prismas.DoctorUpdateInput = {};
    const userFields: Prismas.UserUpdateInput = {};
  
    // Doctor fields
    if (name) doctorFields.name = name;
    if (specialty) doctorFields.specialty = specialty;
    if (phone) doctorFields.phone = phone;
    if (status) doctorFields.isActive = status === 'active';
  
    // User fields
    if (username) userFields.username = username;
    if (email) {
      userFields.email = email
      doctorFields.email = email
    };
  
    // Password update
    if (isUpdatePassword) {
      if (!password || !passwordToRevoke) {
        throw new Error('Password and old password are required for update');
      }
      userFields.password = password;
    }
  
    // Transaction: update user first, then doctor
    return Prisma.client.$transaction(async (tx) => {
      if (Object.keys(userFields).length > 0) {

        await tx.user.update({
          where: { id: doctor.userId},
          data: userFields
        });
      }

      return tx.doctor.update({
        where: { id },
        data: doctorFields
      });
    });
  }
  
  async deleteDoctor(id: string) {
    
    // Soft-delete doctor
    const doctor = await this.model.update({
      where: { id },
      data: { isActive: false }
    });
    
    // Optional: deactivate associated user
    await Prisma.client.user.update({
      where: { id: doctor.userId },
      data: { deletedAt: new Date() }
    });


    return doctor;
  }

}

const doctorRepository = new DoctorRepository();
export { doctorRepository as DoctorRepository };



