export type Values = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const passwordRules = [
  { label: "Minimum 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw: string) => /[0-9]/.test(pw) },
];

export function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function validate(values: Values): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  if (values.name.trim().length < 2) errors.name = "Please enter a valid name.";
  if (!isValidEmail(values.email))
    errors.email = "Please enter a valid e-mail address.";
  if (!passwordRules.every((r) => r.test(values.password)))
    errors.password = "Password does not meet the requirements.";
  if (values.password !== values.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}
