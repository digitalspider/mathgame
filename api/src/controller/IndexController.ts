import {Body, Controller, Get, Post, Req, Res, Render, Redirect, UseBefore} from 'routing-controllers';
import {User} from '../model/User';
import {UserService} from '../service/UserService';
import passport = require('passport');
import {Response, Request} from 'express';
import {ensureAuthenticated} from '../middleware/auth';

@Controller()
class IndexController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Get("/")
  @UseBefore(ensureAuthenticated)
  @Render("index")
  index(@Res() res: Response) {
    const params = {};
    return params;
  }

  @Get("/login")
  @Render("login")
  login(@Res() res: Response) {
    const params = {};
    return params;
  }
  
  @Post("/login")
  @Redirect("/")
  loginPost(@Body() user: User, @Res() res: Response) {
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true });
    this.userService.updateUser(user);
  }

  @Get("/register")
  @Render("register")
  register(@Res() res: Response) {
    const params = {};
    return params;
  }

  @Get("/logout")
  @Redirect("/login")
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
  }
}

export {IndexController};

