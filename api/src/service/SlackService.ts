import { Service } from 'typedi';
import { SLACK_POST_URL } from '../config';

@Service()
class SlackService {

  async sendMessage(message: string): Promise<void> {
    console.log(`sendMessage called. ${SLACK_POST_URL}. ${message}`);
    if (SLACK_POST_URL) {
      const fetchData: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          text: message,
        }),
      };
      try {
        // send fetch data
        console.log(`sending message to slack: ${message}`);
        let response: Response = await fetch(SLACK_POST_URL, fetchData);
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

