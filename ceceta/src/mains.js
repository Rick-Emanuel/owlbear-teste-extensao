import OBR, { buildText } from "@owlbear-rodeo/sdk";

const ID = "com.seunome.chase-stealth";
const METADATA_KEY = `${ID}/parent-link`;

// --- CONFIGURAÇÃO DOS GRUPOS DE ÍCONES ---
const GROUPS = {
  CHASE: ["Cortar Caminho", "Esforço Extra", "Criar Obstáculo", "Despistar", "Sacrifício", "Atrapalhar"], // Exemplo de textos
  STEALTH: ["Ação comum", "Ação discreta", "Ação chamativa", "Distrair", "Chamar atenção"]
};

// Função para criar os rótulos ao redor do token
async function createRadialLabels(token, labels, style = "CHASE") {
  const itemsToAdd = []; // CORRIGIDO: Adicionado []
  const radius = (token.image.width / token.grid.scale.x) * 1.5;
  const centerX = token.position.x;
  const centerY = token.position.y;
  
  const bgColor = style === "CHASE" ? "#8B0000" : "#2F4F4F";

  labels.forEach((text, index) => {
    const angle = (index * 60) * (Math.PI / 180);
    const offsetX = Math.cos(angle) * radius * token.grid.scale.x;
    const offsetY = Math.sin(angle) * radius * token.grid.scale.y;

    const labelItem = buildText()
      .plainText(text)
      .position({ x: centerX + offsetX, y: centerY + offsetY })
      .fontSize(24)
      .fontWeight(600)
      .backgroundColor(bgColor)
      .strokeColor("#FFFFFF")
      .strokeWidth(2)
      .padding(10)
      .cornerRadius(8)
      .metadata({ [METADATA_KEY]: token.id }) // CORRIGIDO: Adicionado a chave correta
      .layer("TEXT")
      .build();

    itemsToAdd.push(labelItem);
  });

  await OBR.scene.items.addItems(itemsToAdd);
}

// Função para limpar rótulos antigos
async function clearLabels(tokenId) {
  const items = await OBR.scene.items.getItems((item) => item.type === "TEXT");
  
  const idsToDelete = items
    .filter((item) => item.metadata[METADATA_KEY] === tokenId) // CORRIGIDO: Acesso correto ao metadata
    .map((item) => item.id);

  if (idsToDelete.length > 0) {
    await OBR.scene.items.deleteItems(idsToDelete);
  }
}

OBR.onReady(() => {
  // 1. Botão "Modo Perseguição"
  OBR.contextMenu.create({
    id: `${ID}/menu-chase`,
    icons: [
      {
        icon: "/icon-chase.svg", // PRECISARÁ DE UM ICONE SVG AQUI
        label: "Modo Perseguição",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }], // Só aparece em personagens
          roles: ["GM"] // Apenas o GM vê
        },
      },
    ],
    async onClick(context) {
      for (const item of context.items) {
        await clearLabels(item.id);
        await createRadialLabels(item, GROUPS.CHASE, "CHASE");
      }
    },
  });

  // 2. Botão "Modo Furtividade"
  OBR.contextMenu.create({
    id: `${ID}/menu-stealth`,
    icons: [
      {
        icon: "/icon-stealth.svg", // PRECISARÁ DE UM ICONE SVG AQUI
        label: "Modo Furtividade",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
          roles: ["GM"]
        },
      },
    ],
    async onClick(context) {
      for (const item of context.items) {
        await clearLabels(item.id);
        await createRadialLabels(item, GROUPS.STEALTH, "STEALTH");
      }
    },
  });

  // 3. Botão "Remover Ícones"
  OBR.contextMenu.create({
    id: `${ID}/menu-clear`,
    icons: [
      {
        icon: "/icon-clear.svg", // PRECISARÁ DE UM ICONE SVG AQUI
        label: "Limpar Status",
        filter: {
          every: [{ key: "layer", value: "CHARACTER" }],
          roles: ["GM"]
        },
      },
    ],
    async onClick(context) {
      for (const item of context.items) {
        await clearLabels(item.id);
      }
    },
  });
});