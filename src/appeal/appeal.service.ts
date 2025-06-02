import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appeal } from './entities/appeal.entity';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { CancelAppealDto } from './dto/cancel-appeal.dto';
import { CompleteAppealDto } from './dto/complete-appeal.dto';

@Injectable()
export class AppealService {
  constructor(
    @InjectRepository(Appeal)
    private appealRepository: Repository<Appeal>,
  ) {}

  async create(dto: CreateAppealDto): Promise<Appeal> {
    const appeal = this.appealRepository.create(dto);
    return await this.appealRepository.save(appeal);
  }

  async take(id: string): Promise<Appeal> {
    const appeal = await this.appealRepository.findOneBy({ id });
    if (!appeal || appeal.status !== 'новое')
      throw new Error('Неверное обращение или статус заявления');
    appeal.status = 'в процессе';
    appeal.takenAt = new Date();
    return await this.appealRepository.save(appeal);
  }

  async complete(id: string, dto: CompleteAppealDto): Promise<Appeal> {
    const appeal = await this.appealRepository.findOneBy({ id });
    if (!appeal || appeal.status !== 'в процессе')
      throw new Error('Неверное обращение или статус заявления');
    appeal.status = 'завершено';
    appeal.resolution = dto.resolution;
    appeal.completedAt = new Date();
    return await this.appealRepository.save(appeal);
  }

  async cancel(id: string, dto: CancelAppealDto): Promise<Appeal> {
    const appeal = await this.appealRepository.findOneBy({ id });
    if (!appeal || !['новое', 'в процессе'].includes(appeal.status))
      throw new Error('Нельзя отменить');
    appeal.status = 'отменено';
    appeal.cancellationReason = dto.reason;
    appeal.cancelledAt = new Date();
    return await this.appealRepository.save(appeal);
  }

  async findAll(
    date?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<Appeal[]> {
    const qb = this.appealRepository.createQueryBuilder('appeal');
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('appeal.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      qb.andWhere('appeal.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: from,
        toDate: to,
      });
    }

    return await qb.getMany();
  }

  async cancelAllInProgress(): Promise<number> {
    const appeals = await this.appealRepository.find({
      where: { status: 'в процессе' },
    });

    for (const appeal of appeals) {
      appeal.status = 'отменено';
      appeal.cancellationReason = 'Автоматически отменено';
      appeal.cancelledAt = new Date();
      await this.appealRepository.save(appeal);
    }

    return appeals.length;
  }
}
