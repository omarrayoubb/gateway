import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { HierarchyService } from './hierarchy.service';

@Controller()
export class HierarchyGrpcController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @GrpcMethod('HierarchyService', 'GetSubordinates')
  async getSubordinates(data: { employeeId: string }) {
    try {
      const subordinates = await this.hierarchyService.getSubordinates(data.employeeId);
      return {
        employees: subordinates.map(emp => this.mapEmployeeToProto(emp)),
      };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get subordinates',
      });
    }
  }

  @GrpcMethod('HierarchyService', 'GetSubordinatesTree')
  async getSubordinatesTree(data: { employeeId: string }) {
    try {
      const tree = await this.hierarchyService.getSubordinatesTree(data.employeeId);
      return this.mapTreeToProto(tree);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get subordinates tree',
      });
    }
  }

  @GrpcMethod('HierarchyService', 'GetAncestors')
  async getAncestors(data: { employeeId: string }) {
    try {
      const ancestors = await this.hierarchyService.getAncestors(data.employeeId);
      return {
        employees: ancestors.map(emp => this.mapEmployeeToProto(emp)),
      };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get ancestors',
      });
    }
  }

  @GrpcMethod('HierarchyService', 'GetOrganizationTree')
  async getOrganizationTree(data: any) {
    try {
      const trees = await this.hierarchyService.getOrganizationTree();
      return {
        trees: trees.map(tree => this.mapTreeToProto(tree)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get organization tree',
      });
    }
  }

  private mapEmployeeToProto(employee: any) {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      position: employee.position || '',
      department: employee.department || '',
      managerId: employee.managerId || employee.manager_id || '',
      hierarchyLevel: employee.hierarchyLevel || employee.hierarchy_level || 0,
    };
  }

  private mapTreeToProto(node: any): any {
    return {
      id: node.id,
      name: node.name,
      email: node.email,
      position: node.position || '',
      department: node.department || '',
      managerId: node.managerId || '',
      hierarchyLevel: node.hierarchyLevel || 0,
      subordinates: (node.subordinates || []).map((sub: any) => this.mapTreeToProto(sub)),
    };
  }
}
