# Análises Estatísticas - Sistema de Tarefas

Este documento descreve as análises estatísticas implementadas no sistema de tarefas.

## 📊 Análises Disponíveis

### 1. Análise de Produtividade por Usuário
**Endpoint:** `GET /statistics/productivity`

**Descrição:** Calcula métricas de produtividade para o usuário autenticado.

**Dados Retornados:**
- `totalTarefas`: Total de tarefas criadas pelo usuário
- `tarefasConcluidas`: Quantidade de tarefas com status concluído
- `taxaConclusao`: Percentual de tarefas concluídas
- `mediaPrioridade`: Média de prioridade das tarefas
- `distribuicaoPrioridades`: Distribuição de tarefas por nível de prioridade
- `tarefasUltimos30Dias`: Tarefas criadas nos últimos 30 dias

**Exemplo de Resposta:**
```json
{
  "message": "Análise de produtividade calculada com sucesso.",
  "data": {
    "totalTarefas": 25,
    "tarefasConcluidas": 18,
    "taxaConclusao": 72.0,
    "mediaPrioridade": 3.2,
    "distribuicaoPrioridades": [
      {"prioridade": 1, "quantidade": 5},
      {"prioridade": 2, "quantidade": 8},
      {"prioridade": 3, "quantidade": 7},
      {"prioridade": 4, "quantidade": 3},
      {"prioridade": 5, "quantidade": 2}
    ],
    "tarefasUltimos30Dias": 12
  }
}
```

### 2. Análise Temporal
**Endpoint:** `GET /statistics/temporal-trends`

**Descrição:** Analisa tendências temporais na criação de tarefas.

**Dados Retornados:**
- `tarefasPorDiaSemana`: Distribuição de tarefas por dia da semana (últimos 30 dias)
- `tarefasPorHora`: Distribuição de tarefas por hora do dia (últimos 30 dias)
- `tarefasPorSemana`: Distribuição de tarefas por semana (últimas 12 semanas)
- `crescimento`: Percentual de crescimento comparado ao período anterior
- `periodoAtual`: Quantidade de tarefas no período atual (30 dias)
- `periodoAnterior`: Quantidade de tarefas no período anterior (30 dias)

**Exemplo de Resposta:**
```json
{
  "message": "Análise temporal calculada com sucesso.",
  "data": {
    "tarefasPorDiaSemana": [
      {"diaSemana": 1, "quantidade": 5},
      {"diaSemana": 2, "quantidade": 8},
      {"diaSemana": 3, "quantidade": 6}
    ],
    "tarefasPorHora": [
      {"hora": 9, "quantidade": 12},
      {"hora": 10, "quantidade": 15},
      {"hora": 14, "quantidade": 8}
    ],
    "tarefasPorSemana": [
      {"semana": "202401", "quantidade": 25},
      {"semana": "202402", "quantidade": 30}
    ],
    "crescimento": 20.0,
    "periodoAtual": 45,
    "periodoAnterior": 37
  }
}
```

### 3. Análise Preditiva
**Endpoint:** `GET /statistics/predictive`

**Descrição:** Prevê tempo de conclusão baseado no histórico de tarefas.

**Dados Retornados:**
- `mediasTempoPorPrioridade`: Tempo médio de conclusão por prioridade (em dias)
- `tarefasPorPrioridade`: Quantidade de tarefas analisadas por prioridade
- `tarefasComRiscoDeAtraso`: Lista de tarefas em andamento com risco de atraso
- `totalTarefasAnalisadas`: Total de tarefas concluídas analisadas

**Exemplo de Resposta:**
```json
{
  "message": "Análise preditiva calculada com sucesso.",
  "data": {
    "mediasTempoPorPrioridade": {
      "1": 2.5,
      "2": 4.2,
      "3": 6.8,
      "4": 10.1,
      "5": 15.3
    },
    "tarefasPorPrioridade": {
      "1": 8,
      "2": 12,
      "3": 15,
      "4": 6,
      "5": 3
    },
    "tarefasComRiscoDeAtraso": [
      {
        "taskId": 123,
        "titulo": "Implementar nova funcionalidade",
        "prioridade": 2,
        "tempoDecorrido": 8.5,
        "tempoMedioEsperado": 4.2,
        "risco": true
      }
    ],
    "totalTarefasAnalisadas": 44
  }
}
```

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT. O token deve ser enviado no header:
```
Authorization: Bearer <seu-token-jwt>
```

## 📈 Como Usar

1. **Faça login** no sistema para obter um token JWT
2. **Use o token** no header Authorization
3. **Faça requisições** para os endpoints desejados
4. **Analise os dados** retornados para tomar decisões baseadas em dados

## 🎯 Casos de Uso

### Análise de Produtividade
- Identificar usuários mais produtivos
- Acompanhar evolução da produtividade
- Definir metas de conclusão de tarefas

### Análise Temporal
- Identificar padrões de criação de tarefas
- Otimizar horários de trabalho
- Planejar recursos baseado em sazonalidade

### Análise Preditiva
- Identificar tarefas em risco de atraso
- Estimar tempo de conclusão de novas tarefas
- Otimizar priorização de tarefas

## 🚀 Próximos Passos

- Implementar dashboards visuais
- Adicionar alertas automáticos para tarefas em risco
- Criar relatórios exportáveis
- Implementar comparações entre equipes 