#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const results = {
  filesProcessed: 0,
  logsRemoved: 0,
  changes: []
};

// Pastas para ignorar
const ignoreDirs = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.vite',
  'coverage'
];

// Extensões para processar
const codeExtensions = ['.js', '.jsx', '.ts', '.tsx'];

function shouldIgnore(filePath) {
  return ignoreDirs.some(dir => filePath.includes(dir));
}

function removeConsoleLogs(filePath, projectRoot) {
  if (shouldIgnore(filePath)) return;
  
  const ext = path.extname(filePath);
  if (!codeExtensions.includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  const removedLines = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Detecta console.log mas NÃO console.warn ou console.error
    const hasConsoleLog = trimmed.match(/console\.log\s*\(/);
    
    // Se for console.log, não adiciona a linha (remove)
    if (hasConsoleLog) {
      removedLines.push({
        lineNumber: index + 1,
        content: line
      });
      results.logsRemoved++;
    } else {
      // Mantém a linha
      newLines.push(line);
    }
  });

  // Se houve mudanças, salva o arquivo
  if (removedLines.length > 0) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    results.changes.push({
      file: filePath.replace(projectRoot, ''),
      logsRemoved: removedLines.length,
      lines: removedLines
    });
    
    results.filesProcessed++;
  }
}

function walkDir(dir, projectRoot) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldIgnore(filePath)) {
        walkDir(filePath, projectRoot);
      }
    } else {
      removeConsoleLogs(filePath, projectRoot);
    }
  });
}

// Executar limpeza
console.log('🧹 Removendo console.log() do projeto...\n');

const projectRoot = path.resolve('.');
const srcPath = path.join(projectRoot, 'src');

if (!fs.existsSync(srcPath)) {
  console.error('❌ Pasta src/ não encontrada');
  throw new Error('Pasta src/ não encontrada');
}

walkDir(srcPath, projectRoot);

// Relatório
console.log('═'.repeat(60));
console.log('\n📊 RELATÓRIO DE LIMPEZA\n');
console.log('─'.repeat(60));
console.log(`Arquivos modificados: ${results.filesProcessed}`);
console.log(`console.log() removidos: ${results.logsRemoved}`);

if (results.changes.length > 0) {
  console.log('\n📝 ARQUIVOS ALTERADOS:\n');
  results.changes.forEach(change => {
    console.log(`\n📄 ${change.file}`);
    console.log(`   Removidos: ${change.logsRemoved} console.log()`);
    
    // Mostra até 3 exemplos de linhas removidas
    const preview = change.lines.slice(0, 3);
    preview.forEach(item => {
      console.log(`   L${item.lineNumber}: ${item.content.trim().substring(0, 60)}...`);
    });
    
    if (change.lines.length > 3) {
      console.log(`   ... e mais ${change.lines.length - 3}`);
    }
  });
}

console.log('\n═'.repeat(60));
console.log('\n✅ Limpeza completa!\n');

// Salvar relatório em arquivo
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    filesProcessed: results.filesProcessed,
    logsRemoved: results.logsRemoved
  },
  changes: results.changes
};

const reportPath = path.join(projectRoot, 'console-logs-removed.json');
fs.writeFileSync(
  reportPath,
  JSON.stringify(report, null, 2)
);

console.log('💾 Relatório detalhado salvo em: console-logs-removed.json');
console.log('\n⚠️  IMPORTANTE: Teste o projeto antes de fazer commit!');
console.log('   Se algo quebrar: git checkout src/\n');