#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const results = {
  consoleLogs: [],
  unusedImports: [],
  todoComments: [],
  debuggerStatements: [],
  largeFiles: [],
  stats: {
    totalFiles: 0,
    totalLines: 0,
    jsxFiles: 0,
    jsFiles: 0,
  }
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

// Extensões para analisar
const codeExtensions = ['.js', '.jsx', '.ts', '.tsx'];

function shouldIgnore(filePath) {
  return ignoreDirs.some(dir => filePath.includes(dir));
}

function analyzeFile(filePath, projectRoot) {
  if (shouldIgnore(filePath)) return;
  
  const ext = path.extname(filePath);
  if (!codeExtensions.includes(ext)) return;

  results.stats.totalFiles++;
  if (ext === '.jsx') results.stats.jsxFiles++;
  if (ext === '.js') results.stats.jsFiles++;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  results.stats.totalLines += lines.length;

  // Arquivo muito grande (mais de 500 linhas pode precisar de refatoração)
  if (lines.length > 500) {
    results.largeFiles.push({
      file: filePath.replace(projectRoot, ''),
      lines: lines.length
    });
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNum = index + 1;
    const location = `${filePath.replace(projectRoot, '')}:${lineNum}`;

    // Console logs
    if (trimmed.match(/console\.(log|warn|error|info|debug)/)) {
      results.consoleLogs.push({
        location,
        code: trimmed.substring(0, 80)
      });
    }

    // TODO, FIXME, etc
    if (trimmed.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/i)) {
      results.todoComments.push({
        location,
        code: trimmed
      });
    }

    // Debugger statements
    if (trimmed.match(/debugger;?/)) {
      results.debuggerStatements.push({
        location,
        code: trimmed
      });
    }
  });
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
      analyzeFile(filePath, projectRoot);
    }
  });
}

// Analisar assets não utilizados
function findUnusedAssets(projectRoot) {
  const publicPath = path.join(projectRoot, 'public');
  if (!fs.existsSync(publicPath)) return [];

  const unusedAssets = [];
  
  function checkAssets(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkAssets(fullPath, `${prefix}${item}/`);
      } else {
        // Ignora favicon e arquivos de configuração comuns
        if (item.match(/favicon|robots\.txt|manifest\.json|\.htaccess/)) return;
        
        const assetPath = `${prefix}${item}`;
        
        // Busca referências no código
        const srcPath = path.join(projectRoot, 'src');
        let found = false;
        
        function searchInCode(searchDir) {
          const files = fs.readdirSync(searchDir);
          
          files.forEach(file => {
            const filePath = path.join(searchDir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && !shouldIgnore(filePath)) {
              searchInCode(filePath);
            } else if (codeExtensions.includes(path.extname(file))) {
              const content = fs.readFileSync(filePath, 'utf-8');
              if (content.includes(item) || content.includes(assetPath)) {
                found = true;
              }
            }
          });
        }
        
        searchInCode(srcPath);
        
        if (!found) {
          unusedAssets.push({
            file: assetPath,
            path: fullPath.replace(projectRoot, '')
          });
        }
      }
    });
  }
  
  checkAssets(publicPath);
  return unusedAssets;
}

// Executar análise
console.log('🔍 Analisando projeto...\n');

const projectRoot = path.resolve('.');
const srcPath = path.join(projectRoot, 'src');

if (fs.existsSync(srcPath)) {
  walkDir(srcPath, projectRoot);
}

const unusedAssets = findUnusedAssets(projectRoot);

// Relatório
console.log('📊 RELATÓRIO DE ANÁLISE\n');
console.log('═'.repeat(60));

console.log('\n📈 ESTATÍSTICAS');
console.log('─'.repeat(60));
console.log(`Total de arquivos: ${results.stats.totalFiles}`);
console.log(`Total de linhas: ${results.stats.totalLines}`);
console.log(`Arquivos .jsx: ${results.stats.jsxFiles}`);
console.log(`Arquivos .js: ${results.stats.jsFiles}`);

if (results.consoleLogs.length > 0) {
  console.log('\n🪵 CONSOLE LOGS ENCONTRADOS');
  console.log('─'.repeat(60));
  console.log(`Total: ${results.consoleLogs.length}`);
  results.consoleLogs.slice(0, 10).forEach(item => {
    console.log(`  ${item.location}`);
    console.log(`  → ${item.code}`);
  });
  if (results.consoleLogs.length > 10) {
    console.log(`  ... e mais ${results.consoleLogs.length - 10}`);
  }
}

if (results.debuggerStatements.length > 0) {
  console.log('\n🐛 DEBUGGER STATEMENTS');
  console.log('─'.repeat(60));
  console.log(`Total: ${results.debuggerStatements.length}`);
  results.debuggerStatements.forEach(item => {
    console.log(`  ${item.location}`);
  });
}

if (results.todoComments.length > 0) {
  console.log('\n📝 TODO/FIXME COMMENTS');
  console.log('─'.repeat(60));
  console.log(`Total: ${results.todoComments.length}`);
  results.todoComments.forEach(item => {
    console.log(`  ${item.location}`);
    console.log(`  → ${item.code}`);
  });
}

if (results.largeFiles.length > 0) {
  console.log('\n📦 ARQUIVOS GRANDES (>500 linhas)');
  console.log('─'.repeat(60));
  results.largeFiles.forEach(item => {
    console.log(`  ${item.file} (${item.lines} linhas)`);
  });
}

if (unusedAssets.length > 0) {
  console.log('\n🖼️  POSSÍVEIS ASSETS NÃO UTILIZADOS');
  console.log('─'.repeat(60));
  console.log(`Total: ${unusedAssets.length}`);
  unusedAssets.forEach(item => {
    console.log(`  ${item.path}`);
  });
  console.log('\n⚠️  Verifique manualmente antes de remover!');
}

console.log('\n═'.repeat(60));
console.log('\n✅ Análise completa!\n');

// Salvar relatório em arquivo
const report = {
  timestamp: new Date().toISOString(),
  stats: results.stats,
  consoleLogs: results.consoleLogs,
  debuggerStatements: results.debuggerStatements,
  todoComments: results.todoComments,
  largeFiles: results.largeFiles,
  unusedAssets
};

const reportPath = path.join(projectRoot, 'cleanup-report.json');
fs.writeFileSync(
  reportPath,
  JSON.stringify(report, null, 2)
);

console.log('💾 Relatório detalhado salvo em: cleanup-report.json\n');