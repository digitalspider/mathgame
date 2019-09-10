import { BadRequestError, Body, Get, JsonController, Param, Post, Put } from 'routing-controllers';
import { User } from '../../model/User';
import { UserService } from '../../service/UserService';
import "reflect-metadata";

@JsonController()
class UserController {
  constructor(
    private userService: UserService
  ) {
  }

  @Get("/user/:username")
  get(@Param('username') username: string) {
    let user = this.userService.getUser(username);
    return user;
  }

  @Post("/user/:username")
  create(@Param('username') username: string) {
    let user = this.userService.createUser(username);
    return user;
  }

  @Put("/user/:username")
  update(@Param('username') username: string, @Body() user: User) {
    if (username !== user.username) {
      throw new BadRequestError(`Cannot change username in update. Username=${username}`);
    }
    let updatedUser = this.userService.updateUser(user);
    return updatedUser;
  }
}

export { UserController }