import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';

@Controller()
export class KnowledgeBaseGrpcController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @GrpcMethod('KnowledgeBaseService', 'GetKnowledgeBase')
  async getKnowledgeBase(data: { id: string }) {
    const kb = await this.knowledgeBaseService.findOne(data.id);
    return this.mapKnowledgeBaseToProto(kb);
  }

  @GrpcMethod('KnowledgeBaseService', 'GetKnowledgeBases')
  async getKnowledgeBases(data: { page?: number; limit?: number; search?: string }) {
    const kbs = await this.knowledgeBaseService.findAll();
    return {
      knowledge_bases: kbs.map(kb => this.mapKnowledgeBaseToProto(kb)),
      total: kbs.length,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  @GrpcMethod('KnowledgeBaseService', 'CreateKnowledgeBase')
  async createKnowledgeBase(data: any) {
    const createDto: CreateKnowledgeBaseDto = {
      title: data.title,
      content: data.content,
      category: data.category,
    };
    const kb = await this.knowledgeBaseService.create(createDto);
    return this.mapKnowledgeBaseToProto(kb);
  }

  @GrpcMethod('KnowledgeBaseService', 'UpdateKnowledgeBase')
  async updateKnowledgeBase(data: any) {
    const updateDto: UpdateKnowledgeBaseDto = {
      title: data.title,
      content: data.content,
      category: data.category,
    };
    const kb = await this.knowledgeBaseService.update(data.id, updateDto);
    return this.mapKnowledgeBaseToProto(kb);
  }

  @GrpcMethod('KnowledgeBaseService', 'DeleteKnowledgeBase')
  async deleteKnowledgeBase(data: { id: string }) {
    await this.knowledgeBaseService.remove(data.id);
    return { success: true, message: 'Knowledge base deleted successfully' };
  }

  private mapKnowledgeBaseToProto(kb: any) {
    return {
      id: kb.id,
      title: kb.title || '',
      content: kb.content || '',
      category: kb.category || '',
      created_at: kb.createdAt?.toISOString() || '',
      updated_at: kb.updatedAt?.toISOString() || '',
    };
  }
}

