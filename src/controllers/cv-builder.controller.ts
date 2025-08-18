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
} from '../dto/cv-builder.dto';
import type { CompleteCVResponse } from '../types/cv-builder.types';

@ApiTags('CV Builder')
@Controller('cv-builder')
export class CVBuilderController {
  constructor(private readonly cvBuilderService: CVBuilderService) {}

  // CV Sections Management (Admin only)
  @Put('sections/:name')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Get all CV sections configuration (Public)' })
  @ApiResponse({
    status: 200,
    description: 'CV sections retrieved successfully',
    type: CVSectionsListDto,
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personal information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Personal information retrieved successfully',
    type: CVPersonalInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Personal information not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update personal information' })
  @ApiResponse({
    status: 200,
    description: 'Personal information updated successfully',
    type: CVPersonalInfoResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Personal information not found' })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a skill by ID' })
  @ApiResponse({
    status: 200,
    description: 'Skill retrieved successfully',
    type: CVSkillResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Skill not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get skills with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
    type: CVSkillsListDto,
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an experience entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Experience retrieved successfully',
    type: CVExperienceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get experiences with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Experiences retrieved successfully',
    type: CVExperienceListDto,
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an education entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Education retrieved successfully',
    type: CVEducationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Education not found' })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a certification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Certification retrieved successfully',
    type: CVCertificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certifications with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Certifications retrieved successfully',
    type: CVCertificationsListDto,
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an award by ID' })
  @ApiResponse({
    status: 200,
    description: 'Award retrieved successfully',
    type: CVAwardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Award not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get awards with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Awards retrieved successfully',
    type: CVAwardsListDto,
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an interest by ID' })
  @ApiResponse({
    status: 200,
    description: 'Interest retrieved successfully',
    type: CVInterestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interest not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get interests with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Interests retrieved successfully',
    type: CVInterestsListDto,
  })
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a reference by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reference retrieved successfully',
    type: CVReferenceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reference not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get references with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'References retrieved successfully',
    type: CVReferencesListDto,
  })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete CV for current user' })
  @ApiResponse({
    status: 200,
    description: 'Complete CV retrieved successfully',
  })
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
