# Refatoração de Queries - Sistema de Estatísticas

## 🎯 Objetivo da Refatoração

A refatoração foi realizada para centralizar e reutilizar as queries do QueryBuilder que são constantes e repetitivas, melhorando a organização, manutenibilidade e reutilização do código.

## 📁 Estrutura Criada

### Arquivo: `src/statistics/queries/statistics.queries.ts`

Este arquivo centraliza todas as queries constantes utilizadas nas análises estatísticas.

## 🔧 Queries Centralizadas

### 1. **getMediaPrioridadeQuery**
```typescript
static getMediaPrioridadeQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Calcular média de prioridade das tarefas
- **Reutilização**: Usado em `analisarProdutividadePorUsuario` e `calcularMediaPrioridade`

### 2. **getDistribuicaoPrioridadesQuery**
```typescript
static getDistribuicaoPrioridadesQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Obter distribuição de tarefas por prioridade
- **Reutilização**: Usado em `analisarProdutividadePorUsuario`

### 3. **getTarefasPorDiaSemanaQuery**
```typescript
static getTarefasPorDiaSemanaQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Analisar tarefas por dia da semana (últimos 30 dias)
- **Reutilização**: Usado em `analisarTendenciasTemporais`

### 4. **getTarefasPorHoraQuery**
```typescript
static getTarefasPorHoraQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Analisar tarefas por hora do dia (últimos 30 dias)
- **Reutilização**: Usado em `analisarTendenciasTemporais`

### 5. **getTarefasPorSemanaQuery**
```typescript
static getTarefasPorSemanaQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Analisar tarefas por semana (últimas 12 semanas)
- **Reutilização**: Usado em `analisarTendenciasTemporais`

### 6. **getTarefasConcluidasComHistoricoQuery**
```typescript
static getTarefasConcluidasComHistoricoQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Buscar tarefas concluídas com histórico para análise preditiva
- **Reutilização**: Usado em `analisePreditiva`

### 7. **getTarefasEmAndamentoQuery**
```typescript
static getTarefasEmAndamentoQuery(repository: Repository<Tarefas>, usuarioId: number)
```
- **Uso**: Buscar tarefas em andamento para análise de risco
- **Reutilização**: Usado em `analisePreditiva`

### 8. **getContarTarefasPorPeriodoQuery**
```typescript
static getContarTarefasPorPeriodoQuery(repository: Repository<Tarefas>, usuarioId: number, dataInicio: Date)
```
- **Uso**: Contar tarefas em um período específico
- **Reutilização**: Pode ser usado em futuras análises temporais

### 9. **getTarefasPorStatusQuery**
```typescript
static getTarefasPorStatusQuery(repository: Repository<Tarefas>, usuarioId: number, statusId: number)
```
- **Uso**: Contar tarefas por status específico
- **Reutilização**: Pode ser usado em futuras análises de status

## ✅ Benefícios da Refatoração

### 1. **Reutilização de Código**
- Queries comuns são definidas uma única vez
- Reduz duplicação de código
- Facilita manutenção

### 2. **Organização**
- Queries centralizadas em um local específico
- Separação clara entre lógica de negócio e queries
- Código mais limpo e legível

### 3. **Manutenibilidade**
- Mudanças em queries afetam apenas um local
- Facilita testes unitários
- Reduz risco de bugs por inconsistências

### 4. **Performance**
- Queries otimizadas e padronizadas
- Reutilização de queries já testadas
- Menos overhead de criação de queries

### 5. **Extensibilidade**
- Fácil adição de novas queries
- Padrão estabelecido para futuras implementações
- Estrutura escalável

## 🔄 Como Usar

### Importação
```typescript
import { StatisticsQueries } from './queries/statistics.queries';
```

### Uso Básico
```typescript
// Antes da refatoração
const resultado = await this.tarefaRepository
  .createQueryBuilder('tarefa')
  .select('AVG(tarefa.prioridade)', 'media')
  .where('tarefa.usuarioId = :usuarioId', { usuarioId })
  .getRawOne();

// Depois da refatoração
const resultado = await StatisticsQueries
  .getMediaPrioridadeQuery(this.tarefaRepository, usuarioId)
  .getRawOne();
```

### Uso com Filtros Adicionais
```typescript
// Adicionar filtros específicos
const resultado = await StatisticsQueries
  .getMediaPrioridadeQuery(this.tarefaRepository, usuarioId)
  .andWhere('tarefa.statusId = :statusId', { statusId: 1 })
  .getRawOne();
```

## 🚀 Próximos Passos

1. **Adicionar mais queries** conforme necessário
2. **Implementar cache** para queries frequentes
3. **Criar testes unitários** para as queries
4. **Adicionar documentação** para cada query
5. **Implementar métricas** de performance das queries
