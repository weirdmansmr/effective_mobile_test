import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { CancelAppealDto } from './dto/cancel-appeal.dto';
import { CompleteAppealDto } from './dto/complete-appeal.dto';
import { AppealService } from './appeal.service';
import { Appeal } from './entities/appeal.entity';

@Controller('appeals')
export class AppealController {
  constructor(private readonly appealService: AppealService) {}

  @Post()
  async create(@Body() dto: CreateAppealDto): Promise<Appeal> {
    return await this.appealService.create(dto);
  }

  @Post(':id/take')
  async take(@Param('id') id: string): Promise<Appeal> {
    try {
      return await this.appealService.take(id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteAppealDto,
  ): Promise<Appeal> {
    try {
      return await this.appealService.complete(id, dto);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelAppealDto,
  ): Promise<Appeal> {
    try {
      return await this.appealService.cancel(id, dto);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async getAll(
    @Query('date') date?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<Appeal[]> {
    return await this.appealService.findAll(date, fromDate, toDate);
  }

  @Post('cancel-all')
  async cancelAllInProgress(): Promise<{ count: number }> {
    const count = await this.appealService.cancelAllInProgress();
    return { count };
  }
}
