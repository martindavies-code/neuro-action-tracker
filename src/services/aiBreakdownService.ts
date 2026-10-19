import type { SubTask } from '../types';

interface TemplateRule {
  id: string;
  // Exact or multi-word high-priority phrases (10+ weight)
  primaryPhrases: string[];
  // Single keywords for title/description matching (3-5 weight)
  secondaryKeywords: string[];
  // Negative keywords to prevent cross-template false positives
  negativeKeywords?: string[];
  steps: string[];
}

const NEURO_BREAKDOWN_TEMPLATES: TemplateRule[] = [
  // 1. Dental / Oral Hygiene
  {
    id: 'teeth',
    primaryPhrases: [
      'brush teeth',
      'brushing teeth',
      'brush teeth (morning)',
      'brush teeth (evening)',
      'brush teeth (night)',
      'dental care',
      'floss teeth',
      'mouthwash',
      'cepillar dientes',
      'cepillarse los dientes',
      'se brosser les dents',
      'zähne putzen',
      'zahn',
      'escovar dentes',
      'escovar os dentes',
      'lavarsi i denti',
      '歯磨き',
      'はみがき',
      '刷牙',
      '양치',
      '양치질',
    ],
    secondaryKeywords: ['teeth', 'tooth', 'floss', 'toothpaste', 'toothbrush', 'dientes', 'dents', 'zähne', 'dente'],
    steps: [
      'Go to the bathroom and put toothpaste on your brush',
      'Brush top teeth with gentle circular motions for 1 minute',
      'Brush bottom teeth and tongue gently for 1 minute',
      'Rinse with fresh water and feel that clean, refreshed smile!',
    ],
  },

  // 2. Hydration / Drinking Water
  {
    id: 'hydration',
    primaryPhrases: [
      'drink water',
      'glasses of water',
      'drink 2 glasses',
      'stay hydrated',
      'hydration hero',
      'beber agua',
      'boire de l eau',
      'wasser trinken',
      'beber água',
      'bere acqua',
      '水を飲む',
      '喝水',
      '물 마시기',
    ],
    secondaryKeywords: ['hydrate', 'hydration', 'water', 'water bottle', 'glass of water', 'agua', 'wasser'],
    steps: [
      'Grab your favorite clean cup or water bottle',
      'Fill it with fresh, cold or room-temperature water',
      'Take 4 to 5 slow, refreshing sips and feel the instant energy reset',
      'Keep the bottle near your desk or space for easy sipping!',
    ],
  },

  // 3. Vitamins / Medication
  {
    id: 'medication',
    primaryPhrases: [
      'take medication',
      'daily vitamins',
      'take pills',
      'prescription call',
      'tomar medicamentos',
      'prendre médicaments',
      'medikamente einnehmen',
      'tomar remédio',
      'prendere medicine',
      '薬を飲む',
      '服药',
      '吃药',
      '약 먹기',
    ],
    secondaryKeywords: ['meds', 'medication', 'vitamin', 'vitamins', 'pill', 'pills', 'supplement', 'prescript'],
    steps: [
      'Pour a fresh glass of water',
      'Open your pill organizer or bottle and take your scheduled dose',
      'Swallow with water and put the bottle back in its designated spot',
      'Give yourself credit for caring for your body today!',
    ],
  },

  // 4. Room / Desk / Space Reset & Declutter
  {
    id: 'space_reset',
    primaryPhrases: [
      'space reset',
      '5-minute space reset',
      'tidy room',
      'clean room',
      'clean desk',
      'tidy desk',
      'declutter space',
      'bedroom reset',
      'limpiar habitacion',
      'ranger la chambre',
      'zimmer aufräumen',
      'arrumar o quarto',
      'ordinare stanza',
      '部屋の掃除',
      '整理房间',
      '방 정리',
    ],
    secondaryKeywords: ['declutter', 'space reset', 'tidy', 'mess', 'organize room', 'clutter'],
    steps: [
      'Pick up 3 pieces of obvious trash or wrappers and bin them',
      'Carry any cups, plates, or mugs to the kitchen sink',
      'Toss any dirty clothes into the laundry hamper',
      'Wipe down or clear one single flat surface (desk or nightstand)',
      'Step back, take a deep breath, and enjoy your open, calm space!',
    ],
  },

  // 5. Dishes / Kitchen Cleaning
  {
    id: 'dishes',
    primaryPhrases: [
      'do dishes',
      'wash dishes',
      'dishwasher',
      'sink full of dishes',
      'lavar platos',
      'faire la vaisselle',
      'geschirr spülen',
      'lavar louça',
      'lavare i piatti',
      '皿洗い',
      '洗碗',
      '설거지',
    ],
    secondaryKeywords: ['dish', 'dishes', 'dishwasher', 'plates', 'pots', 'pans', 'sponge', 'kitchen sink'],
    steps: [
      'Turn on the tap with warm water and add soap to the sponge',
      'Rinse food off plates and stack them neatly by type',
      'Wash just 3 to 5 easy items first to build quick momentum',
      'Finish the remaining items or load into the dishwasher',
      'Wipe down the sink and admire your fresh, clear kitchen!',
    ],
  },

  // 6. Laundry / Clothes
  {
    id: 'laundry',
    primaryPhrases: [
      'do laundry',
      'wash clothes',
      'fold laundry',
      'laundry basket',
      'dryer',
      'lavar ropa',
      'faire la lessive',
      'wäsche waschen',
      'lavar roupa',
      'fare il bucato',
      '洗濯',
      '洗衣服',
      '빨래',
    ],
    secondaryKeywords: ['laundry', 'hamper', 'washer', 'dryer', 'fold clothes'],
    steps: [
      'Gather dirty clothes into the basket (no sorting needed yet)',
      'Carry basket to the washer and load clothes in',
      'Add detergent and press the start button',
      'Set a gentle phone reminder for when the cycle finishes',
    ],
  },

  // 7. Showering / Bathing / Personal Hygiene
  {
    id: 'shower',
    primaryPhrases: [
      'take shower',
      'warm shower',
      'take a bath',
      'wash hair',
      'evening shower',
      'morning shower',
      'ducharse',
      'tomar una ducha',
      'prendre une douche',
      'duschen gehen',
      'tomar banho',
      'fare la doccia',
      'シャワーを浴びる',
      '洗澡',
      '샤워하기',
    ],
    secondaryKeywords: ['shower', 'bath', 'bathing', 'body wash', 'shampoo'],
    steps: [
      'Grab a fresh towel and your favorite comfortable clothes',
      'Turn on the shower and adjust to the perfect soothing temperature',
      'Step in and let the warm water relax your shoulders for 1 minute',
      'Quick gentle wash with your favorite soap or shampoo with zero rushing',
      'Wrap in your warm towel and enjoy the refreshing clean feeling!',
    ],
  },

  // 8. Food Prep / Cooking / Eating
  {
    id: 'food',
    primaryPhrases: [
      'eat meal',
      'nourishing meal',
      'eat breakfast',
      'make lunch',
      'cook dinner',
      'prepare snack',
      'comida saludable',
      'repas sain',
      'gesunde mahlzeit',
      'refeição saudável',
      'pasto nutriente',
      'ご飯を食べる',
      '吃饭',
      '식사하기',
    ],
    secondaryKeywords: ['cook', 'cooking', 'meal', 'dinner', 'lunch', 'breakfast', 'snack', 'food', 'nourish', 'recipe'],
    steps: [
      'Go to the kitchen and pour a glass of water',
      'Choose one simple, low-effort food or 2 easy ingredients',
      'Assemble or heat your meal with zero rush or perfectionism',
      'Sit down in a comfortable spot, eat, and nourish your brain!',
    ],
  },

  // 9. Movement / Stretching / Walking
  {
    id: 'movement',
    primaryPhrases: [
      'gentle stretch',
      '5-minute stretch',
      'stretch or movement',
      'daily walk',
      'take a walk',
      'morning stretch',
      'estiramiento suave',
      'étirement doux',
      'sanftes dehnen',
      'alongamento suave',
      'stretching dolce',
      '軽いストレッチ',
      '拉伸运动',
      '스트레칭',
    ],
    secondaryKeywords: ['stretch', 'stretching', 'yoga', 'walk', 'walking', 'workout', 'exercise', 'movement', 'gym'],
    steps: [
      'Put on comfortable socks/shoes and take a deep breath',
      'Gently roll your shoulders back and stretch your neck side-to-side',
      'Do 2 minutes of gentle full-body stretches or easy walking',
      'Shake out any residual muscle tension and celebrate moving your body!',
    ],
  },

  // 10. Email / Text / Messaging Communication
  {
    id: 'communication',
    primaryPhrases: [
      'reply to email',
      'send email',
      'reply message',
      'text friend',
      'make phone call',
      'doctor call',
      'responder correo',
      'répondre email',
      'e-mail beantworten',
      'responder e-mail',
      'rispondere email',
      'メール返信',
      '回复邮件',
      '이메일 답장',
    ],
    secondaryKeywords: ['email', 'message', 'text', 'reply', 'inbox', 'slack', 'discord'],
    steps: [
      'Open the messaging or email app and locate the specific message',
      'Draft 1 or 2 simple, direct sentences (keep it brief and low pressure)',
      'Give it one quick read without overthinking or second-guessing',
      'Press send and immediately close the app to free your mind!',
    ],
  },

  // 11. Study / Reading / Writing / Homework
  {
    id: 'study',
    primaryPhrases: [
      'study for exam',
      'do homework',
      'read chapter',
      'write essay',
      'read book',
      'deep study',
      'estudiar para examen',
      'faire les devoirs',
      'hausaufgaben machen',
      'estudar para prova',
      'fare i compiti',
      '勉強する',
      '学习',
      '공부하기',
    ],
    secondaryKeywords: ['study', 'studying', 'homework', 'exam', 'read', 'reading', 'essay', 'paper', 'textbook'],
    steps: [
      'Open only the single document, book, or editor tab you need',
      'Set a low-pressure 5-minute timer (just 5 minutes to start)',
      'Read or write just the first 2 paragraphs or bullet notes',
      'Pause, stretch, and decide if you want to keep the momentum going!',
    ],
  },

  // 12. Coding / Software Development / Bug Fixing
  {
    id: 'coding',
    primaryPhrases: [
      'fix bug',
      'write code',
      'code feature',
      'debug issue',
      'git commit',
      'programming',
      'corregir error',
      'corriger bug',
      'bug beheben',
      'corrigir bug',
      'risolvere bug',
      'バグ修正',
      '修复Bug',
      '버그 수정',
    ],
    secondaryKeywords: ['code', 'coding', 'programmer', 'software', 'debug', 'git', 'refactor', 'typescript', 'python', 'react'],
    steps: [
      'Open your editor and locate the specific target file or test',
      'Write down the expected vs actual behavior in one clear sentence',
      'Make the smallest isolated code change or add a test log',
      'Run the test, verify the resolution, and commit your clean code!',
    ],
  },

  // 13. Plant Care / Gardening
  {
    id: 'plants',
    primaryPhrases: [
      'water plants',
      'water houseplants',
      'plant care',
      'regar plantas',
      'arroser les plantes',
      'pflanzen gießen',
      'regar plantas',
      'annaffiare le piante',
      '植物の水やり',
      '给植物浇水',
      '식물 물주기',
    ],
    secondaryKeywords: ['plant', 'plants', 'houseplant', 'houseplants', 'gardening', 'flower', 'succulent'],
    steps: [
      'Fill a watering can or glass with fresh room-temperature water',
      'Check the soil moisture of your plants with your fingertip',
      'Give each thirsty plant a gentle drink around the soil base',
      'Admire your green friends thriving in your calm space!',
    ],
  },
];

const REGEX_CACHE = new Map<string, RegExp>();
function getWordBoundaryRegex(kw: string): RegExp {
  let cached = REGEX_CACHE.get(kw);
  if (!cached) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cached = new RegExp(`\\b${escaped}\\b`, 'i');
    REGEX_CACHE.set(kw, cached);
  }
  return cached;
}

/**
 * Generates 3-5 gentle, neuro-affirming micro-steps specifically tailored to the given task.
 * Uses weighted semantic phrase matching so task titles have top priority over generic description words.
 */
export async function generateMagicSubTasks(taskTitle: string, taskDescription?: string): Promise<SubTask[]> {
  const cleanTitle = (taskTitle || '').toLowerCase().trim();
  const cleanDesc = (taskDescription || '').toLowerCase().trim();

  let bestTemplate: TemplateRule | null = null;
  let highestScore = 0;

  for (const template of NEURO_BREAKDOWN_TEMPLATES) {
    let score = 0;

    // A. Check Primary Phrases in Title (Weight: 20 points)
    for (const phrase of template.primaryPhrases) {
      if (cleanTitle.includes(phrase)) {
        score += 20;
      }
    }

    // B. Check Secondary Keywords in Title (Weight: 8 points)
    for (const kw of template.secondaryKeywords) {
      const regex = getWordBoundaryRegex(kw);
      if (regex.test(cleanTitle)) {
        score += 8;
      } else if (cleanTitle.includes(kw)) {
        score += 4;
      }
    }

    // C. Check Secondary Keywords in Description (Weight: 2 points)
    if (cleanDesc) {
      for (const kw of template.secondaryKeywords) {
        const regex = getWordBoundaryRegex(kw);
        if (regex.test(cleanDesc)) {
          score += 2;
        }
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestTemplate = template;
    }
  }

  // 1. Return highest-scoring matched template
  if (bestTemplate) {
    return bestTemplate.steps.map((title, idx) => ({
      id: `st_${Date.now()}_${idx}`,
      title,
      completed: false,
    }));
  }

  // 2. Dynamic Context-Aware Synthesis for unique/custom tasks
  const displayTitle = taskTitle.replace(/^[^\w\s]+/, '').trim() || 'this task';
  const customSteps = [
    `Gather what you need and set up a comfortable spot for: ${displayTitle}`,
    `Do just the easiest first 2-minute physical step (no pressure to finish all of it)`,
    `Continue making steady, gentle progress at your own natural pace`,
    `Wrap up, take a pause, and celebrate taking action on "${displayTitle}"!`,
  ];

  return customSteps.map((title, idx) => ({
    id: `st_${Date.now()}_${idx}`,
    title,
    completed: false,
  }));
}

export interface TaskDifficultyAssessment {
  xp: number;
  tier: 'micro' | 'quick' | 'moderate' | 'high' | 'epic';
  tierLabel: string;
  reason: string;
}

/**
 * AI Cognitive Effort & Neurodivergent Executive Friction Evaluator.
 * Analyzes activation resistance (e.g. phone calls, paperwork, deep cleaning),
 * duration, priority, and sub-step complexity to assign fair, dopamine-calibrated XP.
 */
export function calculateTaskDifficultyAndXP(
  title: string,
  description: string = '',
  estimatedMinutes: number = 5,
  priority: 'low' | 'medium' | 'high' = 'medium',
  subTaskCount: number = 0
): TaskDifficultyAssessment {
  const safeTitle = typeof title === 'string' ? title.slice(0, 300) : '';
  const safeDesc = typeof description === 'string' ? description.slice(0, 2000) : '';
  const safeMinutes = Number.isFinite(estimatedMinutes) ? Math.max(1, Math.min(1440, Math.floor(estimatedMinutes))) : 5;
  const safePriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
  const safeSubTaskCount = Number.isFinite(subTaskCount) ? Math.max(0, Math.floor(subTaskCount)) : 0;

  const text = `${safeTitle} ${safeDesc}`.toLowerCase();

  // 1. High activation barrier / social friction / bureaucracy triggers
  const highFrictionPatterns = [
    /\b(call|phone|schedule|appointment|doctor|dentist|bank|tax|taxes|invoice|bill|bills|insurance|paperwork|forms|apply|interview|exam|study|essay|deadline|urgent|presentation|financial|budget)\b/i,
  ];

  // 2. Physical & sensory exhaustion triggers (Deep cleaning, laundry mountains, workouts)
  const physicalFrictionPatterns = [
    /\b(scrub|deep clean|clean bathroom|wash sheets|bedsheets|laundry|fold laundry|vacuum|mop|groceries|cook dinner|meal prep|workout|gym|run|exercise|dishes)\b/i,
  ];

  // 3. Dopamine micro-wins (< 2 mins, immediate reset)
  const microWinPatterns = [
    /\b(water|hydrate|drink|sip|pill|vitamin|meds|medication|breathe|breath|stretch|smile|sunlight|outside)\b/i,
  ];

  // 4. Moderate routine upkeep
  const moderatePatterns = [
    /\b(brush teeth|shower|wash face|tidy|make bed|walk|read|journal|organize|trash|recycle|check email)\b/i,
  ];

  let baseScore = 15;
  const reasons: string[] = [];

  const isHighFriction = highFrictionPatterns.some((p) => p.test(text));
  const isPhysicalFriction = physicalFrictionPatterns.some((p) => p.test(text));
  const isMicroWin = microWinPatterns.some((p) => p.test(text));
  const isModerate = moderatePatterns.some((p) => p.test(text));

  if (isHighFriction) {
    baseScore = 20;
    reasons.push('High executive activation barrier');
  } else if (isPhysicalFriction) {
    baseScore = 18;
    reasons.push('Physical & sensory energy demand');
  } else if (isMicroWin && safeMinutes <= 3) {
    baseScore = 5;
    reasons.push('Instant dopamine micro-win');
  } else if (isModerate && safeMinutes <= 10) {
    baseScore = 10;
    reasons.push('Daily routine maintenance');
  }

  // Duration modifier
  if (safeMinutes >= 30) {
    baseScore += 5;
    reasons.push('30+ min sustained focus');
  } else if (safeMinutes >= 15 && baseScore < 20) {
    baseScore += 3;
    reasons.push('15+ min time commitment');
  } else if (safeMinutes <= 2 && baseScore > 10) {
    baseScore -= 5;
  }

  // Priority modifier
  if (safePriority === 'high') {
    baseScore += 3;
    reasons.push('High priority focus');
  } else if (safePriority === 'low' && baseScore > 10) {
    baseScore -= 2;
  }

  // Sub-task complexity modifier
  if (safeSubTaskCount >= 4) {
    baseScore += 3;
    reasons.push(`${safeSubTaskCount} structured steps`);
  } else if (safeSubTaskCount >= 2 && baseScore < 20) {
    baseScore += 2;
  }

  // Clamp to discrete game balance tiers: 5, 10, 15, 20, 25
  let finalXP = 15;
  if (baseScore <= 7) finalXP = 5;
  else if (baseScore <= 12) finalXP = 10;
  else if (baseScore <= 18) finalXP = 15;
  else if (baseScore <= 23) finalXP = 20;
  else finalXP = 25;

  let tier: TaskDifficultyAssessment['tier'] = 'moderate';
  let tierLabel = '✨ Focused Routine';

  switch (finalXP) {
    case 5:
      tier = 'micro';
      tierLabel = '🌱 Micro Win';
      break;
    case 10:
      tier = 'quick';
      tierLabel = '⚡ Quick Win';
      break;
    case 15:
      tier = 'moderate';
      tierLabel = '✨ Focused Routine';
      break;
    case 20:
      tier = 'high';
      tierLabel = '🔥 High Activation Barrier';
      break;
    case 25:
      tier = 'epic';
      tierLabel = '⭐ Major Milestone';
      break;
  }

  return {
    xp: finalXP,
    tier,
    tierLabel,
    reason: reasons.join(' • ') || 'Calculated by AI based on cognitive inertia & time',
  };
}
