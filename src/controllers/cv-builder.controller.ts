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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CVBuilderService } from '../services/cv-builder.service';
import { AuthGuard } from '../guards/auth.guard';
import type { UserProfile } from '../types/auth.types';
import {
  UpdateCVSectionDto,
  CreateCVPersonalInfoDto,
  UpdateCVPersonalInfoDto,
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
} from '../dto/cv-builder.dto';
import type { CompleteCVResponse } from '../types/cv-builder.types';

@ApiTags('CV Builder')
@Controller('cv-builder')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CVBuilderController {
  constructor(private readonly cvBuilderService: CVBuilderService) {}

  // CV Sections Management (Admin only)
  @Put('sections/:name')
  @ApiOperation({ summary: 'Update CV section configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'CV section updated successfully',
    type: CVSectionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'CV section not found' })
  async updateCVSection(
    @Request() req: { user: UserProfile },
    @Param('name') sectionName: string,
    @Body() dto: UpdateCVSectionDto,
  ): Promise<CVSectionResponseDto> {
    return this.cvBuilderService.updateCVSection(req.user, sectionName, dto);
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get all CV sections configuration' })
  @ApiResponse({
    status: 200,
    description: 'CV sections retrieved successfully',
    type: CVSectionsListDto,
  })
  async getCVSections(): Promise<CVSectionsListDto> {
    const sections = await this.cvBuilderService.getCVSections();
    return {
      data: sections,
      total: sections.length,
      page: 1,
      limit: sections.length,
      next: null,
      prev: null,
    };
  }

  // Personal Info Management
  @Post('personal-info')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update personal information' })
  @ApiResponse({
    status: 201,
    description: 'Personal information created/updated successfully',
    type: CVPersonalInfoResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrUpdatePersonalInfo(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVPersonalInfoDto,
  ): Promise<CVPersonalInfoResponseDto> {
    return this.cvBuilderService.createOrUpdatePersonalInfo(req.user, dto);
  }

  @Get('personal-info/:userId')
  @ApiOperation({ summary: 'Get personal information by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Personal information retrieved successfully',
    type: CVPersonalInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Personal information not found' })
  async getPersonalInfo(
    @Param('userId') userId: string,
  ): Promise<CVPersonalInfoResponseDto | null> {
    return this.cvBuilderService.getPersonalInfo(userId);
  }

  // Skills Management
  @Post('skills')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({
    status: 201,
    description: 'Skill created successfully',
    type: CVSkillResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSkill(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVSkillDto,
  ): Promise<CVSkillResponseDto> {
    return this.cvBuilderService.createSkill(req.user, dto);
  }

  @Put('skills/:id')
  @ApiOperation({ summary: 'Update a skill' })
  @ApiResponse({
    status: 200,
    description: 'Skill updated successfully',
    type: CVSkillResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your skill' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async updateSkill(
    @Request() req: { user: UserProfile },
    @Param('id') skillId: string,
    @Body() dto: UpdateCVSkillDto,
  ): Promise<CVSkillResponseDto> {
    return this.cvBuilderService.updateSkill(req.user, skillId, dto);
  }

  @Delete('skills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiResponse({ status: 204, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your skill' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async deleteSkill(
    @Request() req: { user: UserProfile },
    @Param('id') skillId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteSkill(req.user, skillId);
  }

  @Get('skills/:id')
  @ApiOperation({ summary: 'Get a skill by ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill retrieved successfully',
    type: CVSkillResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async getSkill(
    @Param('id') skillId: string,
  ): Promise<CVSkillResponseDto | null> {
    return this.cvBuilderService.getSkill(skillId);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get skills with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
    type: CVSkillsListDto,
  })
  async getSkills(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVSkillsListDto> {
    const { data, total } = await this.cvBuilderService.getSkills(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // Experience Management
  @Post('experience')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new experience entry' })
  @ApiResponse({
    status: 201,
    description: 'Experience created successfully',
    type: CVExperienceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createExperience(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVExperienceDto,
  ): Promise<CVExperienceResponseDto> {
    return this.cvBuilderService.createExperience(req.user, dto);
  }

  @Put('experience/:id')
  @ApiOperation({ summary: 'Update an experience entry' })
  @ApiResponse({
    status: 200,
    description: 'Experience updated successfully',
    type: CVExperienceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your experience' })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  async updateExperience(
    @Request() req: { user: UserProfile },
    @Param('id') experienceId: string,
    @Body() dto: UpdateCVExperienceDto,
  ): Promise<CVExperienceResponseDto> {
    return this.cvBuilderService.updateExperience(req.user, experienceId, dto);
  }

  @Delete('experience/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an experience entry' })
  @ApiResponse({ status: 204, description: 'Experience deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your experience' })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  async deleteExperience(
    @Request() req: { user: UserProfile },
    @Param('id') experienceId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteExperience(req.user, experienceId);
  }

  @Get('experience/:id')
  @ApiOperation({ summary: 'Get an experience entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Experience retrieved successfully',
    type: CVExperienceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  async getExperience(
    @Param('id') experienceId: string,
  ): Promise<CVExperienceResponseDto | null> {
    return this.cvBuilderService.getExperience(experienceId);
  }

  @Get('experience')
  @ApiOperation({ summary: 'Get experiences with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Experiences retrieved successfully',
    type: CVExperienceListDto,
  })
  async getExperiences(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVExperienceListDto> {
    const { data, total } = await this.cvBuilderService.getExperiences(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // Education Management
  @Post('education')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new education entry' })
  @ApiResponse({
    status: 201,
    description: 'Education created successfully',
    type: CVEducationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createEducation(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVEducationDto,
  ): Promise<CVEducationResponseDto> {
    return this.cvBuilderService.createEducation(req.user, dto);
  }

  @Put('education/:id')
  @ApiOperation({ summary: 'Update an education entry' })
  @ApiResponse({
    status: 200,
    description: 'Education updated successfully',
    type: CVEducationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your education' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  async updateEducation(
    @Request() req: { user: UserProfile },
    @Param('id') educationId: string,
    @Body() dto: UpdateCVEducationDto,
  ): Promise<CVEducationResponseDto> {
    return this.cvBuilderService.updateEducation(req.user, educationId, dto);
  }

  @Delete('education/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an education entry' })
  @ApiResponse({ status: 204, description: 'Education deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your education' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  async deleteEducation(
    @Request() req: { user: UserProfile },
    @Param('id') educationId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteEducation(req.user, educationId);
  }

  @Get('education/:id')
  @ApiOperation({ summary: 'Get an education entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Education retrieved successfully',
    type: CVEducationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Education not found' })
  async getEducation(
    @Param('id') educationId: string,
  ): Promise<CVEducationResponseDto | null> {
    return this.cvBuilderService.getEducationById(educationId);
  }

  @Get('education')
  @ApiOperation({
    summary: 'Get education entries with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Education entries retrieved successfully',
    type: CVEducationListDto,
  })
  async getEducationList(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVEducationListDto> {
    const { data, total } = await this.cvBuilderService.getEducation(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // Certifications Management
  @Post('certifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new certification' })
  @ApiResponse({
    status: 201,
    description: 'Certification created successfully',
    type: CVCertificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCertification(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVCertificationDto,
  ): Promise<CVCertificationResponseDto> {
    return this.cvBuilderService.createCertification(req.user, dto);
  }

  @Put('certifications/:id')
  @ApiOperation({ summary: 'Update a certification' })
  @ApiResponse({
    status: 200,
    description: 'Certification updated successfully',
    type: CVCertificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your certification',
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async updateCertification(
    @Request() req: { user: UserProfile },
    @Param('id') certificationId: string,
    @Body() dto: UpdateCVCertificationDto,
  ): Promise<CVCertificationResponseDto> {
    return this.cvBuilderService.updateCertification(
      req.user,
      certificationId,
      dto,
    );
  }

  @Delete('certifications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a certification' })
  @ApiResponse({
    status: 204,
    description: 'Certification deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your certification',
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async deleteCertification(
    @Request() req: { user: UserProfile },
    @Param('id') certificationId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteCertification(req.user, certificationId);
  }

  @Get('certifications/:id')
  @ApiOperation({ summary: 'Get a certification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Certification retrieved successfully',
    type: CVCertificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async getCertification(
    @Param('id') certificationId: string,
  ): Promise<CVCertificationResponseDto | null> {
    return this.cvBuilderService.getCertification(certificationId);
  }

  @Get('certifications')
  @ApiOperation({ summary: 'Get certifications with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Certifications retrieved successfully',
    type: CVCertificationsListDto,
  })
  async getCertifications(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVCertificationsListDto> {
    const { data, total } = await this.cvBuilderService.getCertifications(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // Awards Management
  @Post('awards')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new award' })
  @ApiResponse({
    status: 201,
    description: 'Award created successfully',
    type: CVAwardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createAward(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVAwardDto,
  ): Promise<CVAwardResponseDto> {
    return this.cvBuilderService.createAward(req.user, dto);
  }

  @Put('awards/:id')
  @ApiOperation({ summary: 'Update an award' })
  @ApiResponse({
    status: 200,
    description: 'Award updated successfully',
    type: CVAwardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your award' })
  @ApiResponse({ status: 404, description: 'Award not found' })
  async updateAward(
    @Request() req: { user: UserProfile },
    @Param('id') awardId: string,
    @Body() dto: UpdateCVAwardDto,
  ): Promise<CVAwardResponseDto> {
    return this.cvBuilderService.updateAward(req.user, awardId, dto);
  }

  @Delete('awards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an award' })
  @ApiResponse({ status: 204, description: 'Award deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your award' })
  @ApiResponse({ status: 404, description: 'Award not found' })
  async deleteAward(
    @Request() req: { user: UserProfile },
    @Param('id') awardId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteAward(req.user, awardId);
  }

  @Get('awards/:id')
  @ApiOperation({ summary: 'Get an award by ID' })
  @ApiResponse({
    status: 200,
    description: 'Award retrieved successfully',
    type: CVAwardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Award not found' })
  async getAward(
    @Param('id') awardId: string,
  ): Promise<CVAwardResponseDto | null> {
    return this.cvBuilderService.getAward(awardId);
  }

  @Get('awards')
  @ApiOperation({ summary: 'Get awards with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Awards retrieved successfully',
    type: CVAwardsListDto,
  })
  async getAwards(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVAwardsListDto> {
    const { data, total } = await this.cvBuilderService.getAwards(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // Interests Management
  @Post('interests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new interest' })
  @ApiResponse({
    status: 201,
    description: 'Interest created successfully',
    type: CVInterestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createInterest(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVInterestDto,
  ): Promise<CVInterestResponseDto> {
    return this.cvBuilderService.createInterest(req.user, dto);
  }

  @Put('interests/:id')
  @ApiOperation({ summary: 'Update an interest' })
  @ApiResponse({
    status: 200,
    description: 'Interest updated successfully',
    type: CVInterestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your interest' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async updateInterest(
    @Request() req: { user: UserProfile },
    @Param('id') interestId: string,
    @Body() dto: UpdateCVInterestDto,
  ): Promise<CVInterestResponseDto> {
    return this.cvBuilderService.updateInterest(req.user, interestId, dto);
  }

  @Delete('interests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an interest' })
  @ApiResponse({ status: 204, description: 'Interest deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your interest' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async deleteInterest(
    @Request() req: { user: UserProfile },
    @Param('id') interestId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteInterest(req.user, interestId);
  }

  @Get('interests/:id')
  @ApiOperation({ summary: 'Get an interest by ID' })
  @ApiResponse({
    status: 200,
    description: 'Interest retrieved successfully',
    type: CVInterestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async getInterest(
    @Param('id') interestId: string,
  ): Promise<CVInterestResponseDto | null> {
    return this.cvBuilderService.getInterest(interestId);
  }

  @Get('interests')
  @ApiOperation({ summary: 'Get interests with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Interests retrieved successfully',
    type: CVInterestsListDto,
  })
  async getInterests(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVInterestsListDto> {
    const { data, total } = await this.cvBuilderService.getInterests(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // References Management
  @Post('references')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reference' })
  @ApiResponse({
    status: 201,
    description: 'Reference created successfully',
    type: CVReferenceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createReference(
    @Request() req: { user: UserProfile },
    @Body() dto: CreateCVReferenceDto,
  ): Promise<CVReferenceResponseDto> {
    return this.cvBuilderService.createReference(req.user, dto);
  }

  @Put('references/:id')
  @ApiOperation({ summary: 'Update a reference' })
  @ApiResponse({
    status: 200,
    description: 'Reference updated successfully',
    type: CVReferenceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your reference' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  async updateReference(
    @Request() req: { user: UserProfile },
    @Param('id') referenceId: string,
    @Body() dto: UpdateCVReferenceDto,
  ): Promise<CVReferenceResponseDto> {
    return this.cvBuilderService.updateReference(req.user, referenceId, dto);
  }

  @Delete('references/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reference' })
  @ApiResponse({ status: 204, description: 'Reference deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your reference' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  async deleteReference(
    @Request() req: { user: UserProfile },
    @Param('id') referenceId: string,
  ): Promise<void> {
    return this.cvBuilderService.deleteReference(req.user, referenceId);
  }

  @Get('references/:id')
  @ApiOperation({ summary: 'Get a reference by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reference retrieved successfully',
    type: CVReferenceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  async getReference(
    @Param('id') referenceId: string,
  ): Promise<CVReferenceResponseDto | null> {
    return this.cvBuilderService.getReference(referenceId);
  }

  @Get('references')
  @ApiOperation({ summary: 'Get references with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'References retrieved successfully',
    type: CVReferencesListDto,
  })
  async getReferences(
    @Query() query: CVQueryDto,
    @Request() req: { user: UserProfile },
  ): Promise<CVReferencesListDto> {
    const { data, total } = await this.cvBuilderService.getReferences(
      req.user.id,
      query,
    );
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data,
      total,
      page,
      limit,
      next: total > page * limit ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };
  }

  // Complete CV Generation
  @Get('complete/:userId')
  @ApiOperation({ summary: 'Get complete CV for a user' })
  @ApiResponse({
    status: 200,
    description: 'Complete CV retrieved successfully',
  })
  async getCompleteCV(
    @Param('userId') userId: string,
  ): Promise<CompleteCVResponse> {
    return this.cvBuilderService.getCompleteCV(userId);
  }
}
