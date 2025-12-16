# Configuração do Banco de Dados Supabase

## Passo 1: Executar o Schema SQL

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/ncbmjkhoplgyfgxeqhmo
2. Vá para **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql`
5. Cole no editor SQL
6. Clique em **Run** ou pressione `Ctrl+Enter`

Isso criará todas as tabelas necessárias:
- `users` - Usuários do sistema
- `projects` - Projetos
- `project_members` - Membros dos projetos
- `tasks` - Tarefas
- `task_assignees` - Pessoas atribuídas às tarefas
- `subtasks` - Subtarefas
- `attachments` - Anexos das tarefas
- `notifications` - Notificações
- `board_columns` - Colunas do quadro Kanban
- `assets` - Biblioteca de assets

## Passo 2: Verificar as Tabelas

No menu lateral, vá para **Table Editor** e você deverá ver todas as tabelas criadas.

## Passo 3: Testar a Conexão

Execute o seguinte comando no terminal do projeto:

```bash
npm run dev
```

O sistema agora está configurado para usar o Supabase!

## Como Funciona

### Variáveis de Ambiente

O arquivo `.env` contém:
```
VITE_SUPABASE_URL=https://ncbmjkhoplgyfgxeqhmo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cliente Supabase

O arquivo `lib/supabase.ts` cria o cliente Supabase automaticamente.

### Helpers

O arquivo `lib/supabase-helpers.ts` contém funções prontas para:
- `userAPI` - CRUD de usuários
- `projectAPI` - CRUD de projetos
- `taskAPI` - CRUD de tarefas
- `notificationAPI` - CRUD de notificações
- `columnAPI` - CRUD de colunas do board
- `assetAPI` - CRUD de assets

### Exemplo de Uso

```typescript
import { taskAPI } from './lib/supabase-helpers';

// Buscar todas as tarefas
const tasks = await taskAPI.getAll();

// Criar nova tarefa
await taskAPI.create({
  title: 'Nova Tarefa',
  description: 'Descrição',
  status: 'todo',
  priority: Priority.NORMAL,
  assignees: ['user-id'],
  dueDate: new Date().toISOString(),
  projectId: 'project-id',
  tags: ['tag1'],
  subtasks: []
});

// Atualizar tarefa
await taskAPI.update('task-id', {
  status: 'in_progress'
});

// Deletar tarefa
await taskAPI.delete('task-id');
```

## Próximos Passos

### Opção 1: Manter dados em memória (atual)
O sistema continua funcionando como está, com dados mock.

### Opção 2: Migrar para Supabase (persistência real)
Precisa modificar o `AppContext.tsx` para usar as funções do `supabase-helpers.ts` em vez dos arrays locais.

### Opção 3: Híbrido
Usar Supabase para alguns dados (como usuários e projetos) e manter outros em memória.

## Segurança

As políticas RLS (Row Level Security) estão configuradas para permitir todas as operações.

**IMPORTANTE**: Para produção, você deve restringir as políticas para:
- Usuários só possam ver/editar seus próprios dados
- Membros do projeto só possam acessar dados do projeto
- Etc.

## Troubleshooting

### Erro "relation does not exist"
- Certifique-se de que executou o SQL no projeto correto
- Verifique se não houve erros ao executar o script

### Erro "JWT expired"
- Suas chaves no `.env` estão corretas
- A chave anon nunca expira (até 2081)

### Dados não aparecem
- Verifique se as políticas RLS estão ativas
- Teste inserir dados manualmente via Table Editor
