import * as fs from 'fs';
import * as path from 'path';

/**
 * NotImplementedException Scanner (HIGH-043)
 * 
 * Scans for NotImplementedException and generates implementation report.
 * Run: ts-node scripts/not-implemented-scanner.ts
 */

interface NotImplementedResult {
  file: string;
  line: number;
  method: string;
  class: string;
  context: string;
  priority: 'high' | 'medium' | 'low';
}

class NotImplementedScanner {
  private results: NotImplementedResult[] = [];

  async scan(dir: string = './src'): Promise<NotImplementedResult[]> {
    await this.scanDirectory(dir);
    this.assignPriorities();
    return this.results;
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.name.match(/\.(ts|js)$/)) {
        await this.scanFile(fullPath);
      }
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    let currentClass = '';
    let currentMethod = '';

    lines.forEach((line, index) => {
      // Track current class
      const classMatch = line.match(/class (\w+)/);
      if (classMatch) {
        currentClass = classMatch[1];
      }

      // Track current method
      const methodMatch = line.match(/(async )?\w+\s*\([^)]*\)/);
      if (methodMatch) {
        currentMethod = methodMatch[0].split('(')[0].trim();
      }

      // Find NotImplementedException
      if (line.includes('NotImplementedException')) {
        this.results.push({
          file: filePath,
          line: index + 1,
          method: currentMethod,
          class: currentClass,
          context: line.trim(),
          priority: 'medium', // Will be assigned later
        });
      }
    });
  }

  private assignPriorities(): void {
    this.results.forEach((result) => {
      // High priority: Controllers, Services
      if (
        result.file.includes('controller') ||
        result.file.includes('service')
      ) {
        result.priority = 'high';
      }
      // Low priority: Helpers, Utils
      else if (
        result.file.includes('helper') ||
        result.file.includes('util')
      ) {
        result.priority = 'low';
      }
      // Medium priority: everything else
      else {
        result.priority = 'medium';
      }
    });
  }

  generateReport(): string {
    const byPriority = this.groupByPriority();
    const total = this.results.length;

    let report = `\n=== NotImplementedException Scanner Report ===\n`;
    report += `Total: ${total} methods need implementation\n\n`;

    ['high', 'medium', 'low'].forEach((priority) => {
      const items = byPriority[priority as keyof typeof byPriority] || [];
      if (items.length === 0) return;

      report += `${priority.toUpperCase()} PRIORITY (${items.length}):\n`;
      items.forEach((item) => {
        report += `  📝 ${item.class}.${item.method}\n`;
        report += `     ${item.file}:${item.line}\n`;
        report += `     ${item.context}\n\n`;
      });
    });

    return report;
  }

  generateTodoList(): string {
    let todo = `\n=== Implementation TODO List ===\n\n`;

    this.results.forEach((result, index) => {
      todo += `${index + 1}. [${result.priority.toUpperCase()}] Implement ${result.class}.${result.method}\n`;
      todo += `   File: ${result.file}:${result.line}\n\n`;
    });

    return todo;
  }

  private groupByPriority(): Record<string, NotImplementedResult[]> {
    return this.results.reduce((acc, result) => {
      if (!acc[result.priority]) {
        acc[result.priority] = [];
      }
      acc[result.priority].push(result);
      return acc;
    }, {} as Record<string, NotImplementedResult[]>);
  }
}

// CLI
async function main() {
  const scanner = new NotImplementedScanner();

  console.log('Scanning for NotImplementedException...\n');
  await scanner.scan();

  console.log(scanner.generateReport());
  console.log(scanner.generateTodoList());
}

if (require.main === module) {
  main().catch(console.error);
}

export { NotImplementedScanner };
