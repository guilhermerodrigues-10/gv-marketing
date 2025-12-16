import { supabase } from './supabase';

/**
 * Teste de conexão com Supabase
 * Execute este arquivo para verificar se a conexão está funcionando
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');

  try {
    // Teste 1: Verificar se o cliente foi criado
    if (!supabase) {
      throw new Error('Cliente Supabase não foi inicializado');
    }
    console.log('✅ Cliente Supabase inicializado');

    // Teste 2: Tentar buscar colunas do board (deve existir após executar o SQL)
    const { data: columns, error: columnsError } = await supabase
      .from('board_columns')
      .select('*');

    if (columnsError) {
      console.error('❌ Erro ao buscar colunas:', columnsError.message);
      console.log('💡 Você executou o SQL do arquivo supabase-schema.sql?');
      return false;
    }

    console.log('✅ Tabelas encontradas no banco');
    console.log('📊 Colunas do board:', columns);

    // Teste 3: Verificar se existem usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message);
      return false;
    }

    console.log('✅ Tabela de usuários acessível');
    console.log(`👥 ${users?.length || 0} usuário(s) encontrado(s)`);

    // Teste 4: Verificar se existem projetos
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);

    if (projectsError) {
      console.error('❌ Erro ao buscar projetos:', projectsError.message);
      return false;
    }

    console.log('✅ Tabela de projetos acessível');
    console.log(`📁 ${projects?.length || 0} projeto(s) encontrado(s)`);

    // Teste 5: Verificar se existem tarefas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);

    if (tasksError) {
      console.error('❌ Erro ao buscar tarefas:', tasksError.message);
      return false;
    }

    console.log('✅ Tabela de tarefas acessível');
    console.log(`📝 ${tasks?.length || 0} tarefa(s) encontrada(s)`);

    console.log('\n🎉 Conexão com Supabase está funcionando perfeitamente!');
    console.log('\n📚 Próximos passos:');
    console.log('1. Inserir dados de teste via SQL Editor ou Table Editor');
    console.log('2. Integrar os helpers no AppContext.tsx');
    console.log('3. Substituir dados mock por dados reais do Supabase');

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    console.log('\n🔧 Verifique:');
    console.log('1. As variáveis de ambiente no arquivo .env');
    console.log('2. Se você executou o SQL do arquivo supabase-schema.sql');
    console.log('3. Se o projeto Supabase está ativo');
    return false;
  }
}

// Para testar via console do navegador
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}
