import { Provide, Inject } from '@midwayjs/core';
// import { IUserOptions } from '../interface';

import { exec } from 'child_process';

import { RedisService } from '@midwayjs/redis';

import { ChildProcessService } from './process.service';
import { TaskInfoService } from './taskInfo.service';

import axios from 'axios';


@Provide()
export class PptConvertService {
  @Inject()
  redisService: RedisService;

  @Inject()
  cpService: ChildProcessService;

  @Inject()
  taskService: TaskInfoService;

  async execCommand(command: string, taskId: string) {
    const cp = exec(command);
    const pid = cp.pid;
    await this.cpService.create(taskId, { pid, task: 'convert ppt to image with libreoffice and imageMagick', });

    let lastOut: string;
    // const that = this;

    cp.stdout.on('data', data => {
      console.log('---stdour data:', data)
      lastOut = data;
      // that.progress(data, taskId);
    })

    cp.stderr.on('data', err => {
      const errString = err.stack || err.message || err.name;
      console.log('---stderr data:', errString)
      lastOut = errString;
      this.cpService.close(taskId, { success: false, command, msg: errString, });

      // that.progress(data, taskId);
    })

    cp.on('message', msg => {
      console.log('----message', msg)
    })

    cp.once('close', (data) => {
      console.log('----close:', data);
      const success = data === 0;
      const msg = success ? 'sucess' : lastOut;
      const value = { success, msg, command, };
      this.cpService.close(taskId, { success, msg, command, });
      this.closeCallback({ taskId, ...value });

    });

    cp.on('error', err => {
      console.error('======err', err)
      this.cpService.close(taskId, { success: false, command, msg: err.stack || err.message || err.name, });
    })
  }

  async progress(data: string, taskId: string) {
    const seconds = parseTime(data);
    const progress = seconds;
    const value = { progress };
    await this.taskService.update(taskId, value);
  }

  async closeCallback(data: any) {
    const url = process.env.PPT_TO_IMAGE_CALLBACK_URL;
    axios.post(url, data).then(res => {
      console.log(res.data)
    }).catch(err => {
      console.error(err)
    })
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


// pdf to image

// pdf.js  https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.js

// pdf2pic https://www.npmjs.com/package/pdf2pic

// const { exec } = require('child_process');

// const inputFile = 'zhigan-27p.pptx';
// const outputFile = 'output';

// // soffice => gs => converter

// let t1= new Date();

// let command = `libreoffice --headless --convert-to pdf ${inputFile} --out ${outputFile}/ada.pdf`;

// // command = `nice -n 0 convert -density 300 -resize 1280x720 output/zhigan-27p.pdf output/enai/output-%03d.png`

// exec(command, (error, stdout, stderr) => {
//     if (error) {
//         console.error('Conversion error:', error);
//     } else {
//         console.log(stdout);
//         console.log(stderr.data);
//         console.log(new Date() - t1)
//     }
// });
