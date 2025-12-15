import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

/**
 * enum 데코레이터
 * description + enums의 [name] + - key : value
 */
export function ApiPropertyEnum(options: {
  description?: string;
  enums: { name: string; enum: Record<string, string> }[];
  example?: string;
  required?: boolean;
  nullable?: boolean;
  default?: string;
}): PropertyDecorator {
  const { enums, description, ...rest } = options;

  const descriptionSections = enums.map((v) => {
    const { name, enum: enumObj } = v;
    const lines = Object.entries(enumObj)
      .map(([key, val]) => {
        return `- ${key} = ${val}`;
      })
      .join('\n');

    return `[${name}]\n${lines}`;
  });

  const fullDescription = [description, ...descriptionSections].filter(Boolean).join('\n\n');

  return ApiProperty({
    ...rest,
    enum: enums[0],
    description: fullDescription,
  } as ApiPropertyOptions);
}
