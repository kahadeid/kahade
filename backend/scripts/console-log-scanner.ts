import * as fs from 'fs';
import * as path from 'path';

/**
 * Console.log Scanner & Auto-Replace (HIGH-042)
 * 
 * Scans codebase for console.log/warn/error and replaces with proper logger.
 * Run: ts-node scripts/console-log-scanner.ts [--fix]
 */

interface ScanResult {
  file: string;
  line: number;
  column: number;
  match: string;
  type: 'log' | 'warn' | 'error' | 'debug' | 'info';
}

class ConsoleLogScanner {
  private results: ScanResult[] = [];
  private excluded = [
    'node_modules',
    'dist',
    'coverage',
    'scripts',
    '.next',
    'test',
    'spec',
  ];

  async scan(dir: string = './src'): Promise<ScanResult[]> {
    await this.scanDirectory(dir);
    return this.results;
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip excluded directories
      if (this.excluded.some((exc) => fullPath.includes(exc))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.name.match(/\.(ts|js|tsx|jsx)$/)) {
        await this.scanFile(fullPath);
      }
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const regex = /console\.(log|warn|error|debug|info)\(/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        this.results.push({
          file: filePath,
          line: index + 1,
          column: match.index + 1,
          match: match[0],
          type: match[1] as any,
        });
      }
    });
  }

  async fix(dryRun: boolean = true): Promise<number> {
    const fileGroups = this.groupByFile();
    let fixed = 0;

    for (const [filePath, results] of Object.entries(fileGroups)) {
      let content = await fs.promises.readFile(filePath, 'utf-8');
      let modified = false;

      // Add logger import if not present
      if (!content.includes('import') || !content.includes('Logger')) {
        const importStatement =
          "import { Logger } from '@nestjs/common';\n";
        content = importStatement + content;
        modified = true;
      }

      // Replace console statements
      results.forEach((result) => {
        const oldPattern = new RegExp(
          `console\\.${result.type}\\(`,
          'g',
        );
        const newPattern = `this.logger.${result.type}(`;

        if (content.includes(`console.${result.type}(`)) {
          content = content.replace(oldPattern, newPattern);
          modified = true;
          fixed++;
        }
      });

      // Add logger property to class if needed
      if (modified && !content.includes('private logger')) {
        content = content.replace(
          /export class (\w+) {/,
          `export class $1 {
  private readonly logger = new Logger($1.name);\n`,
        );
      }

      // Write file
      if (modified && !dryRun) {
        await fs.promises.writeFile(filePath, content, 'utf-8');
      }
    }

    return fixed;
  }

  private groupByFile(): Record<string, ScanResult[]> {
    return this.results.reduce((acc, result) => {
      if (!acc[result.file]) {
        acc[result.file] = [];
      }
      acc[result.file].push(result);
      return acc;
    }, {} as Record<string, ScanResult[]>);
  }

  generateReport(): string {
    const grouped = this.groupByFile();
    const total = this.results.length;

    let report = `\n=== Console.log Scanner Report ===\n`;
    report += `Total occurrences: ${total}\n\n`;

    for (const [file, results] of Object.entries(grouped)) {
      report += `${file} (${results.length}):\n`;
      results.forEach((r) => {
        report += `  Line ${r.line}:${r.column} - ${r.match}\n`;
      });
      report += '\n';
    }

    return report;
  }
}

// CLI
async function main() {
  const scanner = new ConsoleLogScanner();
  const fix = process.argv.includes('--fix');
  const dryRun = !fix;

  console.log('Scanning for console.log statements...\n');
  await scanner.scan();

  console.log(scanner.generateReport());

  if (fix) {
    console.log('Fixing console.log statements...\n');
    const fixed = await scanner.fix(false);
    console.log(`✅ Fixed ${fixed} occurrences\n`);
  } else {
    console.log('Run with --fix to automatically replace console.log\n');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ConsoleLogScanner };
