import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // Carrega as variáveis do .env

// Validação das variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Supabase URL ou Service Key não foram encontradas. Verifique seu arquivo .env'
  );
}

// Crie o cliente Supabase com a CHAVE DE SERVIÇO (service_role)
// A chave de serviço ignora as políticas de RLS, ideal para scripts de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper para obter o diretório do script em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    // 1. Ler o arquivo JSON de produtos (localizado no mesmo diretório do script)
    const filePath = path.join(__dirname, 'products.json');
    const productsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!productsData || productsData.length === 0) {
      console.log('Nenhum produto encontrado no arquivo JSON. Encerrando.');
      return;
    }

    console.log(`Encontrados ${productsData.length} produtos. Inserindo no banco de dados...`);

    // 2. Inserir os dados na tabela 'products'
    const { error } = await supabase.from('products').insert(productsData);

    if (error) {
      console.error('Erro ao inserir produtos:', error.message);
      throw error;
    }

    console.log('✅ Produtos inseridos com sucesso!');
  } catch (err) {
    console.error('Falha no script de seed:', err);
  }
}

// Executar a função
seedDatabase();