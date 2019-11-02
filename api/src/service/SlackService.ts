import { Service } from 'typedi';
import { SLACK_POST_URL } from '../config';
import Axios, { AxiosResponse } from 'axios';

@Service()
class SlackService {

  async sendMessage(message: string): Promise<void> {
    if (SLACK_POST_URL) {
      const postData = JSON.stringify({
        text: message,
      });
      try {
        // send fetch data
        console.log(`sending message to slack: ${message}`);
        // Performing a POST request
        let response: AxiosResponse = await Axios.post(SLACK_POST_URL, postData);
        if (response.status !== 200) {
          console.error(`Could not update Slack. status=${response.status}. text=${response.statusText}`);
        }
      } catch (err) {
        console.error(`Could not update Slack. error=${err.message}`);
      }
    }
  }
}

export { SlackService };

