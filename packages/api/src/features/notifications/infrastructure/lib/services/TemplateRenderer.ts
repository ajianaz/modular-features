import { ITemplateRenderer } from '../../../domain/interfaces/ITemplateRenderer';

/**
 * Template Renderer Service Implementation
 *
 * This service handles template rendering with variable substitution.
 * It supports basic variable replacement and template validation.
 */
export class TemplateRenderer implements ITemplateRenderer {
  render(template: string, variables: Record<string, any>): string {
    try {
      let rendered = template;

      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        rendered = rendered.replace(regex, String(value));
      });

      // Handle nested variables (basic implementation)
      rendered = this.renderNestedVariables(rendered, variables);

      return rendered;
    } catch (error) {
      throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for malformed variable syntax
    const variableRegex = /{{([^}]+)}}/g;
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1];

      // Check for empty variable names
      if (variable && !variable.trim()) {
        errors.push('Empty variable name found');
        continue;
      }

      // Check for invalid characters in variable names
      if (variable && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
        errors.push(`Invalid variable name: ${variable}. Variables must start with a letter and contain only letters, numbers, and underscores`);
      }

      // Check for unclosed brackets
      const openBrackets = (template.match(/{{/g) || []).length;
      const closeBrackets = (template.match(/}}/g) || []).length;

      if (openBrackets !== closeBrackets) {
        errors.push('Mismatched brackets in template');
      }
    }

    // Check for potentially dangerous content
    if (this.containsDangerousContent(template)) {
      errors.push('Template contains potentially dangerous content');
    }

    // Check template length
    if (template.length > 10000) {
      errors.push('Template is too long (maximum 10,000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Private helper methods
  private renderNestedVariables(template: string, variables: Record<string, any>): string {
    // Basic nested variable rendering (max 2 levels deep for safety)
    let rendered = template;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (iterations < maxIterations) {
      const beforeRender = rendered;

      // Find all variables in current template
      const variableRegex = /{{([^}]+)}}/g;
      rendered = rendered.replace(variableRegex, (match, variableName) => {
        const value = this.getNestedValue(variableName.trim(), variables);
        return value !== undefined ? String(value) : match;
      });

      // If no changes occurred, we're done
      if (rendered === beforeRender) {
        break;
      }

      iterations++;
    }

    return rendered;
  }

  private getNestedValue(path: string, variables: Record<string, any>): any {
    // Support dot notation for nested objects (e.g., user.name)
    const parts = path.split('.');
    let current: any = variables;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private containsDangerousContent(template: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    return dangerousPatterns.some(pattern => pattern.test(template));
  }

  // Utility methods for common template operations
  escapeVariables(template: string): string {
    // Escape template variables so they won't be rendered
    return template.replace(/{{/g, '\\{{');
  }

  unescapeVariables(template: string): string {
    // Unescape template variables
    return template.replace(/\\{{/g, '{{');
  }

  extractVariables(template: string): string[] {
    const variables = new Set<string>();
    const matches = template.match(/{{([^}]+)}}/g) || [];

    matches.forEach(match => {
      const variableMatch = match.match(/{{([^}]+)}}/);
      if (variableMatch && variableMatch[1]) {
        variables.add(variableMatch[1]);
      }
    });

    return Array.from(variables);
  }

  // Validation helpers
  isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  // Template compilation (for performance optimization)
  compileTemplate(template: string): (variables: Record<string, any>) => string {
    // Pre-compile template for better performance
    const variablesInTemplate = this.extractVariables(template);

    return (variables: Record<string, any>) => {
      let rendered = template;

      variablesInTemplate.forEach(variableName => {
        const value = this.getNestedValue(variableName, variables);
        if (value !== undefined) {
          const regex = new RegExp(`{{\\s*${variableName}\\s*}}`, 'g');
          rendered = rendered.replace(regex, String(value));
        }
      });

      return rendered;
    };
  }
}