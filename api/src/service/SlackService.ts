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
      try {
        // send fetch data
        let response: Response = await fetch(SLACK_WEBHOOK, fetchData);
        if (!response.ok) {
          console.error(`Could not update Slack. status=${response.status}. text=${response.statusText}`);
        }
      } catch (err) {
        console.error(`Could not update Slack. error=${err.message}`);
      }
    }
  }
}

export { SlackService };

