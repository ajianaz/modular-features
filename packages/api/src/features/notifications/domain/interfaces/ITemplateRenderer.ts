export interface ITemplateRenderer {
  render(template: string, variables: Record<string, any>): string;
  validateTemplate(template: string): { isValid: boolean; errors: string[] };
}