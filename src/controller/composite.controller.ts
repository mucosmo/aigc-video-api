import { Inject, Controller, Post, Body, ALL } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { FfmpegService } from '../service/ffmpeg.service';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  ffmpegService: FfmpegService;

  @Post('/video/composite')
  async videoComposite(@Body(ALL) params: any) {
    const { command, taskId } = params;
    const ret = await this.ffmpegService.execCommand(command, taskId, { duration: 10 });
    this.ctx.body = ret;
  }
}
