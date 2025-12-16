# Como Testar o Supabase

## 1. Executar o SQL no Supabase

### Acesse o Supabase SQL Editor:
1. Vá para: https://supabase.com/dashboard/project/ncbmjkhoplgyfgxeqhmo/editor
2. Clique em **New Query**
3. Abra o arquivo `supabase-schema.sql`
4. Copie **TODO** o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou Ctrl+Enter)

### Você verá algo como:
```
Success. No rows returned
```

Isso significa que as tabelas foram criadas com sucesso!

## 2. Verificar as Tabelas Criadas

1. No menu lateral do Supabase, clique em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ users
   - ✅ projects
   - ✅ project_members
   - ✅ tasks
   - ✅ task_assignees
   - ✅ subtasks
   - ✅ attachments
   - ✅ notifications
   - ✅ board_columns
   - ✅ assets

3. Clique em **board_columns** - você deve ver 5 colunas já inseridas:
   - Backlog
   - A Fazer
   - Em Progresso
   - Revisão
   - Concluído

## 3. Iniciar o Projeto

```bash
npm run dev
```

## 4. Verificar o Console do Navegador

Abra o DevTools (F12) e vá para a aba **Console**.

Você verá o teste automático do Supabase:

```
🔍 Testando conexão com Supabase...
✅ Cliente Supabase inicializado
✅ Tabelas encontradas no banco
📊 Colunas do board: [...]
✅ Tabela de usuários acessível
👥 0 usuário(s) encontrado(s)
✅ Tabela de projetos acessível
📁 0 projeto(s) encontrado(s)
✅ Tabela de tarefas acessível
📝 0 tarefa(s) encontrada(s)

🎉 Conexão com Supabase está funcionando perfeitamente!
```

## 5. Inserir Dados de Teste (Opcional)

Você pode inserir dados manualmente via Table Editor ou executar este SQL:

```sql
-- Inserir usuário de teste
INSERT INTO users (name, email, role, avatar_url)
VALUES ('João Silva', 'joao@exemplo.com', 'Admin', 'https://i.pravatar.cc/150?img=1');

-- Inserir projeto de teste
INSERT INTO projects (name, client_name, budget, color)
VALUES ('Website Redesign', 'Empresa ABC', 15000.00, '#3b82f6');
```

Depois recarregue a página e veja os dados no console!

## 6. Testar Manualmente no Console

Você também pode testar diretamente no console do navegador:

```javascript
// Testar conexão
await window.testSupabase()

// Buscar usuários (usando o helper)
import { userAPI } from './lib/supabase-helpers'
const users = await userAPI.getAll()
console.log(users)
```

## Erros Comuns

### ❌ "relation does not exist"
- **Causa**: Você não executou o SQL ainda
- **Solução**: Execute o conteúdo de `supabase-schema.sql` no SQL Editor

### ❌ "invalid api key"
- **Causa**: Variáveis de ambiente incorretas
- **Solução**: Verifique o arquivo `.env`

### ❌ Nenhum log aparece no console
- **Causa**: O app não carregou corretamente
- **Solução**: Verifique erros de compilação no terminal

## Próximos Passos

✅ **O banco está funcionando!**

Agora você pode:

1. **Opção A - Usar dados reais do Supabase**
   - Modificar `AppContext.tsx` para usar `supabase-helpers.ts`
   - Remover dados mock
   - Todos os dados serão salvos no banco

2. **Opção B - Manter dados mock**
   - O sistema continua como está
   - Você pode migrar gradualmente

3. **Opção C - Híbrido**
   - Alguns dados no Supabase (usuários, projetos)
   - Outros em memória (notificações temporárias)

## Ajuda

Se tiver problemas:
1. Verifique o console do navegador para erros
2. Verifique o terminal do npm run dev
3. Verifique as variáveis de ambiente no `.env`
4. Execute `await window.testSupabase()` no console
