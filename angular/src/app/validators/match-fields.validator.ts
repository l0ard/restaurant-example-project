import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchFieldsValidator(
  field1: string,
  field2: string
): ValidatorFn {

  return (
    control: AbstractControl
  ): ValidationErrors | null => {
    const value1 = control.get(field1)?.value;
    const value2 = control.get(field2)?.value;

    if(!value2){
      return null;
    }

    return value1 === value2
      ? null
      : { fieldsDoNotMatch: true };
  }
}
