import type { WordLanguage } from '../types/word'

export type UiLanguage = WordLanguage

export const uiLanguages: UiLanguage[] = ['ru', 'en']

export const translations = {
  ru: {
    header: {
      home: 'Главная',
      learn: 'Изучение',
      about: 'О проекте',
      languageToggle: 'Язык интерфейса',
    },
    search: {
      placeholder: 'Введите слово',
      ariaLabel: 'Поиск слова',
      clear: 'Очистить ввод',
      submit: 'Найти',
      submitAria: 'Запустить поиск',
      hint: 'Поддерживаются отдельные слова и короткие выражения.',
      detected: 'Распознан язык',
      detectedRu: 'русский',
      detectedEn: 'английский',
      detectedUnknown: 'не определен',
    },
    home: {
      eyebrow: 'Поиск и анализ слова',
      title: 'Умный словарь русской и английской лексики',
      description:
        'Введи слово, чтобы получить определение, примеры, стилистику и рекомендации по употреблению.',
      randomWord: 'Случайное слово',
      wordOfTheDay: 'Слово дня',
      wordOfTheDayDescription:
        'Быстрый способ начать работу: открой карточку и посмотри значение, стиль и типичные ошибки.',
      openCard: 'Открыть карточку',
      recentSearches: 'Последние запросы',
      recentEmpty: 'История пока пуста. Найди первое слово и вернись сюда для повторения.',
      favorites: 'Избранные слова',
      favoritesEmpty: 'Здесь будут слова, которые ты отметил для повторения.',
    },
    learn: {
      eyebrow: 'Практика и категории',
      title: 'Изучение лексики',
      description:
        'Раздел помогает быстро ориентироваться в стилях речи и типичных речевых ошибках. Выбери категорию и используй примеры для тренировки формулировок.',
      steps: [
        '1. Выбери категорию сложности',
        '2. Открой слово из примеров',
        '3. Проверь стиль и контекст',
      ],
      categoriesTitle: 'Категории практики',
      categoriesCount: 'тематических блоков',
      categoryLabel: 'Категория',
      openMaterials: 'Открыть материалы',
      collectionsTitle: 'Готовые подборки',
      collectionsDescription:
        'Используй наборы для практики: открой слово и проверь его стиль, примеры и уместность.',
      collectionWords: 'Слова для тренировки',
      backToCategories: 'К категориям',
      categoryTip:
        'Совет: открой 2-3 примера подряд и сравни стилистику в карточках слов.',
      practiceExamples: 'Примеры для практики',
      practiceDescription:
        'Нажми на пример, чтобы открыть карточку слова и посмотреть стиль употребления.',
    },
    about: {
      title: 'О проекте',
      intro:
        'Слово+ — учебный веб-сервис по русскому и английскому языкам. Он сочетает поиск по словарю, локальную базу стилистических подсказок и инструменты практики, чтобы помогать пользователю писать точнее и грамотнее.',
      solvesTitle: 'Что решает сервис',
      solves: [
        'Показывает определение слова, примеры и часть речи.',
        'Подсказывает стилистическую уместность и типичные ошибки.',
        'Даёт связанные слова для расширения словарного запаса.',
        'Сохраняет историю и избранные слова для повторения.',
        'Предлагает мини-квиз для закрепления материала.',
      ],
      audienceTitle: 'Кому подходит',
      audience:
        'Школьникам, студентам, преподавателям и всем, кто хочет улучшить письменную и устную речь, научиться точнее выбирать слова и ориентироваться в стилях русского и английского языка.',
    },
    word: {
      cardEyebrow: 'Карточка слова',
      back: 'Назад',
      loading: 'Ищем определение...',
      errorSuffix: 'Можно попробовать другой запрос или открыть раздел изучения.',
      emptyTitle: 'Не удалось подобрать карточку',
      emptyDescription:
        'Попробуй более распространённое слово, проверь написание или открой учебные подборки.',
      openLearning: 'Открыть раздел «Изучение»',
      backHome: 'Вернуться на главную',
      fallbackNotice:
        'Если слово не найдено в источнике, сервис покажет аккуратное сообщение без мусорных данных.',
    },
    error: {
      title: 'Сервис временно недоступен',
      reload: 'Обновить страницу',
      learn: 'Перейти в раздел «Изучение»',
    },
    footer: 'Слово+ · MVP',
  },
  en: {
    header: {
      home: 'Home',
      learn: 'Learn',
      about: 'About',
      languageToggle: 'Interface language',
    },
    search: {
      placeholder: 'Enter a word',
      ariaLabel: 'Word search',
      clear: 'Clear input',
      submit: 'Search',
      submitAria: 'Run search',
      hint: 'Single words and short phrases are supported.',
      detected: 'Detected language',
      detectedRu: 'Russian',
      detectedEn: 'English',
      detectedUnknown: 'not detected',
    },
    home: {
      eyebrow: 'Word search and analysis',
      title: 'A smart dictionary for Russian and English vocabulary',
      description:
        'Enter a word to get a definition, examples, style notes, and usage recommendations.',
      randomWord: 'Random word',
      wordOfTheDay: 'Word of the day',
      wordOfTheDayDescription:
        'A quick way to start: open a card and review the meaning, style, and common mistakes.',
      openCard: 'Open card',
      recentSearches: 'Recent searches',
      recentEmpty: 'History is empty. Search for a first word and return here to review it.',
      favorites: 'Favorite words',
      favoritesEmpty: 'Words you mark for review will appear here.',
    },
    learn: {
      eyebrow: 'Practice and categories',
      title: 'Vocabulary practice',
      description:
        'This section helps you navigate speech styles and common wording issues. Choose a category and use examples to practice clearer phrasing.',
      steps: [
        '1. Choose a practice category',
        '2. Open a word from examples',
        '3. Check style and context',
      ],
      categoriesTitle: 'Practice categories',
      categoriesCount: 'topic blocks',
      categoryLabel: 'Category',
      openMaterials: 'Open materials',
      collectionsTitle: 'Ready-made sets',
      collectionsDescription:
        'Use these sets for practice: open a word and check its style, examples, and fit.',
      collectionWords: 'Practice words',
      backToCategories: 'Back to categories',
      categoryTip:
        'Tip: open 2-3 examples in a row and compare their style in word cards.',
      practiceExamples: 'Practice examples',
      practiceDescription:
        'Click an example to open a word card and review usage style.',
    },
    about: {
      title: 'About',
      intro:
        'Slovo+ is an educational web service for Russian and English. It combines dictionary lookup, local style hints, and practice tools to help users write more accurately.',
      solvesTitle: 'What the service solves',
      solves: [
        'Shows a word definition, examples, and part of speech.',
        'Highlights stylistic fit and common mistakes.',
        'Suggests related words for vocabulary growth.',
        'Keeps recent searches and favorites for review.',
        'Offers a mini quiz for retention.',
      ],
      audienceTitle: 'Who it is for',
      audience:
        'School students, university students, teachers, and anyone who wants to improve written and spoken language, choose words more precisely, and understand style in Russian and English.',
    },
    word: {
      cardEyebrow: 'Word card',
      back: 'Back',
      loading: 'Searching definition...',
      errorSuffix: 'Try another query or open the learning section.',
      emptyTitle: 'No word card available',
      emptyDescription:
        'Try a more common word, check spelling, or open learning collections.',
      openLearning: 'Open learning',
      backHome: 'Back home',
      fallbackNotice:
        'If no reliable entry is found, the service shows a clear message instead of noisy data.',
    },
    error: {
      title: 'Service temporarily unavailable',
      reload: 'Reload page',
      learn: 'Open learning',
    },
    footer: 'Slovo+ · MVP',
  },
}

export type Translations = typeof translations.ru
