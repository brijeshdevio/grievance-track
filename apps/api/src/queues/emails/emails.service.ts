import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { EMAILS_JOBS } from './constants/emails.constant';
import { SendWelcomeEmail } from './types/emails.type';

@Injectable()
export class EmailsService {
  constructor(
    @InjectQueue('emails')
    private readonly emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(data: SendWelcomeEmail) {
    await this.emailQueue.add(EMAILS_JOBS.WELCOME, data);
  }
}
