import {Body, Controller, Get, Post, Req, Res, Render, Redirect, UseBefore} from 'routing-controllers';
import {User} from '../model/User';
import {UserService} from '../service/UserService';
import passport from 'passport';
import {Response, Request, NextFunction} from 'express';
import {ensureAuthenticated} from '../middleware/auth';
import {IVerifyOptions} from 'passport-local';
import {postLogin} from '../config/passport';

@Controller()
class IndexController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Get("/")
  @UseBefore(ensureAuthenticated)
  @Render("index")
  index(@Req() req: Request) {
    const params = {user: req.user};
    return params;
  }

  @Get("/login")
  @Render("login")
  login(@Res() res: Response) {
    const params = {};
    return params;
  }

  @Get("/register")
  @Render("register")
  register(@Res() res: Response) {
    const params = {};
    return params;
  }

  /**
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (_http_outgoing.js:470:11)
    at ServerResponse.header (C:\code\david\mathgame\api\node_modules\express\lib\response.js:771:10)
    at ServerResponse.location (C:\code\david\mathgame\api\node_modules\express\lib\response.js:888:15)
    at ServerResponse.redirect (C:\code\david\mathgame\api\node_modules\express\lib\response.js:926:18)
    at req.logIn (C:\code\david\mathgame\api\src\controller\IndexController.ts:52:17)
    at C:\code\david\mathgame\api\node_modules\passport\lib\http\request.js:51:48
    at C:\code\david\mathgame\api\node_modules\passport\lib\sessionmanager.js:16:14
    at pass (C:\code\david\mathgame\api\node_modules\passport\lib\authenticator.js:297:14)
    at Authenticator.serializeUser (C:\code\david\mathgame\api\node_modules\passport\lib\authenticator.js:299:5)
    at SessionManager.logIn (C:\code\david\mathgame\api\node_modules\passport\lib\sessionmanager.js:14:8)
*
  @Post("/login")
  loginPost(@Req() req: Request, @Res() res: Response, next: Function) {
    passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
        if (err && next) { return next(err); }
        if (!user) {
          return res.redirect("/login?error="+(info && info.message));
        } else {
          req.logIn(user, (err) => {
              if (err && next) { return next(err); }
              res.redirect(req.session && req.session.returnTo || "/");
          });
        }
    })(req, res, next);
  }
*/

  @Get("/logout")
  @Redirect("/login")
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
  }
}

export {IndexController};

