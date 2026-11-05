// Dados base do painel /maria — editados por Fabricio e Claude.
// O que a família marca na página fica salvo à parte (Vercel Blob) e é mesclado por id.
export default {
  "dpp": "2027-03-10",
  "people": [
    "Fabricio",
    "Mamãe"
  ],
  "contacts": [
    {
      "label": "Obstetra",
      "value": "Dra. Luiza Amaral — Equipe Parto Ecológico"
    },
    {
      "label": "Maternidade",
      "value": "São José — pelo plano de saúde"
    },
    {
      "label": "Plataforma do enxoval",
      "value": "A decidir (sugestão: Amazon Lista do Bebê)"
    }
  ],
  "platform": {
    "updated": "2026-11-04",
    "pick": "Amazon Lista do Bebê",
    "summary": "Lista única na Amazon, só com itens “vendidos e enviados pela Amazon”. O que depende do tamanho ou de testar com a Maria vira vale-presente Amazon (validade de 5 anos). Sem vaquinha por enquanto.",
    "why": [
      ["É a única que entrega o produto de verdade", "Magalu, Mercado Livre, iFraldas e iCasei transformam o presente em crédito ou dinheiro, o que vai contra a preferência de vocês por receber os produtos."],
      ["Melhor reputação entre as candidatas", "Reclame Aqui “Ótima”, nota 8,0: 85,8% das reclamações resolvidas e 77,2% voltariam a comprar (mai–out/2026). A Alô Bebê, segunda colocada, está “Regular” (6,7) e é a que tem mais queixas específicas sobre a lista."],
      ["Devolução vira crédito para vocês", "O presente devolvido pela aba Agradecimentos e Devoluções vira vale-presente na conta de vocês, e não reembolso para quem deu."],
      ["Controle e privacidade", "O item comprado pela lista sai da lista em poucas horas, o que evita dois do mesmo. O endereço completo fica escondido dos convidados, que veem só nome, cidade e estado."],
      ["Desconto no que faltar", "Até 15% com Prime (máx. R$ 750) ou 10% sem Prime (máx. R$ 500) nos itens da lista que vocês mesmos comprarem até ~set/2027."],
      ["Proteção brasileira na prática", "A empresa tem capital estrangeiro, mas opera no Brasil: NF-e, SAC 0800, CDC, Procon e foro do consumidor. O risco real não é a nacionalidade, e sim o vendedor terceiro no marketplace."]
    ],
    "groups": [
      ["Produto na lista", "Itens que dá para conferir sem a bebê: banheira, trocador, babá eletrônica, esterilizador, kit higiene, lençóis do tamanho do Pipdip, móbile."],
      ["Vale-presente Amazon", "Itens que dependem da bebê: roupas por tamanho, fraldas por tamanho, mamadeiras e bicos, bomba de leite, sling. No convite: “para roupinhas e fraldas, preferimos vale-presente, assim escolhemos o tamanho certo depois que a Maria chegar”."]
    ],
    "calendar": [
      ["Já", "Criar a lista (precisa estar ativa 15 dias antes de usar o desconto) e avaliar o Prime"],
      ["06/12", "Chá de bebê"],
      ["até 15/01", "Abrir, montar e conferir todos os presentes"],
      ["até 31/01", "Último dia para devolver pela lista (devolução estendida de fim de ano). O valor vira vale-presente"],
      ["fev–set/27", "Usar o desconto final no que faltar e os vale-presentes com a Maria em casa"]
    ],
    "traps": [
      ["Vendedor parceiro", "Teve devolução negada mesmo comprando pela lista. Só listem itens “vendidos e enviados pela Amazon”, que também são os únicos que entram no desconto."],
      ["Prazo de troca", "30 dias após o recebimento; compras de nov–dez vão até 31/01/2027. Nada chega a março, por isso a divisão em dois grupos. A Amazon não faz troca: devolve e compra de novo."],
      ["Reembolso para o comprador", "Há relatos de devolução que voltou para quem deu o presente. Devolvam sempre pela aba Agradecimentos e Devoluções e peçam aos avós para marcar “Este pedido contém um presente”."],
      ["Desconto não volta", "Se devolver um item comprado com o desconto final, ele se perde. Usem o desconto só no que já está decidido e testem antes com um item barato."],
      ["SAC e nota fiscal", "Alguns atendentes não conhecem a Lista do Bebê. Guardem caixa e etiqueta, peçam o número do pedido a quem deu e confirmem a devolução estendida no chat, guardando o protocolo."],
      ["Inmetro", "Cadeirinha, berço, chupeta, mamadeira, cadeira alta e brinquedo exigem selo. Comprem marca conhecida vendida pela Amazon e confiram o selo na embalagem."]
    ],
    "cols": ["Amazon Lista do Bebê", "Alô Bebê", "Listas Magalu", "Mercado Livre", "iFraldas", "iCasei"],
    "rows": [
      ["Recebe o produto?", ["ok","Sim"], ["ok","Sim, ou voucher"], ["no","Não — crédito em cartão pré-pago"], ["no","Não — dinheiro no Mercado Pago"], ["no","Não — dinheiro"], ["no","Não — dinheiro"]],
      ["Qualidade / origem", ["ok","Boa se filtrar “vendido e enviado pela Amazon”"], ["ok","Loja especializada, marcas de bebê"], ["mid","Crédito vale também no marketplace"], ["no","Marketplace aberto (mais risco sem Inmetro)"], ["na","—"], ["na","—"]],
      ["Vale-presente / crédito", ["ok","Vale-presente de 5 anos, sem taxa"], ["mid","Voucher de 1 ano; não vale preço à vista"], ["mid","12 meses; bloqueia após 180 dias parado"], ["mid","Saque com 3,99%"], ["mid","1 resgate grátis; extra R$ 7,90"], ["ok","Resgate grátis"]],
      ["Troca do presente", ["mid","Grátis por 30 dias após o recebimento; até 31/01 para compras de nov–dez; vira crédito"], ["mid","Converte em voucher; troca já negada sem nota fiscal"], ["na","—"], ["na","—"], ["na","—"], ["na","—"]],
      ["Adiar a entrega", ["no","Não, envia na compra"], ["ok","Sim, pede a entrega aos poucos"], ["na","—"], ["na","—"], ["na","—"], ["na","—"]],
      ["Vaquinha / cotas", ["no","Não"], ["no","Não"], ["mid","Crédito acumula"], ["no","Não"], ["ok","Sim (dinheiro)"], ["ok","Sim, cotas a partir de 2 × R$ 10"]],
      ["Evita presente repetido", ["ok","Sim, se comprado pela lista"], ["mid","Por quantidade"], ["na","—"], ["na","—"], ["na","—"], ["ok","Controle de cotas"]],
      ["Taxas escondidas", ["ok","Nenhuma para vocês"], ["no","Convidado paga frete por item; voucher perde desconto à vista"], ["no","3,99% fora do Magalu"], ["no","3,99% no saque"], ["no","11,48% no preço do convidado"], ["mid","A partir de 3,69%"]],
      ["Reclame Aqui", ["ok","Ótima · 8,0 · 85,8% resolvidas"], ["no","Regular · 6,7 (loja online) · 5,9 (lojas físicas)"], ["ok","MagaluPay 8,4–8,7"], ["na","Não levantado"], ["na","Não levantado"], ["na","Não levantado"]],
      ["Veredito", ["pick","Principal"], ["mid","Plano B, se fizerem questão de adiar a entrega"], ["no","Descartar (crédito)"], ["no","Descartar (dinheiro)"], ["no","Descartar"], ["mid","Só se surgir uma vaquinha"]]
    ],
    "dropped": [
      ["Casas Bahia", "Em recuperação judicial desde ago/2026, e a lista paga em vale-compras"],
      ["Americanas", "Lista de presentes descontinuada"],
      ["Shopee", "Não tem lista oficial"],
      ["Babylist", "Não entrega fora dos EUA"],
      ["Bebê Store", "Sem informação confiável sobre a lista em 2026"]
    ],
    "sources": [
      ["Amazon — Lista do Bebê", "https://www.amazon.com.br/baby-reg"],
      ["Amazon — devolução de presentes da lista", "https://www.amazon.com.br/gp/help/customer/display.html?nodeId=G7MY6LMAVTGTPDMJ"],
      ["Amazon — Reclame Aqui", "https://www.reclameaqui.com.br/empresa/amazon/"],
      ["Reclame Aqui — devolução negada (vendedor parceiro)", "https://www.reclameaqui.com.br/amazon/nao-e-possivel-devolver-produto-comprado-na-lista-do-bebe-da-amazon_PK5F7NS-6cLuCbW6/"],
      ["Alô Bebê — FAQ da lista", "https://enxoval.alobebe.com.br/"],
      ["Alô Bebê — Reclame Aqui", "https://www.reclameaqui.com.br/empresa/alo-bebe-loja-online/"],
      ["Listas Magalu — regulamento", "https://quero-de-casamento-static.magazineluiza.com.br/static/pdf/termo_de_regulamento_listas_magalu.pdf"],
      ["Mercado Livre — lista de chá de bebê", "https://www.mercadolivre.com.br/ofertas/lista-para-cha-de-bebe"],
      ["iFraldas — dúvidas frequentes", "https://www.ifraldas.com.br/duvidas-frequentes/"],
      ["iCasei — tarifas", "https://suporte.icasei.com.br/hc/pt-br/articles/360004474992-Como-funciona-a-tarifa-na-lista-de-presentes-do-site-de-casamento"],
      ["Poder360 — recuperação judicial da Casas Bahia", "https://www.poder360.com.br/poder-economia/entenda-por-que-a-casas-bahia-entrou-em-recuperacao-judicial/"],
      ["Inmetro — Operação Criança Segura", "https://www.gov.br/inmetro/pt-br/centrais-de-conteudo/noticias/operacao-crianca-segura-do-inmetro-fiscaliza-mais-de-800-mil-produtos-infantis-em-todo-o-pais-1"]
    ]
  },
  "fronts": [
    {
      "id": "saude",
      "name": "Saúde e parto"
    },
    {
      "id": "enxoval",
      "name": "Enxoval"
    },
    {
      "id": "casa",
      "name": "Casa e transporte"
    },
    {
      "id": "mala",
      "name": "Mala da maternidade"
    },
    {
      "id": "buro",
      "name": "Burocracia"
    },
    {
      "id": "cha",
      "name": "Chá de bebê"
    }
  ],
  "tasks": [
    {
      "id": "t-plataforma",
      "front": "enxoval",
      "title": "Escolher a plataforma da lista do enxoval",
      "due": "2026-11-08"
    },
    {
      "id": "t-lista",
      "front": "enxoval",
      "title": "Montar a lista por categoria na plataforma escolhida",
      "due": "2026-12-02"
    },
    {
      "id": "t-cha-decidir",
      "front": "cha",
      "title": "Decidir se haverá chá de bebê, data e formato",
      "due": "2026-12-02"
    },
    {
      "id": "t-cha-convite",
      "front": "cha",
      "title": "Enviar convite com o link da lista",
      "due": "2026-12-16"
    },
    {
      "id": "t-plano-cobertura",
      "front": "saude",
      "title": "Confirmar com o plano a cobertura do parto na São José e o que a equipe cobra à parte",
      "due": "2026-12-16"
    },
    {
      "id": "t-plano-parto",
      "front": "saude",
      "title": "Montar o plano de parto com a Dra. Luiza e a Equipe Parto Ecológico",
      "due": "2026-12-30"
    },
    {
      "id": "t-pre-internacao",
      "front": "saude",
      "title": "Fazer a pré-internação na maternidade e visitar o local",
      "due": "2027-01-13"
    },
    {
      "id": "t-pediatra",
      "front": "saude",
      "title": "Escolher pediatra da sala de parto e do acompanhamento",
      "due": "2027-01-13"
    },
    {
      "id": "t-exames",
      "front": "saude",
      "title": "Seguir calendário de exames e vacinas indicado pela obstetra",
      "due": ""
    },
    {
      "id": "t-espaco",
      "front": "casa",
      "title": "Definir espaço do Pipdip ao lado da cama e o cantinho de troca",
      "due": "2027-01-13"
    },
    {
      "id": "t-carro",
      "front": "casa",
      "title": "Testar o bebê conforto Maxi Baby no carro",
      "due": "2027-01-27"
    },
    {
      "id": "t-lavar",
      "front": "casa",
      "title": "Lavar roupinhas e enxoval de tecido",
      "due": "2027-02-03"
    },
    {
      "id": "t-compras-finais",
      "front": "enxoval",
      "title": "Comprar o que faltar depois do chá",
      "due": "2027-02-03"
    },
    {
      "id": "t-mala-pronta",
      "front": "mala",
      "title": "Malas da mãe, do bebê e do acompanhante prontas",
      "due": "2027-02-03"
    },
    {
      "id": "t-pasta",
      "front": "mala",
      "title": "Pasta com documentos, carteirinha do plano, exames e plano de parto",
      "due": "2027-02-03"
    },
    {
      "id": "t-licencas",
      "front": "buro",
      "title": "Planejar licenças e a agenda da Spoonful no período",
      "due": "2027-01-27"
    },
    {
      "id": "t-incluir-plano",
      "front": "buro",
      "title": "Confirmar como incluir a Maria no plano (até 30 dias após o nascimento)",
      "due": "2027-02-10"
    },
    {
      "id": "t-certidao",
      "front": "buro",
      "title": "Após o parto: certidão de nascimento, CPF e inclusão no plano",
      "due": ""
    }
  ],
  "enxovalCats": [
    "Sono",
    "Banho e higiene",
    "Troca",
    "Roupas",
    "Alimentação",
    "Passeio",
    "Saúde",
    "Para a mãe"
  ],
  "enxoval": [
    {
      "id": "e-berco",
      "cat": "Sono",
      "item": "Berço portátil ao lado da cama (Pipdip)",
      "qty": "1",
      "status": "comprado"
    },
    {
      "id": "e-lencol",
      "cat": "Sono",
      "item": "Lençol com elástico para o berço",
      "qty": "3"
    },
    {
      "id": "e-saco",
      "cat": "Sono",
      "item": "Saco de dormir / swaddle",
      "qty": "2"
    },
    {
      "id": "e-manta",
      "cat": "Sono",
      "item": "Manta leve",
      "qty": "2"
    },
    {
      "id": "e-banheira",
      "cat": "Banho e higiene",
      "item": "Banheira",
      "qty": "1"
    },
    {
      "id": "e-toalha",
      "cat": "Banho e higiene",
      "item": "Toalha com capuz",
      "qty": "3"
    },
    {
      "id": "e-sabonete",
      "cat": "Banho e higiene",
      "item": "Sabonete líquido e shampoo infantil",
      "qty": "1"
    },
    {
      "id": "e-termometro-banho",
      "cat": "Banho e higiene",
      "item": "Termômetro de banho",
      "qty": "1"
    },
    {
      "id": "e-trocador",
      "cat": "Troca",
      "item": "Trocador portátil",
      "qty": "1"
    },
    {
      "id": "e-fraldas-rn",
      "cat": "Troca",
      "item": "Fraldas RN (poucos pacotes) e P",
      "qty": "—"
    },
    {
      "id": "e-lenco",
      "cat": "Troca",
      "item": "Lenço umedecido / algodão",
      "qty": "—"
    },
    {
      "id": "e-pomada",
      "cat": "Troca",
      "item": "Pomada para assaduras",
      "qty": "2"
    },
    {
      "id": "e-body",
      "cat": "Roupas",
      "item": "Body RN e P",
      "qty": "8"
    },
    {
      "id": "e-macacao",
      "cat": "Roupas",
      "item": "Macacão / mijão",
      "qty": "6"
    },
    {
      "id": "e-meias",
      "cat": "Roupas",
      "item": "Meias e luvinhas",
      "qty": "4"
    },
    {
      "id": "e-saida",
      "cat": "Roupas",
      "item": "Saída da maternidade",
      "qty": "1"
    },
    {
      "id": "e-fralda-pano",
      "cat": "Alimentação",
      "item": "Fralda de pano / boca",
      "qty": "10"
    },
    {
      "id": "e-almofada",
      "cat": "Alimentação",
      "item": "Almofada de amamentação",
      "qty": "1"
    },
    {
      "id": "e-carrinho",
      "cat": "Passeio",
      "item": "Carrinho + moisés + bebê conforto (Maxi Baby 3 em 1)",
      "qty": "1",
      "status": "comprado"
    },
    {
      "id": "e-bolsa",
      "cat": "Passeio",
      "item": "Bolsa maternidade",
      "qty": "1"
    },
    {
      "id": "e-sling",
      "cat": "Passeio",
      "item": "Sling ou canguru",
      "qty": "1"
    },
    {
      "id": "e-termometro",
      "cat": "Saúde",
      "item": "Termômetro digital",
      "qty": "1"
    },
    {
      "id": "e-aspirador",
      "cat": "Saúde",
      "item": "Aspirador nasal e soro fisiológico",
      "qty": "1"
    },
    {
      "id": "e-kit-unha",
      "cat": "Saúde",
      "item": "Kit de unha infantil",
      "qty": "1"
    },
    {
      "id": "e-sutia",
      "cat": "Para a mãe",
      "item": "Sutiã de amamentação",
      "qty": "3"
    },
    {
      "id": "e-absorvente-seio",
      "cat": "Para a mãe",
      "item": "Absorventes para seios",
      "qty": "1 cx"
    },
    {
      "id": "e-absorvente-pos",
      "cat": "Para a mãe",
      "item": "Absorvente pós-parto",
      "qty": "2 pct"
    }
  ],
  "mala": [
    {
      "id": "m-mae-camisola",
      "group": "Mãe",
      "item": "Camisolas com abertura frontal"
    },
    {
      "id": "m-mae-chinelo",
      "group": "Mãe",
      "item": "Chinelo e roupão"
    },
    {
      "id": "m-mae-higiene",
      "group": "Mãe",
      "item": "Itens de higiene pessoal"
    },
    {
      "id": "m-mae-sutia",
      "group": "Mãe",
      "item": "Sutiã de amamentação e absorventes"
    },
    {
      "id": "m-mae-saida",
      "group": "Mãe",
      "item": "Roupa confortável para a saída"
    },
    {
      "id": "m-bebe-bodies",
      "group": "Bebê",
      "item": "Bodies e macacões (um por dia + reserva)"
    },
    {
      "id": "m-bebe-manta",
      "group": "Bebê",
      "item": "Manta e toquinha"
    },
    {
      "id": "m-bebe-fraldas",
      "group": "Bebê",
      "item": "Fraldas RN e lenços"
    },
    {
      "id": "m-bebe-saida",
      "group": "Bebê",
      "item": "Saída da maternidade"
    },
    {
      "id": "m-acomp-roupa",
      "group": "Acompanhante",
      "item": "Muda de roupa e itens de higiene"
    },
    {
      "id": "m-acomp-carregador",
      "group": "Acompanhante",
      "item": "Carregadores e cabo longo"
    },
    {
      "id": "m-acomp-lanche",
      "group": "Acompanhante",
      "item": "Lanches e garrafa de água"
    },
    {
      "id": "m-docs",
      "group": "Documentos",
      "item": "RG, carteirinha do plano, exames, plano de parto"
    }
  ]
};
