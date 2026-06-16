import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordChangeValidator(
  oldPasswordField: string,
  newPasswordField: string,
  confirmationField: string,
  minLength: number = 8,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const oldPassword = control.get(oldPasswordField)?.value;
    const newPassword = control.get(newPasswordField)?.value;
    const confirmation = control.get(confirmationField)?.value;

    const passwordChangeStarted = !!newPassword || !!confirmation;

    if (!passwordChangeStarted) {
      return null;
    }

    if (!oldPassword || !newPassword || !confirmation) {
      return {
        passwordFieldsRequired: true,
      };
    }

    if (newPassword.length < minLength) {
      return {
        passwordTooShort: true,
      };
    }

    return null;
  };
}
