import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Employee } from '../people/entities/person.entity';

export interface EmployeeTreeNode {
  id: string;
  name: string;
  email: string;
  position: string | null;
  department: string | null;
  managerId: string | null;
  hierarchyLevel: number;
  subordinates: EmployeeTreeNode[];
}

@Injectable()
export class HierarchyService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async getSubordinates(employeeId: string): Promise<Employee[]> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return await this.employeeRepository.find({
      where: { managerId: employeeId },
      order: { name: 'ASC' },
    });
  }

  async getSubordinatesTree(employeeId: string): Promise<EmployeeTreeNode> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return await this.buildTree(employee, 0);
  }

  async getAncestors(employeeId: string): Promise<Employee[]> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const ancestors: Employee[] = [];
    let currentEmployee = employee;

    while (currentEmployee.managerId) {
      const manager = await this.employeeRepository.findOne({
        where: { id: currentEmployee.managerId },
      });

      if (!manager) {
        break;
      }

      ancestors.push(manager);
      currentEmployee = manager;
    }

    return ancestors;
  }

  async getOrganizationTree(): Promise<EmployeeTreeNode[]> {
    // Get all employees without managers (top-level)
    const topLevelEmployees = await this.employeeRepository.find({
      where: { managerId: IsNull() },
      order: { name: 'ASC' },
    });

    const trees: EmployeeTreeNode[] = [];
    for (const employee of topLevelEmployees) {
      trees.push(await this.buildTree(employee, 0));
    }

    return trees;
  }

  async calculateHierarchyLevel(employeeId: string): Promise<number> {
    const ancestors = await this.getAncestors(employeeId);
    return ancestors.length;
  }

  async updateHierarchyLevels(): Promise<void> {
    const allEmployees = await this.employeeRepository.find();

    for (const employee of allEmployees) {
      const level = await this.calculateHierarchyLevel(employee.id);
      employee.hierarchyLevel = level;
      await this.employeeRepository.save(employee);
    }
  }

  private async buildTree(employee: Employee, level: number): Promise<EmployeeTreeNode> {
    const subordinates = await this.employeeRepository.find({
      where: { managerId: employee.id },
      order: { name: 'ASC' },
    });

    const node: EmployeeTreeNode = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      managerId: employee.managerId,
      hierarchyLevel: level,
      subordinates: [],
    };

    for (const subordinate of subordinates) {
      node.subordinates.push(await this.buildTree(subordinate, level + 1));
    }

    return node;
  }
}
