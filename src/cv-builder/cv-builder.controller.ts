import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  UpdateCVSectionDto,
  CreateCVPersonalInfoDto,
  CreateCVSkillDto,
  UpdateCVSkillDto,
  CreateCVExperienceDto,
  UpdateCVExperienceDto,
  CreateCVEducationDto,
  UpdateCVEducationDto,
  CreateCVCertificationDto,
  UpdateCVCertificationDto,
  CreateCVAwardDto,
  UpdateCVAwardDto,
  CreateCVInterestDto,
  UpdateCVInterestDto,
  CreateCVReferenceDto,
  UpdateCVReferenceDto,
  CVQueryDto,
  CVSectionResponseDto,
  CVSectionsListDto,
  CVPersonalInfoResponseDto,
  CVSkillResponseDto,
  CVSkillsListDto,
  CVExperienceResponseDto,
  CVExperienceListDto,
  CVEducationResponseDto,
  CVEducationListDto,
  CVCertificationResponseDto,
  CVCertificationsListDto,
  CVAwardResponseDto,
  CVAwardsListDto,
  CVInterestResponseDto,
  CVInterestsListDto,
  CVReferenceResponseDto,
  CVReferencesListDto,
  UpdateCVPersonalInfoDto,
} from './dto/cv-builder.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import type { UserProfile } from '../auth/types/auth.types';

import { CompleteCVResponse } from './types/cv-builder.types';
import { CVBuilderService } from './cv-builder.service';

@Controller('cv-builder')
export class CVBuilderController {
  constructor(private readonly cvBuilderService: CVBuilderService) {}

  @Put('sections/:name')
  @UseGuards(AuthGuard)
  async updateCVSection(
    @Request() req: { user: UserProfile },
    @Param('name') sectionName: string,
    @Body() dto: UpdateCVSectionDto,
  ): Promise<{ data: CVSectionResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.updateCVSection(
      req.user,
      sectionName,
      dto,
    );
    return {
      data: result,
      message: 'CV section updated successfully',
      status: 'success',
    };
  }

  @Get('sections')
  async getCVSections(): Promise<{
    data: CVSectionsListDto;
    message: string;
    status: string;
  }> {
    const sections = await this.cvBuilderService.getCVSections();
    const result = {
      data: sections,
      total: sections.length,
      page: 1,
      limit: sections.length,
      next: null,
      prev: null,
    };
    return {
      data: result,
      message: 'CV sections retrieved successfully',
      status: 'success',
    };
  }

  // Personal Info Management
  @Post('personal-info')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdatePersonalInfo(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVPersonalInfoDto,
  ): Promise<{
    data: CVPersonalInfoResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.createOrUpdatePersonalInfo(
      req.user,
      dto,
    );
    return {
      data: result,
      message: 'Personal information created/updated successfully',
      status: 'success',
    };
  }

  @Get('personal-info')
  @UseGuards(AuthGuard)
  async getPersonalInfo(@Request() req: { user: UserProfile }): Promise<{
    data: CVPersonalInfoResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getPersonalInfo(req.user);
    return {
      data: result,
      message: result
        ? 'Personal information retrieved successfully'
        : 'Personal information not found',
      status: 'success',
    };
  }

  @Put('personal-info')
  @UseGuards(AuthGuard)
  async updatePersonalInfo(
    @Request() req: { user: UserProfile },
    @Body() dto: UpdateCVPersonalInfoDto,
  ): Promise<{
    data: CVPersonalInfoResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.updatePersonalInfo(
      req.user,
      dto,
    );
    return {
      data: result,
      message: 'Personal information updated successfully',
      status: 'success',
    };
  }

  // Skills Management
  @Post('skills')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSkill(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVSkillDto,
  ): Promise<{ data: CVSkillResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.createSkill(req.user, dto);
    return {
      data: result,
      message: 'Skill created successfully',
      status: 'success',
    };
  }

  @Put('skills/:id')
  @UseGuards(AuthGuard)
  async updateSkill(
    @Request() req: { user: UserProfile },
    @Param('id') skillId: string,
    @Body() dto: UpdateCVSkillDto,
  ): Promise<{ data: CVSkillResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.updateSkill(
      req.user,
      skillId,
      dto,
    );
    return {
      data: result,
      message: 'Skill updated successfully',
      status: 'success',
    };
  }

  @Delete('skills/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(
    @Request() req: { user: UserProfile },
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteSkill(req.user, skillId);
  }

  @Get('skills/:id')
  @UseGuards(AuthGuard)
  async getSkill(@Param('id') skillId: string): Promise<{
    data: CVSkillResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getSkill(skillId);
    return {
      data: result,
      message: result ? 'Skill retrieved successfully' : 'Skill not found',
      status: 'success',
    };
  }

  @Get('skills')
  @UseGuards(AuthGuard)
  async getSkills(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CVSkillsListDto; message: string; status: string }> {
    const { data, total } = await this.cvBuilderService.getSkills(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'Skills retrieved successfully',
      status: 'success',
    };
  }

  // Experience Management
  @Post('experience')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createExperience(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVExperienceDto,
  ): Promise<{
    data: CVExperienceResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.createExperience(req.user, dto);
    return {
      data: result,
      message: 'Experience created successfully',
      status: 'success',
    };
  }

  @Put('experience/:id')
  @UseGuards(AuthGuard)
  async updateExperience(
    @Request() req: { user: UserProfile },
    @Param('id') experienceId: string,
    @Body() dto: UpdateCVExperienceDto,
  ): Promise<{
    data: CVExperienceResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.updateExperience(
      req.user,
      experienceId,
      dto,
    );
    return {
      data: result,
      message: 'Experience updated successfully',
      status: 'success',
    };
  }

  @Delete('experience/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExperience(
    @Request() req: { user: UserProfile },
    @Param('id') experienceId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteExperience(req.user, experienceId);
  }

  @Get('experience/:id')
  @UseGuards(AuthGuard)
  async getExperience(@Param('id') experienceId: string): Promise<{
    data: CVExperienceResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getExperience(experienceId);
    return {
      data: result,
      message: result
        ? 'Experience retrieved successfully'
        : 'Experience not found',
      status: 'success',
    };
  }

  @Get('experience')
  @UseGuards(AuthGuard)
  async getExperiences(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CVExperienceListDto; message: string; status: string }> {
    const { data, total } = await this.cvBuilderService.getExperiences(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'Experiences retrieved successfully',
      status: 'success',
    };
  }

  // Education Management
  @Post('education')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEducation(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVEducationDto,
  ): Promise<{
    data: CVEducationResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.createEducation(req.user, dto);
    return {
      data: result,
      message: 'Education created successfully',
      status: 'success',
    };
  }

  @Put('education/:id')
  @UseGuards(AuthGuard)
  async updateEducation(
    @Request() req: { user: UserProfile },
    @Param('id') educationId: string,
    @Body() dto: UpdateCVEducationDto,
  ): Promise<{
    data: CVEducationResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.updateEducation(
      req.user,
      educationId,
      dto,
    );
    return {
      data: result,
      message: 'Education updated successfully',
      status: 'success',
    };
  }

  @Delete('education/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEducation(
    @Request() req: { user: UserProfile },
    @Param('id') educationId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteEducation(req.user, educationId);
  }

  @Get('education/:id')
  @UseGuards(AuthGuard)
  async getEducation(@Param('id') educationId: string): Promise<{
    data: CVEducationResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getEducationById(educationId);
    return {
      data: result,
      message: result
        ? 'Education retrieved successfully'
        : 'Education not found',
      status: 'success',
    };
  }

  @Get('education')
  @UseGuards(AuthGuard)
  async getEducationList(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CVEducationListDto; message: string; status: string }> {
    const { data, total } = await this.cvBuilderService.getEducation(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'Education entries retrieved successfully',
      status: 'success',
    };
  }

  // Certifications Management
  @Post('certifications')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCertification(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVCertificationDto,
  ): Promise<{
    data: CVCertificationResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.createCertification(
      req.user,
      dto,
    );
    return {
      data: result,
      message: 'Certification created successfully',
      status: 'success',
    };
  }

  @Put('certifications/:id')
  @UseGuards(AuthGuard)
  async updateCertification(
    @Request() req: { user: UserProfile },
    @Param('id') certificationId: string,
    @Body() dto: UpdateCVCertificationDto,
  ): Promise<{
    data: CVCertificationResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.updateCertification(
      req.user,
      certificationId,
      dto,
    );
    return {
      data: result,
      message: 'Certification updated successfully',
      status: 'success',
    };
  }

  @Delete('certifications/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCertification(
    @Request() req: { user: UserProfile },
    @Param('id') certificationId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteCertification(req.user, certificationId);
  }

  @Get('certifications/:id')
  @UseGuards(AuthGuard)
  async getCertification(@Param('id') certificationId: string): Promise<{
    data: CVCertificationResponseDto | null;
    message: string;
    status: string;
  }> {
    const result =
      await this.cvBuilderService.getCertification(certificationId);
    return {
      data: result,
      message: result
        ? 'Certification retrieved successfully'
        : 'Certification not found',
      status: 'success',
    };
  }

  @Get('certifications')
  @UseGuards(AuthGuard)
  async getCertifications(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{
    data: CVCertificationsListDto;
    message: string;
    status: string;
  }> {
    const { data, total } = await this.cvBuilderService.getCertifications(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'Certifications retrieved successfully',
      status: 'success',
    };
  }

  // Awards Management
  @Post('awards')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAward(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVAwardDto,
  ): Promise<{ data: CVAwardResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.createAward(req.user, dto);
    return {
      data: result,
      message: 'Award created successfully',
      status: 'success',
    };
  }

  @Put('awards/:id')
  @UseGuards(AuthGuard)
  async updateAward(
    @Request() req: { user: UserProfile },
    @Param('id') awardId: string,
    @Body() dto: UpdateCVAwardDto,
  ): Promise<{ data: CVAwardResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.updateAward(
      req.user,
      awardId,
      dto,
    );
    return {
      data: result,
      message: 'Award updated successfully',
      status: 'success',
    };
  }

  @Delete('awards/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAward(
    @Request() req: { user: UserProfile },
    @Param('id') awardId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteAward(req.user, awardId);
  }

  @Get('awards/:id')
  @UseGuards(AuthGuard)
  async getAward(@Param('id') awardId: string): Promise<{
    data: CVAwardResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getAward(awardId);
    return {
      data: result,
      message: result ? 'Award retrieved successfully' : 'Award not found',
      status: 'success',
    };
  }

  @Get('awards')
  @UseGuards(AuthGuard)
  async getAwards(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CVAwardsListDto; message: string; status: string }> {
    const { data, total } = await this.cvBuilderService.getAwards(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'Awards retrieved successfully',
      status: 'success',
    };
  }

  // Interests Management
  @Post('interests')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInterest(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVInterestDto,
  ): Promise<{ data: CVInterestResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.createInterest(req.user, dto);
    return {
      data: result,
      message: 'Interest created successfully',
      status: 'success',
    };
  }

  @Put('interests/:id')
  @UseGuards(AuthGuard)
  async updateInterest(
    @Request() req: { user: UserProfile },
    @Param('id') interestId: string,
    @Body() dto: UpdateCVInterestDto,
  ): Promise<{ data: CVInterestResponseDto; message: string; status: string }> {
    const result = await this.cvBuilderService.updateInterest(
      req.user,
      interestId,
      dto,
    );
    return {
      data: result,
      message: 'Interest updated successfully',
      status: 'success',
    };
  }

  @Delete('interests/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInterest(
    @Request() req: { user: UserProfile },
    @Param('id') interestId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteInterest(req.user, interestId);
  }

  @Get('interests/:id')
  @UseGuards(AuthGuard)
  async getInterest(@Param('id') interestId: string): Promise<{
    data: CVInterestResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getInterest(interestId);
    return {
      data: result,
      message: result
        ? 'Interest retrieved successfully'
        : 'Interest not found',
      status: 'success',
    };
  }

  @Get('interests')
  @UseGuards(AuthGuard)
  async getInterests(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CVInterestsListDto; message: string; status: string }> {
    const { data, total } = await this.cvBuilderService.getInterests(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'Interests retrieved successfully',
      status: 'success',
    };
  }

  // References Management
  @Post('references')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReference(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVReferenceDto,
  ): Promise<{
    data: CVReferenceResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.createReference(req.user, dto);
    return {
      data: result,
      message: 'Reference created successfully',
      status: 'success',
    };
  }

  @Put('references/:id')
  @UseGuards(AuthGuard)
  async updateReference(
    @Request() req: { user: UserProfile },
    @Param('id') referenceId: string,
    @Body() dto: UpdateCVReferenceDto,
  ): Promise<{
    data: CVReferenceResponseDto;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.updateReference(
      req.user,
      referenceId,
      dto,
    );
    return {
      data: result,
      message: 'Reference updated successfully',
      status: 'success',
    };
  }

  @Delete('references/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReference(
    @Request() req: { user: UserProfile },
    @Param('id') referenceId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteReference(req.user, referenceId);
  }

  @Get('references/:id')
  @UseGuards(AuthGuard)
  async getReference(@Param('id') referenceId: string): Promise<{
    data: CVReferenceResponseDto | null;
    message: string;
    status: string;
  }> {
    const result = await this.cvBuilderService.getReference(referenceId);
    return {
      data: result,
      message: result
        ? 'Reference retrieved successfully'
        : 'Reference not found',
      status: 'success',
    };
  }

  @Get('references')
  @UseGuards(AuthGuard)
  async getReferences(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CVReferencesListDto; message: string; status: string }> {
    const { data, total } = await this.cvBuilderService.getReferences(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    const result = {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
    return {
      data: result,
      message: 'References retrieved successfully',
      status: 'success',
    };
  }

  // Complete CV Generation
  @Get('complete')
  @UseGuards(AuthGuard)
  async getCompleteCV(
    @Request() req: { user: UserProfile },
  ): Promise<{ data: CompleteCVResponse; message: string; status: string }> {
    const result = await this.cvBuilderService.getCompleteCV(req.user);
    return {
      data: result,
      message: 'Complete CV retrieved successfully',
      status: 'success',
    };
  }
}
