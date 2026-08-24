import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { EMAILS_JOBS } from './constants/emails.constant';

@Processor('emails')
export class EmailsProcessor extends WorkerHost {
  process(job: Job): any {
    switch (job.name) {
      case EMAILS_JOBS.WELCOME:
        console.log(`Sending welcome email to ${job.data.email}.`);
        break;

      default:
        break;
    }
  }
}
