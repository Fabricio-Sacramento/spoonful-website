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
