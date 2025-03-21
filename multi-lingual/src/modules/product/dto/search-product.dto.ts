import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(1)
  limit: number;
}
