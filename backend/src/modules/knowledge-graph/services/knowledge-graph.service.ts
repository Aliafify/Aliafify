import { Injectable } from '@nestjs/common';
import { AttributeValuesRepository } from '../repositories/attribute-values.repository';
import { KgAttributesRepository } from '../repositories/attributes.repository';
import { EntitiesRepository } from '../repositories/entities.repository';
import { IntentsRepository } from '../repositories/intents.repository';

@Injectable()
export class KnowledgeGraphService {
  constructor(
    readonly entities: EntitiesRepository,
    readonly attributes: KgAttributesRepository,
    readonly attributeValues: AttributeValuesRepository,
    readonly intents: IntentsRepository,
  ) {}
}
