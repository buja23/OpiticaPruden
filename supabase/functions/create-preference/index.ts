import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// --- Configuração ---
// Chave de acesso do Mercado Pago (obtida dos secrets do Supabase)
const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

// Lista de origens permitidas para CORS. Adicione a URL do seu site de produção aqui.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174', // Adicionando a porta que você está usando para desenvolvimento
  // 'https://seusite.com' // Exemplo para produção
];

// Cabeçalhos CORS para as respostas
const corsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Função 'create-preference' carregada. Verificando configuração inicial...");

// --- Validação Inicial ---
// Verifica se a chave de acesso do Mercado Pago foi carregada corretamente.
// Esta é uma verificação crítica que acontece uma vez quando a função é iniciada.
if (!accessToken) {
  console.error('ERRO CRÍTICO DE INICIALIZAÇÃO: O secret "MERCADOPAGO_ACCESS_TOKEN" não foi encontrado. Verifique se ele está configurado corretamente no painel do Supabase e se a função foi reimplantada (deployed) após a configuração.');
} else {
  console.log('Secret "MERCADOPAGO_ACCESS_TOKEN" carregado com sucesso.');
}

serve(async (req: Request) => {
  console.log(`[${new Date().toISOString()}] Nova requisição recebida: ${req.method} ${req.url}`);

  const origin = req.headers.get('Origin') || '*';
  
  // --- Tratamento de CORS ---
  // Define o cabeçalho 'Access-Control-Allow-Origin' dinamicamente para a resposta.
  if (ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }

  // Responde imediatamente a requisições OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    console.log(`Respondendo à requisição OPTIONS de: ${origin}`);
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Validações da Requisição ---
  console.log('Iniciando validações da requisição POST.');

  // 1. Validação da Origem
  if (!ALLOWED_ORIGINS.includes(origin)) {
    const errorMsg = `Origem não permitida: ${origin}. Origens permitidas: ${ALLOWED_ORIGINS.join(', ')}`;
    console.error(errorMsg);
    return new Response(JSON.stringify({ error: 'Acesso negado', details: errorMsg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 403,
    });
  }
  console.log(`Origem da requisição validada: ${origin}`);

  // 2. Validação do Access Token (redundante, mas seguro)
  if (!accessToken) {
    const errorMsg = 'ERRO CRÍTICO: O secret "MERCADOPAGO_ACCESS_TOKEN" não foi encontrado no momento da execução. A função será encerrada.';
    console.error(errorMsg);
    return new Response(JSON.stringify({ error: 'Erro de configuração no servidor.', details: 'A chave de API para pagamentos não está configurada.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    console.log('Iniciando o bloco try...catch para processar o pagamento.');
    
    const { items } = await req.json();
    console.log('Corpo da requisição (items) extraído com sucesso.');

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Erro de validação: O corpo da requisição não contém um array de "items" válido.');
      return new Response(JSON.stringify({ error: 'Dados inválidos', details: 'O carrinho está vazio ou o formato dos itens é inválido.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log(`Itens recebidos para checkout: ${items.length}`);

    // --- Lógica de Negócio: Comunicação com o Mercado Pago ---
    console.log('Configurando o cliente do Mercado Pago.');

    const preferencePayload = {
      items: items,
      back_urls: {
        success: `${origin}/success`,
        failure: `${origin}/failure`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 12
      },
    };

    console.log('Payload da preferência a ser enviado:', JSON.stringify(preferencePayload, null, 2));

    console.log('Criando a preferência de pagamento...');
    // Usamos o fetch nativo do Deno para evitar problemas de compatibilidade com o SDK do Mercado Pago.
    let mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    // Lógica de Retentativa Inteligente:
    // Se a API retornar erro 400, é provável que seja o conflito entre 'auto_return' e URLs 'localhost'
    // (comum ao usar credenciais de produção em desenvolvimento).
    // Nesse caso, tentamos criar a preferência novamente, mas sem o 'auto_return'.
    if (mpResponse.status === 400) {
      console.warn('Erro 400 detectado (provável conflito de auto_return). Tentando novamente sem redirecionamento automático...');
      
      const { auto_return, ...fallbackPayload } = preferencePayload;

      mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(fallbackPayload),
      });
    }

    if (!mpResponse.ok) {
      const errorBody = await mpResponse.json();
      console.error('Erro da API do Mercado Pago:', JSON.stringify(errorBody, null, 2));
      throw new Error(`A API do Mercado Pago respondeu com o status ${mpResponse.status}: ${errorBody.message || 'Erro desconhecido'}`);
    }

    const result = await mpResponse.json();

    console.log('Preferência de pagamento criada com sucesso no Mercado Pago. ID:', result.id);

    // Retorna o ID da preferência para o frontend
    return new Response(JSON.stringify({ id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // --- Tratamento de Erros ---
    console.error('--- ERRO INESPERADO NO BLOCO CATCH ---');
    console.error('Tipo do Erro:', error.constructor.name);
    console.error('Mensagem do Erro:', error.message);
    // Se o erro for da API do Mercado Pago, ele pode conter mais detalhes
    if (error.cause) {
      console.error('Causa do Erro (API Mercado Pago?):', JSON.stringify(error.cause, null, 2));
    }
    console.error('Stack Trace:', error.stack);
    console.error('--- FIM DO LOG DE ERRO ---');

    return new Response(
      JSON.stringify({
        error: 'Falha ao criar preferência de pagamento.',
        details: error.message || 'Erro interno do servidor.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
