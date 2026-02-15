
import {
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";

  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

// Type alias for constructor functions
type ClassConstructor = new (...args: unknown[]) => unknown;

interface ValidationErrorDetail {
  field: string;
  constraints: string[];
  children?: ValidationErrorDetail[];
}

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object as object);
    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    return value;
  }

  private _toValidate(metatype: ClassConstructor): boolean {
    const types: ClassConstructor[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private _formatErrors(errors: ValidationError[]): ValidationErrorDetail[] {
    return errors.map((error: ValidationError) => {
      const constraints = error.constraints
        ? (Object.values(error.constraints) as string[])
        : [];

      const detail: ValidationErrorDetail = {
        field: error.property,
        constraints,
      };

      if (error.children && error.children.length > 0) {
        detail.children = this.formatErrors(error.children);
      }

      return detail;
    });
  }
}
