import { Injectable } from '@nestjs/common';
import {
  SeoPageRelationsRepository,
  UpsertSeoPageRelationInput,
} from '../repositories/seo-page-relations.repository';

@Injectable()
export class LinkGraphService {
  constructor(private readonly relations: SeoPageRelationsRepository) {}

  replaceOutgoing(
    sourcePageId: string,
    relations: Omit<UpsertSeoPageRelationInput, 'sourcePageId'>[],
  ) {
    return this.rebuildOutgoing(sourcePageId, relations);
  }

  private async rebuildOutgoing(
    sourcePageId: string,
    relations: Omit<UpsertSeoPageRelationInput, 'sourcePageId'>[],
  ) {
    await this.relations.deleteOutgoing(sourcePageId);
    return Promise.all(
      relations.map((relation) =>
        this.relations.upsert({ sourcePageId, ...relation }),
      ),
    );
  }
}
