import { forbidden, notFound } from '@hapi/boom';

import { IUserRequest, IResponse } from '@interfaces';
import { Safe } from '@decorators/safe.decorator';
import { paginate } from '@utils/pagination.util';
import { UserRepository } from '@repositories/user.repository';
import { User } from '@prisma/client';
import { Request } from 'express';

/**
 * Manage incoming requests for api/{version}/users
 */
class UserController {
  private static instance: UserController;

  private constructor() {}

  static get(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  @Safe()
  async get(req: IUserRequest, res: IResponse): Promise<void> {
    const userId = req.params.userId;
    const user = await UserRepository.findById(userId);
    if (!user) throw notFound('User not found');
    res.locals.data = user;
  }

  @Safe()
  async loggedIn(req: IUserRequest, res: IResponse): Promise<void> {
    const userId = req?.user?.id;
    if (!userId) throw notFound('Please provide correct Id');
    const user = await UserRepository.findById(userId as string);
    if (!user) throw notFound('Logged in user not found');
    res.locals.data = user;
  }

  @Safe()
  async create(req: Request, res: IResponse): Promise<void> {
    const newUser = await UserRepository.create(req.body as User);
    res.locals.data = newUser;
  }

  @Safe()
  async update(req: IUserRequest, res: IResponse): Promise<void> {
    const userId = req.params.userId;
    const existingUser = await UserRepository.findById(userId);

    if (!existingUser) throw notFound('User not found');

    if (req.body.password && req.body.isUpdatePassword) {
      const pwdMatch = await UserRepository.passwordMatches(existingUser.email, req.body.passwordToRevoke as string);
      if (!pwdMatch) throw forbidden('Password to revoke does not match');
    }

    const updatedUser = await UserRepository.update(userId, req.body);
    res.locals.data = updatedUser;
  }

  @Safe()
  async list(req: IUserRequest, res: IResponse): Promise<void> {
    const page = parseInt(req.query.page as string, 10) || 1;
    const perPage = parseInt(req.query.perPage as string, 10) || 10;

    const { users, total } = await UserRepository.paginate(page, perPage);

    res.locals.data = users
    res.locals.meta = {
      total,
      pagination: paginate(page, perPage, total),
    };
  }

  @Safe()
  async remove(req: IUserRequest, res: IResponse): Promise<void> {
    const userId = req.params.userId;
    const user = await UserRepository.findById(userId);

    if (!user) throw notFound('User not found');

    await UserRepository.remove(userId);
  }
}

const userController = UserController.get();

export { userController as UserController };
