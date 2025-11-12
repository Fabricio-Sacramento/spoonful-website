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

/**
 * Remove console.log() statements considerando multi-linha
 */
function removeConsoleLogs(filePath, projectRoot) {
  if (shouldIgnore(filePath)) return;
  
  const ext = path.extname(filePath);
  if (!codeExtensions.includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  const removedBlocks = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detecta início de console.log (mas NÃO warn ou error)
    const consoleLogMatch = trimmed.match(/console\.log\s*\(/);
    
    if (consoleLogMatch && !trimmed.match(/console\.(warn|error)\s*\(/)) {
      // Encontrou um console.log - agora precisa achar onde termina
      const startLine = i;
      let blockLines = [line];
      let openParens = (line.match(/\(/g) || []).length;
      let closeParens = (line.match(/\)/g) || []).length;
      let openBraces = (line.match(/\{/g) || []).length;
      let closeBraces = (line.match(/\}/g) || []).length;
      
      // Se já fechou na mesma linha (ex: console.log('test');)
      if (openParens === closeParens && openBraces === closeBraces && trimmed.endsWith(';')) {
        // Remove apenas essa linha
        removedBlocks.push({
          startLine: startLine + 1,
          endLine: startLine + 1,
          content: blockLines
        });
        results.logsRemoved++;
        i++;
        continue;
      }
      
      // Multi-linha: continua até fechar todos os parênteses/chaves
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        blockLines.push(nextLine);
        
        openParens += (nextLine.match(/\(/g) || []).length;
        closeParens += (nextLine.match(/\)/g) || []).length;
        openBraces += (nextLine.match(/\{/g) || []).length;
        closeBraces += (nextLine.match(/\}/g) || []).length;
        
        // Terminou o console.log quando parênteses e chaves estão balanceados
        // E termina com ; ou apenas )
        const nextTrimmed = nextLine.trim();
        if (openParens === closeParens && 
            openBraces === closeBraces && 
            (nextTrimmed.endsWith(');') || nextTrimmed.endsWith(')'))) {
          // Fim do bloco console.log
          removedBlocks.push({
            startLine: startLine + 1,
            endLine: i + 1,
            content: blockLines
          });
          results.logsRemoved++;
          i++;
          break;
        }
        
        i++;
        
        // Proteção contra loop infinito (max 50 linhas para um console.log)
        if (blockLines.length > 50) {
          console.warn(`⚠️  Possível console.log mal-formado em ${filePath}:${startLine + 1}`);
          // Em caso de dúvida, adiciona tudo de volta (não remove)
          newLines.push(...blockLines);
          break;
        }
      }
    } else {
      // Linha normal - mantém
      newLines.push(line);
      i++;
    }
  }

  // Se houve mudanças, salva o arquivo
  if (removedBlocks.length > 0) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    results.changes.push({
      file: filePath.replace(projectRoot, ''),
      logsRemoved: removedBlocks.length,
      blocks: removedBlocks
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
console.log('🧹 Removendo console.log() do projeto (versão inteligente)...\n');

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
    
    // Mostra até 3 exemplos de blocos removidos
    const preview = change.blocks.slice(0, 3);
    preview.forEach(block => {
      if (block.startLine === block.endLine) {
        console.log(`   L${block.startLine}: ${block.content[0].trim().substring(0, 60)}...`);
      } else {
        console.log(`   L${block.startLine}-${block.endLine}: console.log multi-linha (${block.content.length} linhas)`);
      }
    });
    
    if (change.blocks.length > 3) {
      console.log(`   ... e mais ${change.blocks.length - 3}`);
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