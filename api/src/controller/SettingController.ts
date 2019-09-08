import { SettingService } from '../service/SettingService';
import { JsonController, Get } from 'routing-controllers';

@JsonController()
class SettingController {
  constructor(
    private settingService: SettingService,
  ) {
  }

  @Get("/settings")
  get() {
    let settings = this.settingService.getAllSettings();
    return settings;
  }
}

export { SettingController }
