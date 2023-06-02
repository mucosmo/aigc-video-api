import { Provide, Inject } from '@midwayjs/core';

import { RedisService } from '@midwayjs/redis';


const ONE_MONTH_SECONDS = 30 * 24 * 60 * 60;

@Provide()
export class TaskInfoService {
    @Inject()
    redisService: RedisService;

    async create(taskId: string, data: object) {
        const key = this.getKey(taskId);
        await this.redisService.set(key, JSON.stringify(data), 'EX', ONE_MONTH_SECONDS);
    }

    async update(taskId: string, data: any) {
        const key = this.getKey(taskId);
        const Info = await this.getInfo(taskId);
        const value = { ...Info, ...data };
        await this.redisService.set(key, JSON.stringify(value), 'EX', ONE_MONTH_SECONDS);
    }

    async getInfo(taskId: string) {
        const key = this.getKey(taskId);
        const data = await this.redisService.get(key);
        return JSON.parse(data);
    }

    getKey(taskId: string) {
        return 'aigc:' + taskId;
    }

}