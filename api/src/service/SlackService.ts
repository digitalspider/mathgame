import { Service } from 'typedi';
import { SLACK_WEBHOOK } from '../config';

@Service()
class SlackService {

  async sendMessage(message: string): Promise<void> {
    if (SLACK_WEBHOOK) {
      const fetchData: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          data: message,
        }),
      };
      // asynchronously send fetch data
      fetch(SLACK_WEBHOOK, fetchData);
    }
  }
}

export { SlackService };

