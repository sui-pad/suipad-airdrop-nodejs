import { CronJob } from 'cron';
import {confirmClaimResult, unlockToken} from "./claimservice.js";

const job = new CronJob('0 */1 * * * *', async function() {
    await confirmClaimResult();
}, null, true, 'Asia/Shanghai');

job.start();

const unlockJob = new CronJob('0 51 19 * * *', async function() {
    await unlockToken();
}, null, true, 'Asia/Shanghai');
unlockJob.start();

