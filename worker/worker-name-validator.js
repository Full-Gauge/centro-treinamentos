function normalizeName(name) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(de|da|do|das|dos)\b/g, " ")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  const left = String(a ?? "");
  const right = String(b ?? "");

  const matrix = Array.from({ length: right.length + 1 }, () => Array(left.length + 1).fill(0));

  for (let i = 0; i <= right.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= left.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= right.length; i++) {
    for (let j = 1; j <= left.length; j++) {
      matrix[i][j] =
        right[i - 1] === left[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[right.length][left.length];
}

function similarity(name1, name2) {
  const a = normalizeName(name1);
  const b = normalizeName(name2);

  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) return 100;

  const distance = levenshtein(a, b);
  return Math.round((1 - distance / maxLength) * 100);
}

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...(init.headers || {})
    }
  });
}

function getInputFromRequest(request, body) {
  const url = new URL(request.url);

  return {
    name: body?.name ?? url.searchParams.get("name") ?? "",
    referenceName:
      body?.referenceName ??
      body?.expectedName ??
      url.searchParams.get("referenceName") ??
      url.searchParams.get("expectedName") ??
      "",
    threshold: body?.threshold ?? url.searchParams.get("threshold") ?? 80
  };
}

export async function handleNameValidationRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido. Use GET ou POST." }, { status: 405 });
  }

  try {
    const apiKey = request.headers.get("x-api-key");

    if (env?.API_KEY && apiKey !== env.API_KEY) {
      return jsonResponse(
        {
          error: "Não autorizado. Chave de API inválida."
        },
        { status: 401 }
      );
    }

    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const { name, referenceName, threshold } = getInputFromRequest(request, body);

    if (!name || !referenceName) {
      return jsonResponse(
        {
          error: "Os campos name e referenceName são obrigatórios."
        },
        { status: 400 }
      );
    }

    const parsedThreshold = Number(threshold);
    const safeThreshold = Number.isFinite(parsedThreshold) ? parsedThreshold : 80;
    const score = smartNameSimilarity(name, referenceName);
    const valid = score >= safeThreshold;

    return jsonResponse({
      valid,
      score,
      threshold: safeThreshold,
      input: {
        name,
        referenceName
      },
      normalized: {
        name: normalizeName(name),
        referenceName: normalizeName(referenceName)
      }
    });
  } catch (error) {
    return jsonResponse(
      {
        error: `Erro interno ao validar o nome: ${error.message}`
      },
      { status: 500 }
    );
  }
}


function nameParts(name) {
  return normalizeName(name).split(" ").filter(Boolean);
}

function wordSimilarity(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);

  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) return 100;

  const distance = levenshtein(left, right);
  return Math.round((1 - distance / maxLength) * 100);
}

function isInitialMatch(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);

  if (!left || !right) return false;

  return (
    left.length === 1 && right.startsWith(left)
  ) || (
    right.length === 1 && left.startsWith(right)
  );
}

function smartNameSimilarity(name, referenceName) {
  const nameWords = nameParts(name);
  const refWords = nameParts(referenceName);

  if (nameWords.length < 2 || refWords.length < 2) {
    return similarity(name, referenceName);
  }

  const firstNameScore = wordSimilarity(nameWords[0], refWords[0]);

  const lastNameScore = wordSimilarity(
    nameWords[nameWords.length - 1],
    refWords[refWords.length - 1]
  );

  const firstAndLastValid = firstNameScore >= 80 && lastNameScore >= 80;

  if (!firstAndLastValid) {
    return Math.min(firstNameScore, lastNameScore);
  }

  const middleNameWords = nameWords.slice(1, -1);
  const middleRefWords = refWords.slice(1, -1);

  const hasMiddleConflict =
    middleNameWords.length > 0 &&
    middleRefWords.length > 0 &&
    !middleNameWords.some(current =>
      middleRefWords.some(ref =>
        wordSimilarity(current, ref) >= 80 || isInitialMatch(current, ref)
      )
    );

  if (hasMiddleConflict) {
    return 85;
  }

  return 100;
}