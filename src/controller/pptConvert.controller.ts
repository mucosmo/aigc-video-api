import { Controller,Inject, Post, Body, ALL } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import { PptConvertService } from '../service/pptConvert.service';


@Controller('/api')
export class PptConvertController {
  @Inject()
  ctx: Context;

  @Inject()
  convertService: PptConvertService;


  @Post('/ppt/image') 
  async ppt2Image(@Body(ALL) params: any) {
    const ret = await this.convertService.execCommand(params);
    this.ctx.body = ret;
  }
}
