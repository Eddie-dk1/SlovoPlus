export type SemanticPattern = {
  id: string
  pos?: 'noun' | 'verb' | 'adjective'
  keywords: string[]
  definitionTemplate: (word: string) => string
  simpleExplanationTemplate: (word: string) => string
  examplesTemplate: (word: string) => string[]
  relatedWords: string[]
}

export type SemanticAssistResult = {
  definition: string
  simpleExplanation: string
  examples: string[]
  relatedWords: string[]
  patternId: string
}

const KEYWORD_ALIASES: Record<string, string> = {
  telefon: 'telephone',
  cellphone: 'phone',
  handset: 'phone',
  mankind: 'human',
}

function normalizeSingleGloss(gloss: string): string {
  const normalized = gloss
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) {
    return ''
  }

  const spellingMarker = normalized.match(
    /(?:cyrillic|latin|alternative|archaic)\s+spelling\s+of\s+([a-z-]+)/,
  )
  if (spellingMarker?.[1]) {
    const lemma = spellingMarker[1].trim()
    return KEYWORD_ALIASES[lemma] ?? lemma
  }

  return normalized
}

export function normalizeGlossText(glosses: string[]): string {
  return glosses
    .map((item) => normalizeSingleGloss(item))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeNormalizedText(text: string): string[] {
  const tokens = text
    .split(/[\s-]+/)
    .map((token) => token.trim().toLowerCase())
    .map((token) => KEYWORD_ALIASES[token] ?? token)
    .filter((token) => token.length >= 3)

  return Array.from(new Set(tokens))
}

export function countKeywordMatches(text: string, keywords: string[]): number {
  const tokens = tokenizeNormalizedText(text)
  return keywords.reduce((count, keyword) => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) {
      return count
    }

    if (normalizedKeyword.includes(' ')) {
      return text.includes(normalizedKeyword) ? count + 2 : count
    }

    if (tokens.includes(normalizedKeyword)) {
      return count + 2
    }

    return count
  }, 0)
}

function normalizePartOfSpeech(
  partOfSpeech?: string,
): 'noun' | 'verb' | 'adjective' | undefined {
  if (!partOfSpeech) {
    return undefined
  }

  const normalized = partOfSpeech.trim().toLowerCase()
  const map: Record<string, 'noun' | 'verb' | 'adjective'> = {
    noun: 'noun',
    verb: 'verb',
    adjective: 'adjective',
    adj: 'adjective',
  }

  return map[normalized]
}

export const semanticPatterns: SemanticPattern[] = [
  {
    id: 'animal_catlike',
    pos: 'noun',
    keywords: ['cat', 'feline', 'domestic animal', 'pet animal'],
    definitionTemplate: (word) =>
      `«${word}» — домашнее животное семейства кошачьих.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это домашнее животное, которое часто живет рядом с человеком.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» обычно связано с домашними животными.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в бытовом контексте.`,
    ],
    relatedWords: ['животное', 'питомец', 'кошка', 'домашний'],
  },
  {
    id: 'human_person',
    pos: 'noun',
    keywords: ['human', 'person', 'individual', 'man', 'people'],
    definitionTemplate: (word) =>
      `«${word}» — разумное живое существо, относящееся к человеческому роду.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это человек как личность или представитель людей в целом.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с людьми, личностью или обществом.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в нейтральном и общем контексте.`,
    ],
    relatedWords: ['личность', 'индивид', 'люди', 'гражданин'],
  },
  {
    id: 'building_house',
    pos: 'noun',
    keywords: ['house', 'home', 'building', 'dwelling', 'residence'],
    definitionTemplate: (word) =>
      `«${word}» — здание или место, предназначенное для жизни и проживания.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это место, где живут люди.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» часто связано с жильем и местом проживания.`,
      `Общее пояснение: значение слова «${word}» употребляется в бытовом и нейтральном контексте.`,
    ],
    relatedWords: ['жилье', 'здание', 'квартира', 'очаг'],
  },
  {
    id: 'friendship_relation',
    pos: 'noun',
    keywords: ['friendship', 'friend', 'friends', 'companionship'],
    definitionTemplate: (word) =>
      `«${word}» — близкие доброжелательные отношения между людьми, основанные на доверии и поддержке.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это отношения, когда люди доверяют друг другу, помогают и сохраняют взаимную привязанность.`,
    examplesTemplate: (word) => [
      `${word[0].toUpperCase()}${word.slice(1)} помогла героям преодолеть трудности.`,
      `Настоящая ${word} требует доверия и уважения.`,
    ],
    relatedWords: ['доверие', 'поддержка', 'товарищество', 'близость'],
  },
  {
    id: 'water_vehicle',
    pos: 'noun',
    keywords: ['ship', 'vessel', 'boat', 'watercraft', 'craft'],
    definitionTemplate: (word) =>
      `«${word}» — крупное судно или плавательное средство, предназначенное для передвижения по воде.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это водный транспорт для перевозки людей или грузов.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с плаванием и водным транспортом.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в морском и транспортном контексте.`,
    ],
    relatedWords: ['судно', 'лодка', 'лайнер', 'фрегат'],
  },
  {
    id: 'land_vehicle',
    pos: 'noun',
    keywords: ['car', 'vehicle', 'automobile', 'motor vehicle'],
    definitionTemplate: (word) =>
      `«${word}» — транспортное средство для передвижения по суше.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это средство передвижения, обычно используемое для поездок.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с транспортом и передвижением.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в бытовом и дорожном контексте.`,
    ],
    relatedWords: ['транспорт', 'автомобиль', 'поездка', 'дорога'],
  },
  {
    id: 'communication_device',
    pos: 'noun',
    keywords: ['phone', 'telephone', 'device', 'communication', 'call', 'mobile'],
    definitionTemplate: (word) =>
      `«${word}» — устройство для связи и передачи речи на расстоянии.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это средство связи, с помощью которого можно звонить и общаться.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано со связью, звонками и общением.`,
      `Общее пояснение: значение слова «${word}» часто относится к устройствам связи.`,
    ],
    relatedWords: ['связь', 'звонок', 'смартфон', 'аппарат'],
  },
  {
    id: 'book_text',
    pos: 'noun',
    keywords: ['book', 'text', 'volume', 'publication', 'written work'],
    definitionTemplate: (word) =>
      `«${word}» — печатное или рукописное издание, предназначенное для чтения.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это текст или издание, которое читают для информации, обучения или удовольствия.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с чтением, обучением и текстами.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в образовательном и культурном контексте.`,
    ],
    relatedWords: ['издание', 'том', 'литература', 'учебник'],
  },
  {
    id: 'liquid_water',
    pos: 'noun',
    keywords: ['water', 'liquid', 'fluid'],
    definitionTemplate: (word) =>
      `«${word}» — прозрачная жидкость, необходимая для жизни и широко встречающаяся в природе.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это жидкость, которую пьют и которая важна для живых существ.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с природной жидкостью и жизненно важной средой.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в бытовом, природном и научном контексте.`,
    ],
    relatedWords: ['жидкость', 'влага', 'река', 'родник'],
  },
  {
    id: 'place_school',
    pos: 'noun',
    keywords: ['school', 'educational institution', 'education', 'teaching'],
    definitionTemplate: (word) =>
      `«${word}» — учебное заведение, в котором получают образование.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это место, где учатся и получают знания.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с обучением и образованием.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в учебном и социальном контексте.`,
    ],
    relatedWords: ['учеба', 'образование', 'урок', 'ученик'],
  },
  {
    id: 'opening_window',
    pos: 'noun',
    keywords: ['window', 'opening', 'aperture', 'frame'],
    definitionTemplate: (word) =>
      `«${word}» — проем в стене или конструкции, предназначенный для света, воздуха и обзора.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это часть помещения или здания, через которую попадает свет и можно смотреть наружу.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано со строением помещения и освещением.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в бытовом и архитектурном контексте.`,
    ],
    relatedWords: ['проем', 'рама', 'стекло', 'свет'],
  },
  {
    id: 'religious_being',
    pos: 'noun',
    keywords: ['god', 'deity', 'divine being', 'supreme being'],
    definitionTemplate: (word) =>
      `«${word}» — высшее сверхъестественное существо в религиозных представлениях.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это божество или высшая сила в религиозном и культурном контексте.`,
    examplesTemplate: (word) => [
      `Общее пояснение: слово «${word}» связано с религией, верой и духовными представлениями.`,
      `Общее пояснение: значение слова «${word}» часто употребляется в религиозном, культурном или историческом контексте.`,
    ],
    relatedWords: ['божество', 'вера', 'религия', 'творец'],
  },
  {
    id: 'movement_run',
    pos: 'verb',
    keywords: ['run', 'move quickly', 'jog', 'rush'],
    definitionTemplate: (word) =>
      `«${word}» — быстро передвигаться на ногах, совершая бег.`,
    simpleExplanationTemplate: (word) =>
      `${word} — значит быстро двигаться пешком.`,
    examplesTemplate: (word) => [
      `Общее пояснение: глагол «${word}» обозначает активное движение.`,
      `Общее пояснение: слово «${word}» употребляется, когда речь идет о быстром перемещении.`,
    ],
    relatedWords: ['бежать', 'двигаться', 'мчаться', 'спешить'],
  },
  {
    id: 'reading_action',
    pos: 'verb',
    keywords: ['read', 'reading', 'interpret text', 'study text'],
    definitionTemplate: (word) =>
      `«${word}» — воспринимать и понимать написанный текст.`,
    simpleExplanationTemplate: (word) =>
      `${word} — значит знакомиться с текстом или книгой.`,
    examplesTemplate: (word) => [
      `Общее пояснение: глагол «${word}» связан с текстом, книгами и восприятием информации.`,
      `Общее пояснение: слово «${word}» часто употребляется в учебном и бытовом контексте.`,
    ],
    relatedWords: ['изучать', 'смотреть', 'книга', 'текст'],
  },
  {
    id: 'writing_action',
    pos: 'verb',
    keywords: ['write', 'writing', 'record text', 'compose'],
    definitionTemplate: (word) =>
      `«${word}» — создавать или записывать текст, знаки или сообщения.`,
    simpleExplanationTemplate: (word) =>
      `${word} — значит записывать мысли, слова или информацию.`,
    examplesTemplate: (word) => [
      `Общее пояснение: глагол «${word}» связан с созданием текста и записью информации.`,
      `Общее пояснение: слово «${word}» часто употребляется в учебном, рабочем и бытовом контексте.`,
    ],
    relatedWords: ['записывать', 'сочинять', 'текст', 'сообщение'],
  },
  {
    id: 'speaking_action',
    pos: 'verb',
    keywords: ['speak', 'talk', 'say', 'communicate', 'utter'],
    definitionTemplate: (word) =>
      `«${word}» — выражать мысли словами, произнося речь вслух.`,
    simpleExplanationTemplate: (word) =>
      `${word} — значит общаться или высказывать что-то словами.`,
    examplesTemplate: (word) => [
      `Общее пояснение: глагол «${word}» связан с речью и общением.`,
      `Общее пояснение: слово «${word}» употребляется, когда речь идет о разговоре или высказывании.`,
    ],
    relatedWords: ['разговаривать', 'сказать', 'общаться', 'речь'],
  },
  {
    id: 'thinking_action',
    pos: 'verb',
    keywords: ['think', 'consider', 'reflect', 'reason'],
    definitionTemplate: (word) =>
      `«${word}» — рассуждать, обдумывать или формировать мысли.`,
    simpleExplanationTemplate: (word) =>
      `${word} — значит размышлять о чем-либо.`,
    examplesTemplate: (word) => [
      `Общее пояснение: глагол «${word}» связан с размышлением и внутренней умственной работой.`,
      `Общее пояснение: слово «${word}» часто употребляется в нейтральном и рассуждающем контексте.`,
    ],
    relatedWords: ['размышлять', 'обдумывать', 'решать', 'считать'],
  },
  {
    id: 'making_creation',
    pos: 'verb',
    keywords: ['make', 'create', 'produce', 'build', 'carry out', 'implement', 'perform', 'execute'],
    definitionTemplate: (word) =>
      `«${word}» — выполнять, проводить или доводить действие до практического результата.`,
    simpleExplanationTemplate: (word) =>
      `${word} — значит делать нечто на практике: выполнять план, действие или задачу.`,
    examplesTemplate: (word) => [
      `Общее пояснение: глагол «${word}» связан с действием, созданием или подготовкой результата.`,
      `Общее пояснение: слово «${word}» часто употребляется в бытовом и рабочем контексте.`,
    ],
    relatedWords: ['создавать', 'изготавливать', 'дело', 'результат'],
  },
  {
    id: 'beauty_quality',
    pos: 'adjective',
    keywords: ['beautiful', 'handsome', 'pretty', 'attractive', 'lovely', 'good-looking'],
    definitionTemplate: (word) =>
      `«${word}» — обладающий внешней или выразительной красотой, приятный для восприятия.`,
    simpleExplanationTemplate: (word) =>
      `${word} — так говорят о том, что выглядит гармонично, привлекательно или эстетично.`,
    examplesTemplate: (word) => [
      `Общее пояснение: прилагательное «${word}» описывает красоту или привлекательность.`,
      `Общее пояснение: значение слова «${word}» связано с положительным зрительным впечатлением.`,
    ],
    relatedWords: ['привлекательный', 'эстетичный', 'изящный', 'гармоничный'],
  },
  {
    id: 'size_quality',
    pos: 'adjective',
    keywords: ['big', 'large', 'small', 'tiny', 'great'],
    definitionTemplate: (word) =>
      `«${word}» — обозначает признак, связанный с размером или масштабом предмета.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это признак, который описывает величину или размер.`,
    examplesTemplate: (word) => [
      `Общее пояснение: прилагательное «${word}» используется для описания размера или масштаба.`,
      `Общее пояснение: значение слова «${word}» связано с характеристикой предмета.`,
    ],
    relatedWords: ['размер', 'крупный', 'маленький', 'величина'],
  },
  {
    id: 'good_bad_quality',
    pos: 'adjective',
    keywords: ['good', 'bad', 'excellent', 'poor', 'fine'],
    definitionTemplate: (word) =>
      `«${word}» — обозначает оценочный признак качества, состояния или свойства.`,
    simpleExplanationTemplate: (word) =>
      `${word} — это слово, которым оценивают что-то как хорошее, плохое или качественное.`,
    examplesTemplate: (word) => [
      `Общее пояснение: прилагательное «${word}» употребляется для оценки предметов, действий или состояний.`,
      `Общее пояснение: значение слова «${word}» связано с качественной характеристикой.`,
    ],
    relatedWords: ['качество', 'оценка', 'свойство', 'характеристика'],
  },
]

export function matchSemanticPattern(
  glosses: string[],
  partOfSpeech?: string,
): SemanticPattern | null {
  const text = normalizeGlossText(glosses)
  if (!text) {
    return null
  }

  const normalizedPos = normalizePartOfSpeech(partOfSpeech)

  let bestPattern: SemanticPattern | null = null
  let bestScore = 0

  for (const pattern of semanticPatterns) {
    if (normalizedPos && pattern.pos && pattern.pos !== normalizedPos) {
      continue
    }

    const score = countKeywordMatches(text, pattern.keywords)
    if (score > bestScore) {
      bestPattern = pattern
      bestScore = score
    }
  }

  return bestScore > 0 ? bestPattern : null
}

export function buildSemanticAssistFromPatterns(
  word: string,
  partOfSpeech: string | undefined,
  glosses: string[],
): SemanticAssistResult | null {
  const pattern = matchSemanticPattern(glosses, partOfSpeech)
  if (!pattern) {
    return null
  }

  return {
    definition: pattern.definitionTemplate(word),
    simpleExplanation: pattern.simpleExplanationTemplate(word),
    examples: pattern.examplesTemplate(word),
    relatedWords: pattern.relatedWords,
    patternId: pattern.id,
  }
}
