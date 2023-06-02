import { Provide, Inject } from '@midwayjs/core';

import { RedisService } from '@midwayjs/redis';

import { TaskInfoService } from './taskInfo.service';

import * as kill from 'tree-kill';


@Provide()
export class ChildProcessService {
    @Inject()
    redisService: RedisService;

    @Inject()
    taskInfoService: TaskInfoService;

    async close(taskId: string, data: object) {
        const value = { status: 'closed', statusCode: 0, ...data };
        const pid = (await this.taskInfoService.getInfo(taskId)).pid;
        kill(pid);
        this.taskInfoService.update(taskId, value);
    }

    async create(taskId: string, data: object) {
        const value = { taskId, ...data, status: 'running', statusCode: 1 };
        await this.taskInfoService.create(taskId, value);
    }


}