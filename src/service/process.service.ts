import { Provide, Inject } from '@midwayjs/core';

import { RedisService } from '@midwayjs/redis';

import { TaskInfoService } from './taskInfo.service';

import * as kill from 'tree-kill';

import * as moment from 'moment';


@Provide()
export class ChildProcessService {
    @Inject()
    redisService: RedisService;

    @Inject()
    taskInfoService: TaskInfoService;

    async close(taskId: string, data: object) {
        const storedData = await this.taskInfoService.getInfo(taskId);
        const pid = storedData.pid;
        const startAt = storedData.startAt;
        const endAt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        const timeConsumed = (moment(endAt).valueOf() - moment(startAt).valueOf()) / 1000;
        const value = { status: 'closed', timeConsumed, endAt, statusCode: 0, ...data, };
        kill(pid);
        this.taskInfoService.update(taskId, value);
    }

    async create(taskId: string, data: object) {
        const value = { taskId, ...data, status: 'running', statusCode: 1, startAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS') };
        await this.taskInfoService.create(taskId, value);
    }


}