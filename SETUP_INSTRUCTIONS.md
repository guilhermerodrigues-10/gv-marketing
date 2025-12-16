# 🚀 Instruções de Setup - GV Marketing

## ⚠️ IMPORTANTE: Execute o SQL no Supabase PRIMEIRO!

**Sem isso, as tarefas NÃO vão salvar!**

### 1️⃣ Acessar o Supabase SQL Editor

1. Vá para: https://supabase.com/dashboard/project/hywyqckkahlxevvtzkfw/sql/new
2. Você verá um editor SQL em branco

### 2️⃣ Executar o Schema SQL

1. Abra o arquivo `supabase-schema.sql` deste projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no editor SQL** do Supabase
4. Clique em **"Run"** (botão verde no canto inferior direito)

**Isso vai criar:**
- ✅ 10 tabelas (users, tasks, projects, etc.)
- ✅ Relacionamentos entre tabelas
- ✅ Políticas de segurança (RLS)
- ✅ Triggers automáticos

### 3️⃣ Verificar se Funcionou

Execute este SQL para ver se as tabelas foram criadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Você deve ver estas tabelas:**
- assets
- attachments
- board_columns
- notifications
- project_members
- projects
- subtasks
- task_assignees
- tasks
- users

---

## 🔐 Login do Sistema

**Email:** `admin@gvmarketing.com`
**Senha:** `GVMarketing2024!@Secure`

---

## 👥 Gerenciar Equipe

**Para ver os botões de editar/remover:**
1. Faça login com a conta admin (acima)
2. Vá em "Equipe" no menu lateral
3. Você verá os botões "Editar" e "Remover" em cada usuário
4. Botão "Convidar Membro" aparece no topo

**Se não aparecer:** Verifique se você está logado como Admin ou Gerente!

---

## 📋 Criar Tarefas

**Depois de executar o SQL:**
1. Vá para o Kanban Board
2. Clique em "+ Nova Tarefa"
3. Preencha os campos
4. Clique em "Salvar"
5. A tarefa aparece no quadro E salva no banco ✅

**Se não salvar:** Abra o Console do navegador (F12) e veja os erros em vermelho!

---

## 🚀 Deploy Rápido

```powershell
cd "c:\Users\guilh\Downloads\gv-marketing (1)"
.\deploy.bat
```

Aguarde 2-3 minutos → Acesse http://72.61.135.194:8080

---

## 🔍 Troubleshooting

### Tarefas não salvam?
- ❌ **Você NÃO executou o SQL no Supabase**
- ✅ Execute `supabase-schema.sql` no SQL Editor

### Não vejo botões de editar equipe?
- ❌ **Você NÃO está logado como Admin**
- ✅ Faça login com `admin@gvmarketing.com`

### Database não conecta?
- ✅ **Já foi corrigido!** Timeout aumentado para 10s
- ✅ Faça deploy novamente com `.\deploy.bat`
