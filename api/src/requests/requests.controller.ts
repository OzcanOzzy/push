import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserPayloadDecorator } from '../shared/decorators/user-payload.decorator';
import type { UserPayload } from '../shared/types/user-payload';
import { CreateConsultantRequestDto } from './dto/create-consultant-request.dto';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { RequestsService } from './requests.service';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('customer')
  createCustomer(@Body() body: CreateCustomerRequestDto) {
    return this.requestsService.createCustomerRequest(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer')
  getCustomers(@Query('status') status?: string) {
    return this.requestsService.getCustomerRequests(status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('consultant')
  createConsultant(
    @Body() body: CreateConsultantRequestDto,
    @UserPayloadDecorator() user: UserPayload,
  ) {
    return this.requestsService.createConsultantRequest(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('consultant')
  getConsultants(@Query('status') status?: string) {
    return this.requestsService.getConsultantRequests(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch('customer/:id/status')
  updateCustomerStatus(
    @Param('id') id: string,
    @Body() body: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateCustomerStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch('consultant/:id/status')
  updateConsultantStatus(
    @Param('id') id: string,
    @Body() body: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateConsultantStatus(id, body.status);
  }
}
