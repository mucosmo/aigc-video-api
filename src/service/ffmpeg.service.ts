import { Provide, Inject } from '@midwayjs/core';
// import { IUserOptions } from '../interface';

import { exec } from 'child_process';

import { RedisService } from '@midwayjs/redis';

import { ChildProcessService } from './process.service';
import { TaskInfoService } from './taskInfo.service'

@Provide()
export class FfmpegService {
  @Inject()
  redisService: RedisService;

  @Inject()
  cpService: ChildProcessService;

  @Inject()
  taskService: TaskInfoService;

  async execCommand(command: string, taskId: string, taskInfo: object) {
    const cp = exec(command);
    const pid = cp.pid;
    await this.cpService.create(taskId, { pid, task: 'convert ppt to video with ffpmeg', ...taskInfo });

    let lastOut: string;
    const that = this;
    cp.stderr.on('data', data => {
      console.log('---ffmpeg data:', data)
      lastOut = data;
      that.progress(data, taskId);
    })

    cp.once('close', (data) => {
      console.log('----close:', data)
      const msg = data === 0 ? 'success' : lastOut;
      const success = data === 0;
      this.cpService.close(taskId, { success, msg, command, });
    });

    cp.stderr.on('error', err => {
      console.error('---err', err)
      this.cpService.close(taskId, { success: false, command, msg: err.stack || err.message || err.name, });
    })
  }

  async progress(data: string, taskId: string) {
    const seconds = parseTime(data);
    const progress = seconds;
    const value = { progress };
    await this.taskService.update(taskId, value);
  }
}

function parseTime(data) {
  // frame=   10 fps=6.9 q=16.0 size=      45kB time=00:00:00.36 bitrate=1030.9kbits/s speed=0.249x
  let regex = /time=(\d{2}):(\d{2}):(\d{2}\.\d{1,3})/;
  let match = regex.exec(data);
  let ret = 0;
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseFloat(match[3]);
    ret = hours * 3600 + minutes * 60 + seconds;
  }
  return ret;
}