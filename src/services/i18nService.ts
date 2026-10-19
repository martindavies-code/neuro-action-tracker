import type { SupportedLanguage } from '../types';

export interface TranslationSchema {
  // Tabs & Navigation
  tab_today: string;
  tab_focus: string;
  tab_dashboard: string;
  tab_settings: string;

  // Header & Brand
  brand_subtitle: string;
  level_badge: string;
  streak_badge: string;
  shields_badge: string;
  sync_cloud: string;
  sync_offline: string;
  account: string;
  sign_in: string;

  // Checklist & Filters
  checklist_title: string;
  checklist_subtitle: string;
  filter_today: string;
  filter_oneoff: string;
  filter_morning: string;
  filter_afternoon: string;
  filter_evening: string;
  filter_all: string;
  priority_all: string;
  priority_high: string;
  priority_medium: string;
  priority_low: string;
  add_task_btn: string;
  focus_spotlight_btn: string;
  task_roulette_btn: string;
  command_menu_btn: string;
  completed_banner: string;
  all_done_title: string;
  all_done_subtitle: string;
  empty_filtered: string;
  all_tasks_done_toast: string;

  // Battery / Spoon Theory
  energy_question: string;
  energy_high: string;
  energy_moderate: string;
  energy_low: string;
  energy_high_desc: string;
  energy_moderate_desc: string;
  energy_low_desc: string;
  spoon_theory_explanation: string;

  // Ambient Sounds
  ambient_title: string;
  ambient_soundscapes_title: string;
  sound_brown: string;
  sound_rain: string;
  sound_ocean: string;
  sound_forest: string;
  sound_stop: string;
  sound_volume: string;
  stop_soundscape: string;

  // Task Card & Details
  start_focus: string;
  edit_task: string;
  delete_task: string;
  confirm_delete_task: string;
  substeps_progress: string;
  add_first_step: string;
  break_down_step: string;
  steps_label: string;

  // Focus Mode
  focus_title: string;
  focus_flowing: string;
  focus_paused: string;
  pause_focus: string;
  reset_timer: string;
  ready_to_focus: string;
  no_active_tasks_focus: string;
  create_task_action: string;
  complete_claim_xp: string;
  back_to_checklist: string;
  skip_next_task: string;
  micro_steps_title: string;
  auto_break_down: string;
  type_micro_step: string;
  add_step_btn: string;

  // Dashboard & Charts
  current_rank: string;
  total_xp_earned: string;
  xp_to_next_level: string;
  current_streak_label: string;
  best_streak_label: string;
  shields_label: string;
  badges_label: string;
  seven_day_history_title: string;
  routines_by_time_title: string;
  consistency_grid_title: string;
  badges_gallery_title: string;
  what_is_xp_btn: string;
  progress_to_next_rank: string;
  active_routines_label: string;
  less_active: string;
  more_active: string;
  days_count: string;
  active_count: string;

  // Search & Command Palette
  search_title: string;
  search_subtitle: string;
  search_placeholder: string;
  search_no_match: string;
  search_no_match_hint: string;
  clear_search_btn: string;
  esc_to_close: string;

  // Task Roulette / Spinner
  spinner_title: string;
  spinner_subtitle: string;
  spinner_all_done: string;
  spinner_all_done_sub: string;
  spinner_cta: string;
  spinner_spin_btn: string;
  spinner_spinning: string;
  spinner_start_task: string;

  // Modals & Settings
  create_task_title: string;
  edit_task_title: string;
  task_title_label: string;
  routine_time_label: string;
  priority_label: string;
  reward_xp_label: string;
  cancel_btn: string;
  save_changes_btn: string;
  danger_zone_title: string;
  danger_zone_desc: string;
  reset_account_btn: string;
  confirm_reset_account: string;
  language_label: string;
  language_auto: string;
  theme_label: string;
  dyslexic_font_label: string;
  bionic_reading_label: string;
  sound_effects_label: string;
}

export const TRANSLATIONS: Record<string, TranslationSchema> = {
  en: {
    tab_today: "Today's List",
    tab_focus: 'Focus Mode',
    tab_dashboard: 'Progress & Stats',
    tab_settings: 'Settings',

    brand_subtitle: 'Gentle Daily Tracker',
    level_badge: 'LVL',
    streak_badge: 'Streak',
    shields_badge: 'Shields',
    sync_cloud: 'Cloud Synced',
    sync_offline: 'Local Storage',
    account: 'Account',
    sign_in: 'Sign In / Backup',

    checklist_title: "Today's Micro-Wins",
    checklist_subtitle: 'Gentle routines engineered for neurodivergent momentum',
    filter_today: "Today's Focus",
    filter_oneoff: 'One-Off Tasks',
    filter_morning: 'Morning',
    filter_afternoon: 'Afternoon',
    filter_evening: 'Evening',
    filter_all: 'All Routines',
    priority_all: 'All Priorities',
    priority_high: 'High Focus',
    priority_medium: 'Medium',
    priority_low: 'Gentle / Low Effort',
    add_task_btn: 'New Task',
    focus_spotlight_btn: 'Focus Spotlight',
    task_roulette_btn: 'Task Roulette',
    command_menu_btn: 'Search Tasks',
    completed_banner: 'Rhythm Completed',
    all_done_title: '✨ All routines done! You did incredible today.',
    all_done_subtitle: 'Rest easy or spin the roulette wheel for an optional bonus task.',
    empty_filtered: 'No tasks match this filter. Take a gentle breath!',
    all_tasks_done_toast: '🌟 All tasks for today are complete!',

    energy_question: 'How is your energy today?',
    energy_high: 'High Energy (All Tasks)',
    energy_moderate: 'Steady Pace (≤15m)',
    energy_low: 'Gentle Mode (1–5m)',
    energy_high_desc: 'High Energy: Shows all routine tasks (including 20+ min deep focus).',
    energy_moderate_desc: 'Steady Pace: Shows tasks up to 15 mins (hides heavy 20+ min tasks).',
    energy_low_desc: 'Gentle Mode: Shows only 1–5 min micro-wins to prevent burnout.',
    spoon_theory_explanation: 'In psychology and neurodiversity (often called Spoon Theory), daily mental energy fluctuates. Selecting Low Energy automatically hides intimidating, high-demand tasks and leaves only gentle micro-actions so you maintain momentum without burnout or guilt.',

    ambient_title: 'Focus Soundscape',
    ambient_soundscapes_title: '🎧 ADHD FOCUS SOUNDSCAPES:',
    sound_brown: 'Brown Noise',
    sound_rain: 'Gentle Rain',
    sound_ocean: 'Ocean Waves',
    sound_forest: 'Forest Wind',
    sound_stop: 'Stop Ambient',
    sound_volume: 'Ambient Sound Volume',
    stop_soundscape: 'Stop Soundscape',

    start_focus: 'Start Focus',
    edit_task: 'Edit Task',
    delete_task: 'Delete Task',
    confirm_delete_task: 'Are you sure you want to delete this routine task?',
    substeps_progress: 'steps done',
    add_first_step: '+ Add first step',
    break_down_step: 'Auto-Breakdown',
    steps_label: 'Steps',

    focus_title: 'Focus Spotlight',
    focus_flowing: 'FLOWING',
    focus_paused: 'PAUSED',
    pause_focus: 'Pause',
    reset_timer: 'Reset',
    ready_to_focus: 'Ready to Focus?',
    no_active_tasks_focus: "You don't have any active tasks right now. Create your first gentle routine to begin!",
    create_task_action: 'Create a Task',
    complete_claim_xp: 'Complete & Claim XP',
    back_to_checklist: 'Back to List',
    skip_next_task: 'Next Focus Task',
    micro_steps_title: 'Micro-Steps',
    auto_break_down: 'Auto-Breakdown',
    type_micro_step: 'Type a gentle 1-minute step...',
    add_step_btn: 'Add Step',

    current_rank: 'CURRENT RANK',
    total_xp_earned: 'Total XP earned',
    xp_to_next_level: 'XP to Level',
    current_streak_label: 'CURRENT STREAK',
    best_streak_label: 'BEST STREAK',
    shields_label: 'STREAK SHIELDS',
    badges_label: 'BADGES UNLOCKED',
    seven_day_history_title: '7-Day Routine Completion',
    routines_by_time_title: 'Routines by Time of Day',
    consistency_grid_title: '28-Day Consistency Grid',
    badges_gallery_title: 'Achievements & Milestones',
    what_is_xp_btn: 'What is XP & How Does It Work?',
    progress_to_next_rank: 'Progress to Next Rank',
    active_routines_label: 'Active Routines',
    less_active: 'Less active',
    more_active: 'More active',
    days_count: 'Days',
    active_count: 'Active',

    search_title: 'Search Tasks & Routines',
    search_subtitle: 'Quickly locate any task, filter routines, or jump into focus mode',
    search_placeholder: 'Search tasks by name, category, or notes...',
    search_no_match: 'No tasks match your search',
    search_no_match_hint: 'Try adjusting your query or switching filter tabs',
    clear_search_btn: 'Clear Search',
    esc_to_close: 'ESC to close',

    spinner_title: 'Overcome Task Paralysis',
    spinner_subtitle: 'Stuck in executive freeze? Let the wheel pick one gentle small win for you. No pressure, just one step.',
    spinner_all_done: 'All routine items are done for today!',
    spinner_all_done_sub: 'Rest, recharge, and celebrate your victory.',
    spinner_cta: 'Click "Spin Wheel" to pick a small win',
    spinner_spin_btn: 'Spin Wheel 🎲',
    spinner_spinning: 'Selecting...',
    spinner_start_task: 'Start This Task Now!',

    create_task_title: 'Create Routine Task',
    edit_task_title: 'Edit Routine Task',
    task_title_label: 'Task Title',
    routine_time_label: 'Time of Day',
    priority_label: 'Priority Level',
    reward_xp_label: 'Reward XP Value',
    cancel_btn: 'Cancel',
    save_changes_btn: 'Save Changes',
    danger_zone_title: '⚠️ Danger Zone: Clear Data & Reset Account',
    danger_zone_desc: 'Completely wipe all routine tasks, XP progress, unlocked badges, and streak data to start fresh.',
    reset_account_btn: 'Clear All Data & Reset',
    confirm_reset_account: 'Are you sure you want to completely wipe all routine data and start fresh? This cannot be undone.',
    language_label: 'Interface Language',
    language_auto: '🌐 Auto (Device Default)',
    theme_label: 'Color Theme & Mood',
    dyslexic_font_label: 'OpenDyslexic Font',
    bionic_reading_label: 'Bionic Reading Mode',
    sound_effects_label: 'Audio Feedback & Lo-Fi Synthesizer',
  },

  es: {
    tab_today: 'Lista de Hoy',
    tab_focus: 'Modo Enfoque',
    tab_dashboard: 'Progreso y Estadísticas',
    tab_settings: 'Ajustes',

    brand_subtitle: 'Rastreador Diario Suave',
    level_badge: 'NIVEL',
    streak_badge: 'Racha',
    shields_badge: 'Escudos',
    sync_cloud: 'Nube Sincronizada',
    sync_offline: 'Almacenamiento Local',
    account: 'Cuenta',
    sign_in: 'Iniciar Sesión / Copia',

    checklist_title: 'Micro-Victorias de Hoy',
    checklist_subtitle: 'Rutinas suaves diseñadas para el impulso neurodivergente',
    filter_today: 'Enfoque de Hoy',
    filter_oneoff: 'Tareas Únicas',
    filter_morning: 'Mañana',
    filter_afternoon: 'Tarde',
    filter_evening: 'Noche',
    filter_all: 'Todas las Rutinas',
    priority_all: 'Todas las Prioridades',
    priority_high: 'Alto Enfoque',
    priority_medium: 'Medio',
    priority_low: 'Suave / Poco Esfuerzo',
    add_task_btn: 'Nueva Tarea',
    focus_spotlight_btn: 'Foco de Atención',
    task_roulette_btn: 'Ruleta de Tareas',
    command_menu_btn: 'Buscar Tareas',
    completed_banner: 'Ritmo Completado',
    all_done_title: '✨ ¡Todas las rutinas listas! Lo hiciste increíble.',
    all_done_subtitle: 'Descansa con calma o gira la ruleta para una tarea opcional.',
    empty_filtered: 'No hay tareas con este filtro. ¡Respira con calma!',
    all_tasks_done_toast: '🌟 ¡Todas las tareas de hoy están completadas!',

    energy_question: '¿Cómo está tu energía hoy?',
    energy_high: 'Alta Energía (Todo)',
    energy_moderate: 'Paso Firme (≤15m)',
    energy_low: 'Modo Suave (1–5m)',
    energy_high_desc: 'Alta Energía: Muestra todas las tareas rutinarias (incluyendo enfoque profundo 20+ min).',
    energy_moderate_desc: 'Paso Firme: Tareas de hasta 15 min (oculta tareas pesadas de 20+ min).',
    energy_low_desc: 'Modo Suave: Solo micro-victorias de 1–5 min para evitar el agotamiento.',
    spoon_theory_explanation: 'En neurodiversidad (Teoría de las Cucharas), la energía mental diaria fluctúa. Seleccionar Baja Energía oculta automáticamente tareas pesadas para mantener tu impulso sin culpa.',

    ambient_title: 'Paisaje Sonoro de Enfoque',
    ambient_soundscapes_title: '🎧 PAISAJES SONOROS TDAH:',
    sound_brown: 'Ruido Marrón',
    sound_rain: 'Lluvia Suave',
    sound_ocean: 'Olas del Océano',
    sound_forest: 'Viento del Bosque',
    sound_stop: 'Detener Sonido',
    sound_volume: 'Volumen del Sonido',
    stop_soundscape: 'Detener Paisaje Sonoro',

    start_focus: 'Iniciar Enfoque',
    edit_task: 'Editar Tarea',
    delete_task: 'Eliminar Tarea',
    confirm_delete_task: '¿Estás seguro de que quieres eliminar esta tarea?',
    substeps_progress: 'pasos listos',
    add_first_step: '+ Agregar primer paso',
    break_down_step: 'Desglose Automático',
    steps_label: 'Pasos',

    focus_title: 'Foco de Concentración',
    focus_flowing: 'EN CURSO',
    focus_paused: 'PAUSADO',
    pause_focus: 'Pausar',
    reset_timer: 'Reiniciar',
    ready_to_focus: '¿Listo para Concentrarte?',
    no_active_tasks_focus: 'No tienes tareas activas ahora. ¡Crea tu primera rutina suave para comenzar!',
    create_task_action: 'Crear una Tarea',
    complete_claim_xp: 'Completar y Reclamar XP',
    back_to_checklist: 'Volver a la Lista',
    skip_next_task: 'Siguiente Tarea',
    micro_steps_title: 'Micro-Pasos',
    auto_break_down: 'Desglose Automático',
    type_micro_step: 'Escribe un micro-paso de 1 minuto...',
    add_step_btn: 'Agregar Paso',

    current_rank: 'RANGO ACTUAL',
    total_xp_earned: 'XP Total Ganada',
    xp_to_next_level: 'XP para el Nivel',
    current_streak_label: 'RACHA ACTUAL',
    best_streak_label: 'MEJOR RACHA',
    shields_label: 'ESCUDOS ACTIVOS',
    badges_label: 'MEDALLAS DESBLOQUEADAS',
    seven_day_history_title: 'Rutinas Completadas (7 Días)',
    routines_by_time_title: 'Rutinas por Momento del Día',
    consistency_grid_title: 'Cuadrícula de Consistencia (28 Días)',
    badges_gallery_title: 'Logros y Medallas',
    what_is_xp_btn: '¿Qué es XP y cómo funciona?',
    progress_to_next_rank: 'Progreso al Siguiente Rango',
    active_routines_label: 'Rutinas Activas',
    less_active: 'Menos activo',
    more_active: 'Más activo',
    days_count: 'Días',
    active_count: 'Activo',

    search_title: 'Buscar Tareas y Rutinas',
    search_subtitle: 'Encuentra cualquier tarea, filtra rutinas o entra en modo enfoque',
    search_placeholder: 'Buscar tareas por nombre, categoría o notas...',
    search_no_match: 'No se encontraron tareas',
    search_no_match_hint: 'Prueba ajustando tu búsqueda o cambiando de filtro',
    clear_search_btn: 'Limpiar Búsqueda',
    esc_to_close: 'ESC para cerrar',

    spinner_title: 'Superar la Parálisis de Tareas',
    spinner_subtitle: '¿Bloqueo ejecutivo? Deja que la ruleta elija una pequeña victoria suave. Sin presiones.',
    spinner_all_done: '¡Todas las rutinas de hoy están listas!',
    spinner_all_done_sub: 'Descansa, recárgate y celebra tu victoria.',
    spinner_cta: 'Haz clic en "Girar Ruleta" para elegir un micro-paso',
    spinner_spin_btn: 'Girar Ruleta 🎲',
    spinner_spinning: 'Seleccionando...',
    spinner_start_task: '¡Empezar esta Tarea Ahora!',

    create_task_title: 'Crear Tarea de Rutina',
    edit_task_title: 'Editar Tarea de Rutina',
    task_title_label: 'Título de la Tarea',
    routine_time_label: 'Momento del Día',
    priority_label: 'Nivel de Prioridad',
    reward_xp_label: 'Recompensa de XP',
    cancel_btn: 'Cancelar',
    save_changes_btn: 'Guardar Cambios',
    danger_zone_title: '⚠️ Zona de Peligro: Borrar Datos y Reiniciar',
    danger_zone_desc: 'Elimina permanentemente todas las tareas, XP, medallas y rachas para comenzar desde cero.',
    reset_account_btn: 'Borrar Todo y Reiniciar',
    confirm_reset_account: '¿Seguro que deseas borrar todos los datos y reiniciar la cuenta? Esta acción no se puede deshacer.',
    language_label: 'Idioma de la Interfaz',
    language_auto: '🌐 Automático (Predeterminado del Dispositivo)',
    theme_label: 'Tema de Color y Ambiente',
    dyslexic_font_label: 'Fuente OpenDyslexic',
    bionic_reading_label: 'Lectura Biónica',
    sound_effects_label: 'Efectos de Sonido y Sintetizador Lo-Fi',
  },

  fr: {
    tab_today: "Liste d'Aujourd'hui",
    tab_focus: 'Mode Focus',
    tab_dashboard: 'Progrès & Stats',
    tab_settings: 'Paramètres',

    brand_subtitle: 'Suivi Quotidien Doux',
    level_badge: 'NIV',
    streak_badge: 'Série',
    shields_badge: 'Boucliers',
    sync_cloud: 'Synchronisé au Cloud',
    sync_offline: 'Stockage Local',
    account: 'Compte',
    sign_in: 'Connexion / Sauvegarde',

    checklist_title: "Micro-Victoires d'Aujourd'hui",
    checklist_subtitle: 'Routines douces conçues pour l’élan neurodivergent',
    filter_today: "Focus d'Aujourd'hui",
    filter_oneoff: 'Tâches Uniques',
    filter_morning: 'Matin',
    filter_afternoon: 'Après-midi',
    filter_evening: 'Soir',
    filter_all: 'Toutes les Routines',
    priority_all: 'Toutes les Priorités',
    priority_high: 'Haute Priorité',
    priority_medium: 'Moyenne',
    priority_low: 'Doux / Faible Effort',
    add_task_btn: 'Nouvelle Tâche',
    focus_spotlight_btn: 'Projecteur Focus',
    task_roulette_btn: 'Roulette des Tâches',
    command_menu_btn: 'Rechercher des Tâches',
    completed_banner: 'Rythme Complété',
    all_done_title: '✨ Toutes les routines sont terminées ! Bravo pour aujourd’hui.',
    all_done_subtitle: 'Reposez-vous en toute sérénité ou tournez la roulette pour une tâche bonus.',
    empty_filtered: 'Aucune tâche ne correspond à ce filtre. Respirez doucement !',
    all_tasks_done_toast: "🌟 Toutes les tâches d'aujourd'hui sont terminées !",

    energy_question: 'Comment est votre énergie aujourd’hui ?',
    energy_high: 'Haute Énergie (Toutes les Tâches)',
    energy_moderate: 'Rythme Régulier (≤15m)',
    energy_low: 'Mode Doux (1–5m)',
    energy_high_desc: 'Haute Énergie : Affiche toutes les tâches (y compris focus profond 20+ min).',
    energy_moderate_desc: 'Rythme Régulier : Tâches jusqu’à 15 min (masque les tâches lourdes 20+ min).',
    energy_low_desc: 'Mode Doux : Uniquement micro-victoires 1–5 min pour éviter l’épuisement.',
    spoon_theory_explanation: 'En neurodiversité (Théorie des Cuillères), l’énergie mentale quotidienne varie. Choisir Faible Énergie masque automatiquement les tâches lourdes pour avancer sans culpabilité.',

    ambient_title: 'Ambiance Sonore Focus',
    ambient_soundscapes_title: '🎧 PAYSAGES SONORES TDAH :',
    sound_brown: 'Bruit Brun',
    sound_rain: 'Pluie Douce',
    sound_ocean: 'Vagues de l’Océan',
    sound_forest: 'Vent en Forêt',
    sound_stop: 'Arrêter l’Ambiance',
    sound_volume: 'Volume Sonore',
    stop_soundscape: 'Arrêter le Paysage Sonore',

    start_focus: 'Démarrer Focus',
    edit_task: 'Modifier la Tâche',
    delete_task: 'Supprimer la Tâche',
    confirm_delete_task: 'Êtes-vous sûr de vouloir supprimer cette tâche de routine ?',
    substeps_progress: 'étapes faites',
    add_first_step: '+ Ajouter première étape',
    break_down_step: 'Décomposition Auto',
    steps_label: 'Étapes',

    focus_title: 'Projecteur Focus',
    focus_flowing: 'EN COURS',
    focus_paused: 'EN PAUSE',
    pause_focus: 'Pause',
    reset_timer: 'Réinitialiser',
    ready_to_focus: 'Prêt à vous Concentrer ?',
    no_active_tasks_focus: 'Vous n’avez aucune tâche active pour l’instant. Créez votre première routine pour commencer !',
    create_task_action: 'Créer une Tâche',
    complete_claim_xp: 'Terminer & Réclamer XP',
    back_to_checklist: 'Retour à la Liste',
    skip_next_task: 'Tâche Suivante',
    micro_steps_title: 'Micro-Étapes',
    auto_break_down: 'Décomposition Auto',
    type_micro_step: 'Écrivez une micro-étape douce d’1 minute...',
    add_step_btn: 'Ajouter Étape',

    current_rank: 'RANG ACTUEL',
    total_xp_earned: 'XP Totale Gagnée',
    xp_to_next_level: 'XP pour Niveau',
    current_streak_label: 'SÉRIE ACTUELLE',
    best_streak_label: 'MEILLEURE SÉRIE',
    shields_label: 'BOUCLIERS ACTIFS',
    badges_label: 'BADGES DÉBLOQUÉS',
    seven_day_history_title: 'Routines Complétées (7 Jours)',
    routines_by_time_title: 'Routines par Moment de la Journée',
    consistency_grid_title: 'Grille de Régularité (28 Jours)',
    badges_gallery_title: 'Succès & Trophées',
    what_is_xp_btn: 'Qu’est-ce que l’XP et comment ça marche ?',
    progress_to_next_rank: 'Progression vers le Rang Suivant',
    active_routines_label: 'Routines Actives',
    less_active: 'Moins actif',
    more_active: 'Plus actif',
    days_count: 'Jours',
    active_count: 'Actif',

    search_title: 'Rechercher Tâches & Routines',
    search_subtitle: 'Trouvez rapidement une tâche, filtrez les routines ou lancez le mode focus',
    search_placeholder: 'Rechercher par nom, catégorie ou notes...',
    search_no_match: 'Aucune tâche trouvée',
    search_no_match_hint: 'Essayez d’ajuster votre recherche ou de changer de filtre',
    clear_search_btn: 'Effacer la Recherche',
    esc_to_close: 'ÉCHAP pour fermer',

    spinner_title: 'Surmonter la Paralysie des Tâches',
    spinner_subtitle: 'Bloqué par l’inertie ? Laissez la roulette choisir une petite victoire douce pour vous. Sans pression.',
    spinner_all_done: 'Toutes les routines du jour sont terminées !',
    spinner_all_done_sub: 'Reposez-vous, rechargez vos batteries et célébrez votre succès.',
    spinner_cta: 'Cliquez sur "Tourner la Roulette" pour choisir un micro-pas',
    spinner_spin_btn: 'Tourner la Roulette 🎲',
    spinner_spinning: 'Sélection...',
    spinner_start_task: 'Commencer Cette Tâche !',

    create_task_title: 'Créer une Tâche de Routine',
    edit_task_title: 'Modifier la Tâche de Routine',
    task_title_label: 'Titre de la Tâche',
    routine_time_label: 'Moment de la Journée',
    priority_label: 'Niveau de Priorité',
    reward_xp_label: 'Récompense XP',
    cancel_btn: 'Annuler',
    save_changes_btn: 'Enregistrer les Modifications',
    danger_zone_title: '⚠️ Zone Dangereuse : Effacer les Données & Réinitialiser',
    danger_zone_desc: 'Supprimer définitivement toutes les routines, l’XP, les badges et séries pour recommencer à zéro.',
    reset_account_btn: 'Tout Effacer et Réinitialiser',
    confirm_reset_account: 'Êtes-vous certain de vouloir réinitialiser entièrement vos données ? Cette action est irréversible.',
    language_label: 'Langue de l’Interface',
    language_auto: '🌐 Auto (Langue de l’Appareil)',
    theme_label: 'Thème de Couleur & Ambiance',
    dyslexic_font_label: 'Police OpenDyslexic',
    bionic_reading_label: 'Mode Lecture Bionique',
    sound_effects_label: 'Effets Sonores & Synthétiseur Lo-Fi',
  },

  de: {
    tab_today: 'Heute',
    tab_focus: 'Fokus-Modus',
    tab_dashboard: 'Fortschritt & Stats',
    tab_settings: 'Einstellungen',

    brand_subtitle: 'Sanfter Tagesplaner',
    level_badge: 'STUFE',
    streak_badge: 'Serie',
    shields_badge: 'Schilde',
    sync_cloud: 'Cloud Synchronisiert',
    sync_offline: 'Lokaler Speicher',
    account: 'Konto',
    sign_in: 'Anmelden / Backup',

    checklist_title: 'Heutige Micro-Wins',
    checklist_subtitle: 'Sanfte Routinen für neurodivergenten Schwung entwickelt',
    filter_today: 'Heutiger Fokus',
    filter_oneoff: 'Einmalige Aufgaben',
    filter_morning: 'Morgen',
    filter_afternoon: 'Nachmittag',
    filter_evening: 'Abend',
    filter_all: 'Alle Routinen',
    priority_all: 'Alle Prioritäten',
    priority_high: 'Hoher Fokus',
    priority_medium: 'Mittel',
    priority_low: 'Sanft / Geringer Aufwand',
    add_task_btn: 'Neue Aufgabe',
    focus_spotlight_btn: 'Fokus-Spotlight',
    task_roulette_btn: 'Aufgaben-Roulette',
    command_menu_btn: 'Aufgaben Suchen',
    completed_banner: 'Rhythmus Vollendet',
    all_done_title: '✨ Alle Routinen erledigt! Großartige Leistung heute.',
    all_done_subtitle: 'Ruhe dich aus oder drehe das Roulette-Rad für eine optionale Bonusaufgabe.',
    empty_filtered: 'Keine Aufgaben für diesen Filter. Atme tief durch!',
    all_tasks_done_toast: '🌟 Alle Aufgaben für heute sind abgeschlossen!',

    energy_question: 'Wie ist deine Energie heute?',
    energy_high: 'Hohe Energie (Alle Aufgaben)',
    energy_moderate: 'Stetiges Tempo (≤15m)',
    energy_low: 'Sanfter Modus (1–5m)',
    energy_high_desc: 'Hohe Energie: Zeigt alle Aufgaben (einschließlich 20+ Min Tiefenfokus).',
    energy_moderate_desc: 'Stetiges Tempo: Aufgaben bis 15 Min (versteckt schwere Aufgaben).',
    energy_low_desc: 'Sanfter Modus: Nur 1–5 Min Micro-Wins, um Erschöpfung zu vermeiden.',
    spoon_theory_explanation: 'In der Neurodiversität (Löffel-Theorie) schwankt die mentale Energie. Niedrige Energie blendet anstrengende Aufgaben aus, damit du ohne Schuldgefühle im Fluss bleibst.',

    ambient_title: 'Fokus-Klanglandschaft',
    ambient_soundscapes_title: '🎧 ADHS FOKUS-KLÄNGE:',
    sound_brown: 'Braunes Rauschen',
    sound_rain: 'Sanfter Regen',
    sound_ocean: 'Meereswellen',
    sound_forest: 'Waldwind',
    sound_stop: 'Audio Stoppen',
    sound_volume: 'Lautstärke',
    stop_soundscape: 'Klanglandschaft Stoppen',

    start_focus: 'Fokus Starten',
    edit_task: 'Aufgabe Bearbeiten',
    delete_task: 'Aufgabe Löschen',
    confirm_delete_task: 'Bist du sicher, dass du diese Routine-Aufgabe löschen möchtest?',
    substeps_progress: 'Schritte fertig',
    add_first_step: '+ Ersten Schritt hinzufügen',
    break_down_step: 'Auto-Aufteilung',
    steps_label: 'Schritte',

    focus_title: 'Fokus-Spotlight',
    focus_flowing: 'IM FLUSS',
    focus_paused: 'PAUSIERT',
    pause_focus: 'Pause',
    reset_timer: 'Zurücksetzen',
    ready_to_focus: 'Bereit zum Fokussieren?',
    no_active_tasks_focus: 'Du hast gerade keine aktiven Aufgaben. Erstelle deine erste Routine, um zu beginnen!',
    create_task_action: 'Aufgabe Erstellen',
    complete_claim_xp: 'Abschließen & XP Sichern',
    back_to_checklist: 'Zurück zur Liste',
    skip_next_task: 'Nächste Aufgabe',
    micro_steps_title: 'Micro-Schritte',
    auto_break_down: 'Auto-Aufteilung',
    type_micro_step: 'Schreibe einen sanften 1-Minuten-Schritt...',
    add_step_btn: 'Schritt Hinzufügen',

    current_rank: 'AKTUELLER RANG',
    total_xp_earned: 'Gesamte XP',
    xp_to_next_level: 'XP bis Stufe',
    current_streak_label: 'AKTUELLE SERIE',
    best_streak_label: 'BESTE SERIE',
    shields_label: 'AKTIVE SCHILDE',
    badges_label: 'FREIGESCHALTETE ABZEICHEN',
    seven_day_history_title: 'Routinen-Erfüllung (7 Tage)',
    routines_by_time_title: 'Routinen nach Tageszeit',
    consistency_grid_title: 'Konsistenz-Gitter (28 Tage)',
    badges_gallery_title: 'Erfolge & Meilensteine',
    what_is_xp_btn: 'Was sind XP und wie funktioniert es?',
    progress_to_next_rank: 'Fortschritt zum nächsten Rang',
    active_routines_label: 'Aktive Routinen',
    less_active: 'Weniger aktiv',
    more_active: 'Sehr aktiv',
    days_count: 'Tage',
    active_count: 'Aktiv',

    search_title: 'Aufgaben & Routinen Suchen',
    search_subtitle: 'Finde schnell jede Aufgabe, filtere Routinen oder starte den Fokus-Modus',
    search_placeholder: 'Aufgaben nach Titel, Kategorie oder Notizen suchen...',
    search_no_match: 'Keine passenden Aufgaben gefunden',
    search_no_match_hint: 'Passe deine Suchbegriffe an oder wechsle den Filter-Tab',
    clear_search_btn: 'Suche Löschen',
    esc_to_close: 'ESC zum Schließen',

    spinner_title: 'Aufgaben-Paralyse Überwinden',
    spinner_subtitle: 'Festgefahren im Blockade-Zustand? Lass das Rad einen kleinen sanften Erfolg wählen. Ganz ohne Druck.',
    spinner_all_done: 'Alle Routinen für heute sind erledigt!',
    spinner_all_done_sub: 'Erhole dich, tanke Energie und feiere deinen Erfolg.',
    spinner_cta: 'Klicke auf "Rad Drehen", um einen Micro-Win zu wählen',
    spinner_spin_btn: 'Rad Drehen 🎲',
    spinner_spinning: 'Wähle aus...',
    spinner_start_task: 'Diese Aufgabe Jetzt Starten!',

    create_task_title: 'Routine-Aufgabe Erstellen',
    edit_task_title: 'Routine-Aufgabe Bearbeiten',
    task_title_label: 'Aufgabentitel',
    routine_time_label: 'Tageszeit',
    priority_label: 'Prioritätsstufe',
    reward_xp_label: 'Belohnungs-XP',
    cancel_btn: 'Abbrechen',
    save_changes_btn: 'Änderungen Speichern',
    danger_zone_title: '⚠️ Gefahrenbereich: Daten Löschen & Zurücksetzen',
    danger_zone_desc: 'Löscht alle Routinen, XP, Abzeichen und Serien vollständig für einen Neuanfang.',
    reset_account_btn: 'Alle Daten Löschen & Zurücksetzen',
    confirm_reset_account: 'Möchtest du wirklich alle Daten löschen und das Konto zurücksetzen? Dies kann nicht rückgängig gemacht werden.',
    language_label: 'Oberflächensprache',
    language_auto: '🌐 Automatisch (Gerätestandard)',
    theme_label: 'Farbthema & Stimmung',
    dyslexic_font_label: 'OpenDyslexic Schriftart',
    bionic_reading_label: 'Bionisches Lesen',
    sound_effects_label: 'Audio-Feedback & Lo-Fi Synthesizer',
  },

  ja: {
    tab_today: '今日のリスト',
    tab_focus: '集中モード',
    tab_dashboard: '進捗と統計',
    tab_settings: '設定',

    brand_subtitle: '優しいデイリートラッカー',
    level_badge: 'LVL',
    streak_badge: '連続記録',
    shields_badge: 'シールド',
    sync_cloud: 'クラウド同期済み',
    sync_offline: 'ローカル保存',
    account: 'アカウント',
    sign_in: 'ログイン / バックアップ',

    checklist_title: '今日の小さな勝利',
    checklist_subtitle: 'ニューロダイバージェントの勢いを保つための優しいルーチン',
    filter_today: '今日のフォーカス',
    filter_oneoff: '単発タスク',
    filter_morning: '朝',
    filter_afternoon: '昼',
    filter_evening: '夜',
    filter_all: '全ルーチン',
    priority_all: 'すべての優先度',
    priority_high: '高集中',
    priority_medium: '中',
    priority_low: '優しめ / 低負荷',
    add_task_btn: '新規タスク',
    focus_spotlight_btn: 'フォーカス・スポットライト',
    task_roulette_btn: 'タスク・ルーレット',
    command_menu_btn: 'タスクを検索',
    completed_banner: 'リズム達成',
    all_done_title: '✨ すべてのルーチンが完了しました！素晴らしい一日でした。',
    all_done_subtitle: 'ゆっくり休むか、ルーレットを回して追加タスクに挑戦しましょう。',
    empty_filtered: 'この条件に一致するタスクはありません。深呼吸してリラックスしましょう！',
    all_tasks_done_toast: '🌟 今日のすべてのタスクが完了しました！',

    energy_question: '今日のエネルギー（元気度）はどうですか？',
    energy_high: '元気いっぱい (全タスク)',
    energy_moderate: 'マイペース (≤15分)',
    energy_low: 'ゆったりモード (1–5分)',
    energy_high_desc: '元気いっぱい: 20分以上のディープフォーカスを含むすべてのタスクを表示します。',
    energy_moderate_desc: 'マイペース: 15分以内のタスクを表示（負荷の高いタスクを非表示）。',
    energy_low_desc: 'ゆったりモード: バーンアウトを防ぐため、1〜5分の小さな勝利のみを表示します。',
    spoon_theory_explanation: 'ニューロダイバーシティ（スプーン理論）では、日々の精神的エネルギーは変動します。「低エネルギー」を選ぶと重いタスクが自動的に隠れ、罪悪感なく小さな前進を続けられます。',

    ambient_title: '集中環境音',
    ambient_soundscapes_title: '🎧 ADHD集中サウンドスケープ:',
    sound_brown: 'ブラウンノイズ',
    sound_rain: '優しい雨',
    sound_ocean: '波の音',
    sound_forest: '森の風',
    sound_stop: '音を止める',
    sound_volume: '音量調節',
    stop_soundscape: 'サウンドスケープ停止',

    start_focus: '集中を開始',
    edit_task: 'タスクを編集',
    delete_task: 'タスクを削除',
    confirm_delete_task: 'このルーティンタスクを削除してもよろしいですか？',
    substeps_progress: 'ステップ完了',
    add_first_step: '+ 最初のステップを追加',
    break_down_step: '自動ステップ分解',
    steps_label: 'ステップ',

    focus_title: '集中スポットライト',
    focus_flowing: '進行中',
    focus_paused: '一時停止',
    pause_focus: '一時停止',
    reset_timer: 'リセット',
    ready_to_focus: '集中する準備はできましたか？',
    no_active_tasks_focus: '現在アクティブなタスクはありません。最初のルーチンを作成して始めましょう！',
    create_task_action: 'タスクを作成',
    complete_claim_xp: '完了してXPを獲得',
    back_to_checklist: 'リストに戻る',
    skip_next_task: '次のタスクへ',
    micro_steps_title: '小さなステップ',
    auto_break_down: '自動ステップ分解',
    type_micro_step: '優しい1分ステップを入力...',
    add_step_btn: 'ステップ追加',

    current_rank: '現在のランク',
    total_xp_earned: '獲得総XP',
    xp_to_next_level: '次のレベルまで',
    current_streak_label: '現在の連続記録',
    best_streak_label: '自己ベスト連続記録',
    shields_label: '所持シールド',
    badges_label: '獲得バッジ数',
    seven_day_history_title: '過去7日間のルーチン達成状況',
    routines_by_time_title: '時間帯別ルーチン分布',
    consistency_grid_title: '28日間の継続ヒートマップ',
    badges_gallery_title: '獲得バッジとマイルストーン',
    what_is_xp_btn: 'XPとは？どのように機能しますか？',
    progress_to_next_rank: '次のランクへの進捗',
    active_routines_label: '有効なルーチン',
    less_active: '少なめ',
    more_active: '活発',
    days_count: '日',
    active_count: '有効',

    search_title: 'タスクとルーチンを検索',
    search_subtitle: 'タスクをすばやく見つけ、絞り込み、集中モードを開始',
    search_placeholder: 'タスク名、カテゴリー、メモで検索...',
    search_no_match: '一致するタスクが見つかりません',
    search_no_match_hint: '検索キーワードを変更するか、フィルターを切り替えてみてください',
    clear_search_btn: '検索をクリア',
    esc_to_close: 'ESCキーで閉じる',

    spinner_title: '着手困難・先延ばしを克服',
    spinner_subtitle: 'どこから手をつけるか迷っていますか？ ルーレットに小さな一歩を任せましょう。プレッシャーは不要です。',
    spinner_all_done: '今日のルーチンはすべて完了しました！',
    spinner_all_done_sub: 'ゆっくり休んで、今日の達成を喜びましょう。',
    spinner_cta: '「ルーレットを回す」を押して小さな勝利を選びます',
    spinner_spin_btn: 'ルーレットを回す 🎲',
    spinner_spinning: '選んでいます...',
    spinner_start_task: 'このタスクを今すぐ始める！',

    create_task_title: 'ルーティンタスクの作成',
    edit_task_title: 'ルーティンタスクの編集',
    task_title_label: 'タスク名',
    routine_time_label: '時間帯',
    priority_label: '優先度',
    reward_xp_label: '獲得XP',
    cancel_btn: 'キャンセル',
    save_changes_btn: '変更を保存',
    danger_zone_title: '⚠️ 危険ゾーン: 全データ削除とアカウント初期化',
    danger_zone_desc: 'すべてのルーチン、XP、バッジ、連続記録を完全に消去して最初からやり直します。',
    reset_account_btn: '全データを削除してリセット',
    confirm_reset_account: '本当にすべてのデータを削除して初期化しますか？ この操作は元に戻せません。',
    language_label: '表示言語',
    language_auto: '🌐 自動 (端末の設定言語)',
    theme_label: 'カラーテーマと雰囲気',
    dyslexic_font_label: 'OpenDyslexic フォント',
    bionic_reading_label: 'バイオニック・リーディング',
    sound_effects_label: '音声フィードバックとLo-Fiシンセ',
  },

  pt: {
    tab_today: 'Lista de Hoje',
    tab_focus: 'Modo Foco',
    tab_dashboard: 'Progresso e Estatísticas',
    tab_settings: 'Configurações',

    brand_subtitle: 'Rastreador Diário Suave',
    level_badge: 'NÍVEL',
    streak_badge: 'Sequência',
    shields_badge: 'Escudos',
    sync_cloud: 'Nuvem Sincronizada',
    sync_offline: 'Armazenamento Local',
    account: 'Conta',
    sign_in: 'Entrar / Backup',

    checklist_title: 'Micro-Vitórias de Hoje',
    checklist_subtitle: 'Rotinas suaves para impulsionar mentes neurodivergentes',
    filter_today: 'Foco de Hoje',
    filter_oneoff: 'Tarefas Únicas',
    filter_morning: 'Manhã',
    filter_afternoon: 'Tarde',
    filter_evening: 'Noite',
    filter_all: 'Todas as Rotinas',
    priority_all: 'Todas as Prioridades',
    priority_high: 'Foco Alto',
    priority_medium: 'Médio',
    priority_low: 'Suave / Pouco Esforço',
    add_task_btn: 'Nova Tarefa',
    focus_spotlight_btn: 'Destaque de Foco',
    task_roulette_btn: 'Roleta de Tarefas',
    command_menu_btn: 'Buscar Tarefas',
    completed_banner: 'Ritmo Concluído',
    all_done_title: '✨ Todas as rotinas concluídas! Você foi incrível hoje.',
    all_done_subtitle: 'Descanse em paz ou gire a roleta para uma tarefa bônus opcional.',
    empty_filtered: 'Nenhuma tarefa corresponde a este filtro. Respire com calma!',
    all_tasks_done_toast: '🌟 Todas as tarefas de hoje foram concluídas!',

    energy_question: 'Como está sua energia hoje?',
    energy_high: 'Alta Energia (Tudo)',
    energy_moderate: 'Ritmo Constante (≤15m)',
    energy_low: 'Modo Suave (1–5m)',
    energy_high_desc: 'Alta Energia: Mostra todas as tarefas da rotina (incluindo foco profundo 20+ min).',
    energy_moderate_desc: 'Ritmo Constante: Tarefas até 15 min (oculta tarefas pesadas).',
    energy_low_desc: 'Modo Suave: Apenas micro-vitórias de 1–5 min para evitar exaustão.',
    spoon_theory_explanation: 'Na neurodiversidade (Teoria das Colheres), a energia mental flutua diariamente. Escolher Baixa Energia esconde tarefas pesadas para você manter o ritmo sem culpa.',

    ambient_title: 'Sons de Foco',
    ambient_soundscapes_title: '🎧 PAISAGENS SONORAS TDAH:',
    sound_brown: 'Ruído Marrom',
    sound_rain: 'Chuva Suave',
    sound_ocean: 'Ondas do Mar',
    sound_forest: 'Vento na Floresta',
    sound_stop: 'Parar Som',
    sound_volume: 'Volume do Som',
    stop_soundscape: 'Parar Paisagem Sonora',

    start_focus: 'Iniciar Foco',
    edit_task: 'Editar Tarefa',
    delete_task: 'Excluir Tarefa',
    confirm_delete_task: 'Tem certeza de que deseja excluir esta tarefa de rotina?',
    substeps_progress: 'passos prontos',
    add_first_step: '+ Adicionar primeiro passo',
    break_down_step: 'Divisão Automática',
    steps_label: 'Passos',

    focus_title: 'Destaque de Foco',
    focus_flowing: 'EM FLUXO',
    focus_paused: 'PAUSADO',
    pause_focus: 'Pausar',
    reset_timer: 'Reiniciar',
    ready_to_focus: 'Pronto para Focar?',
    no_active_tasks_focus: 'Você não tem tarefas ativas no momento. Crie sua primeira rotina suave para começar!',
    create_task_action: 'Criar uma Tarefa',
    complete_claim_xp: 'Concluir & Resgatar XP',
    back_to_checklist: 'Voltar para a Lista',
    skip_next_task: 'Próxima Tarefa',
    micro_steps_title: 'Micro-Passos',
    auto_break_down: 'Divisão Automática',
    type_micro_step: 'Digite um micro-passo gentil de 1 minuto...',
    add_step_btn: 'Adicionar Passo',

    current_rank: 'CLASSIFICAÇÃO ATUAL',
    total_xp_earned: 'XP Total Ganho',
    xp_to_next_level: 'XP para o Nível',
    current_streak_label: 'SEQUÊNCIA ATUAL',
    best_streak_label: 'MELHOR SEQUÊNCIA',
    shields_label: 'ESCUDOS ATIVOS',
    badges_label: 'EMBLEMAS DESBLOQUEADOS',
    seven_day_history_title: 'Rotinas Concluídas (7 Dias)',
    routines_by_time_title: 'Rotinas por Período do Dia',
    consistency_grid_title: 'Grade de Consistência (28 Dias)',
    badges_gallery_title: 'Conquistas & Marcos',
    what_is_xp_btn: 'O que é XP e como funciona?',
    progress_to_next_rank: 'Progresso para o Próximo Nível',
    active_routines_label: 'Rotinas Ativas',
    less_active: 'Menos ativo',
    more_active: 'Mais ativo',
    days_count: 'Dias',
    active_count: 'Ativo',

    search_title: 'Buscar Tarefas e Rotinas',
    search_subtitle: 'Localize rapidamente qualquer tarefa, filtre rotinas ou inicie o modo foco',
    search_placeholder: 'Buscar tarefas por nome, categoria ou anotações...',
    search_no_match: 'Nenhuma tarefa encontrada',
    search_no_match_hint: 'Tente ajustar sua busca ou mudar os filtros',
    clear_search_btn: 'Limpar Busca',
    esc_to_close: 'ESC para fechar',

    spinner_title: 'Superar o Bloqueio de Tarefas',
    spinner_subtitle: 'Travado na inércia? Deixe a roleta escolher uma pequena vitória suave para você. Sem pressão.',
    spinner_all_done: 'Todas as rotinas de hoje foram concluídas!',
    spinner_all_done_sub: 'Descanse, recarregue as energias e comemore sua vitória.',
    spinner_cta: 'Clique em "Girar Roleta" para escolher um micro-passo',
    spinner_spin_btn: 'Girar Roleta 🎲',
    spinner_spinning: 'Selecionando...',
    spinner_start_task: 'Começar Esta Tarefa Agora!',

    create_task_title: 'Criar Tarefa de Rotina',
    edit_task_title: 'Editar Tarefa de Rotina',
    task_title_label: 'Título da Tarefa',
    routine_time_label: 'Período do Dia',
    priority_label: 'Nível de Prioridade',
    reward_xp_label: 'Recompensa de XP',
    cancel_btn: 'Cancelar',
    save_changes_btn: 'Salvar Alterações',
    danger_zone_title: '⚠️ Zona de Perigo: Limpar Dados & Reiniciar',
    danger_zone_desc: 'Excluir permanentemente todas as rotinas, XP, emblemas e sequências para recomeçar do zero.',
    reset_account_btn: 'Limpar Todos os Dados e Reiniciar',
    confirm_reset_account: 'Tem certeza de que deseja apagar todos os dados e reiniciar? Esta ação não pode ser desfeita.',
    language_label: 'Idioma da Interface',
    language_auto: '🌐 Automático (Padrão do Dispositivo)',
    theme_label: 'Tema de Cores & Ambiente',
    dyslexic_font_label: 'Fonte OpenDyslexic',
    bionic_reading_label: 'Modo Leitura Biônica',
    sound_effects_label: 'Efeitos Sonoros & Sintetizador Lo-Fi',
  },

  it: {
    tab_today: 'Oggi',
    tab_focus: 'Modalità Focus',
    tab_dashboard: 'Progressi e Statistiche',
    tab_settings: 'Impostazioni',

    brand_subtitle: 'Tracciatore Quotidiano Delicato',
    level_badge: 'LIV',
    streak_badge: 'Serie',
    shields_badge: 'Scudi',
    sync_cloud: 'Sincronizzato sul Cloud',
    sync_offline: 'Archivio Locale',
    account: 'Account',
    sign_in: 'Accedi / Backup',

    checklist_title: 'Micro-Vittorie di Oggi',
    checklist_subtitle: 'Routine delicate studiate per dare slancio alle menti neurodivergenti',
    filter_today: 'Focus di Oggi',
    filter_oneoff: 'Compiti Singoli',
    filter_morning: 'Mattina',
    filter_afternoon: 'Pomeriggio',
    filter_evening: 'Sera',
    filter_all: 'Tutte le Routine',
    priority_all: 'Tutte le Priorità',
    priority_high: 'Alto Focus',
    priority_medium: 'Medio',
    priority_low: 'Delicato / Basso Sforzo',
    add_task_btn: 'Nuovo Compito',
    focus_spotlight_btn: 'Riflettore Focus',
    task_roulette_btn: 'Roulette dei Compiti',
    command_menu_btn: 'Cerca Compiti',
    completed_banner: 'Ritmo Completato',
    all_done_title: '✨ Tutte le routine completate! Hai fatto un lavoro fantastico.',
    all_done_subtitle: 'Riposati serenamente o gira la roulette per un compito bonus opzionale.',
    empty_filtered: 'Nessun compito corrisponde a questo filtro. Fai un respiro profondo!',
    all_tasks_done_toast: '🌟 Tutti i compiti di oggi sono stati completati!',

    energy_question: 'Come ti senti a livello di energia oggi?',
    energy_high: 'Alta Energia (Tutti i Compiti)',
    energy_moderate: 'Passo Costante (≤15m)',
    energy_low: 'Modalità Dolce (1–5m)',
    energy_high_desc: 'Alta Energia: Mostra tutti i compiti (compreso focus profondo 20+ min).',
    energy_moderate_desc: 'Passo Costante: Compiti fino a 15 min (nasconde compiti pesanti).',
    energy_low_desc: 'Modalità Dolce: Solo micro-vittorie da 1–5 min per prevenire il burnout.',
    spoon_theory_explanation: 'Nella neurodiversità (Teoria dei Cucchiai), l’energia mentale oscilla ogni giorno. Selezionare Bassa Energia nasconde automaticamente compiti pesanti per farti andare avanti senza sensi di colpa.',

    ambient_title: 'Paesaggio Sonoro di Focus',
    ambient_soundscapes_title: '🎧 PAESAGGI SONORI ADHD:',
    sound_brown: 'Rumore Marrone',
    sound_rain: 'Pioggia Dolce',
    sound_ocean: 'Onde dell’Oceano',
    sound_forest: 'Vento nel Bosco',
    sound_stop: 'Ferma Audio',
    sound_volume: 'Regola Volume',
    stop_soundscape: 'Ferma Paesaggio Sonoro',

    start_focus: 'Inizia Focus',
    edit_task: 'Modifica Compito',
    delete_task: 'Elimina Compito',
    confirm_delete_task: 'Sei sicuro di voler eliminare questo compito di routine?',
    substeps_progress: 'passi completati',
    add_first_step: '+ Aggiungi primo passo',
    break_down_step: 'Suddivisione Automatica',
    steps_label: 'Passi',

    focus_title: 'Riflettore Focus',
    focus_flowing: 'IN CORSO',
    focus_paused: 'IN PAUSA',
    pause_focus: 'Pausa',
    reset_timer: 'Reimposta',
    ready_to_focus: 'Pronto a Concentrarti?',
    no_active_tasks_focus: 'Non hai compiti attivi al momento. Crea la tua prima routine per iniziare!',
    create_task_action: 'Crea un Compito',
    complete_claim_xp: 'Completa e Riscatta XP',
    back_to_checklist: 'Torna alla Lista',
    skip_next_task: 'Compito Successivo',
    micro_steps_title: 'Micro-Passi',
    auto_break_down: 'Suddivisione Automatica',
    type_micro_step: 'Scrivi un piccolo passo da 1 minuto...',
    add_step_btn: 'Aggiungi Passo',

    current_rank: 'RANGO ATTUALE',
    total_xp_earned: 'XP Totali Guadagnati',
    xp_to_next_level: 'XP al Livello',
    current_streak_label: 'SERIE ATTUALE',
    best_streak_label: 'MIGLIOR SERIE',
    shields_label: 'SCUDI ATTIVI',
    badges_label: 'DISTINTIVI SBLOCCATI',
    seven_day_history_title: 'Routine Completate (7 Giorni)',
    routines_by_time_title: 'Routine per Momento della Giornata',
    consistency_grid_title: 'Griglia di Costanza (28 Giorni)',
    badges_gallery_title: 'Traguardi & Distintivi',
    what_is_xp_btn: 'Cosa sono gli XP e come funzionano?',
    progress_to_next_rank: 'Progresso verso il prossimo livello',
    active_routines_label: 'Routine Attive',
    less_active: 'Meno attivo',
    more_active: 'Molto attivo',
    days_count: 'Giorni',
    active_count: 'Attivo',

    search_title: 'Cerca Compiti & Routine',
    search_subtitle: 'Trova rapidamente qualsiasi compito, filtra routine o avvia la modalità focus',
    search_placeholder: 'Cerca per nome, categoria o note...',
    search_no_match: 'Nessun compito trovato',
    search_no_match_hint: 'Prova ad aggiustare la ricerca o a cambiare scheda di filtro',
    clear_search_btn: 'Cancella Ricerca',
    esc_to_close: 'ESC per chiudere',

    spinner_title: 'Supera il Blocco dei Compiti',
    spinner_subtitle: 'Bloccato dall’inerzia? Lascia che la ruota scelga una piccola vittoria dolce per te. Senza alcuna pressione.',
    spinner_all_done: 'Tutte le routine di oggi sono state completate!',
    spinner_all_done_sub: 'Riposati, ricarica le energie e festeggia la tua vittoria.',
    spinner_cta: 'Clicca su "Gira Ruota" per scegliere un piccolo passo',
    spinner_spin_btn: 'Gira Ruota 🎲',
    spinner_spinning: 'Selezione...',
    spinner_start_task: 'Inizia Questo Compito Ora!',

    create_task_title: 'Crea Compito di Routine',
    edit_task_title: 'Modifica Compito di Routine',
    task_title_label: 'Titolo del Compito',
    routine_time_label: 'Momento della Giornata',
    priority_label: 'Livello di Priorità',
    reward_xp_label: 'Ricompensa in XP',
    cancel_btn: 'Annulla',
    save_changes_btn: 'Salva Modifiche',
    danger_zone_title: '⚠️ Zona di Pericolo: Cancella Dati & Reimposta',
    danger_zone_desc: 'Elimina definitivamente tutti i compiti, XP, distintivi e serie per ricominciare da zero.',
    reset_account_btn: 'Cancella Tutto e Reimposta',
    confirm_reset_account: 'Sei sicuro di voler cancellare tutti i dati e ricominciare? Questa azione è irreversibile.',
    language_label: 'Lingua dell’Interfaccia',
    language_auto: '🌐 Automatico (Predefinita del Dispositivo)',
    theme_label: 'Tema Colori e Atmosfera',
    dyslexic_font_label: 'Carattere OpenDyslexic',
    bionic_reading_label: 'Modalità Lettura Bionica',
    sound_effects_label: 'Feedback Audio e Sintetizzatore Lo-Fi',
  },

  zh: {
    tab_today: '今日清单',
    tab_focus: '专注模式',
    tab_dashboard: '进度与统计',
    tab_settings: '设置',

    brand_subtitle: '温和日常追踪器',
    level_badge: '等级',
    streak_badge: '连续',
    shields_badge: '护盾',
    sync_cloud: '云端已同步',
    sync_offline: '本地存储',
    account: '账户',
    sign_in: '登录 / 备份',

    checklist_title: '今日微小成就',
    checklist_subtitle: '专为神经多样性设计的温和日常节奏',
    filter_today: '今日专注',
    filter_oneoff: '单次任务',
    filter_morning: '早晨',
    filter_afternoon: '下午',
    filter_evening: '晚上',
    filter_all: '全部日常',
    priority_all: '全部优先级',
    priority_high: '高专注',
    priority_medium: '中等',
    priority_low: '温和 / 低消耗',
    add_task_btn: '新建任务',
    focus_spotlight_btn: '单任务聚焦',
    task_roulette_btn: '任务轮盘',
    command_menu_btn: '搜索任务',
    completed_banner: '节奏已达成',
    all_done_title: '✨ 今天的日常全部搞定！你做得棒极了。',
    all_done_subtitle: '安心休息，或转动轮盘选择一个可选的加分任务。',
    empty_filtered: '没有符合该筛选条件的任务。深呼吸，放松一下！',
    all_tasks_done_toast: '🌟 今天的所有任务均已完成！',

    energy_question: '你今天的精力状态如何？',
    energy_high: '精力充沛 (全部任务)',
    energy_moderate: '平稳节奏 (≤15分钟)',
    energy_low: '温和模式 (1–5分钟)',
    energy_high_desc: '精力充沛：显示所有日常任务（包含20分钟以上的深度专注）。',
    energy_moderate_desc: '平稳节奏：显示15分钟以内的任务（隐藏高负担任务）。',
    energy_low_desc: '温和模式：仅显示1–5分钟的微小任务，防止过度疲惫。',
    spoon_theory_explanation: '在神经多样性理论（勺子理论）中，人的精神精力每天都会波动。选择“低精力”会自动隐藏繁重任务，让你轻松保持前进势头而无内疚感。',

    ambient_title: '专注白噪音',
    ambient_soundscapes_title: '🎧 ADHD专注氛围音:',
    sound_brown: '棕色噪音',
    sound_rain: '温和雨声',
    sound_ocean: '海浪拍岸',
    sound_forest: '森林微风',
    sound_stop: '停止声音',
    sound_volume: '调节音量',
    stop_soundscape: '停止氛围音',

    start_focus: '开始专注',
    edit_task: '编辑任务',
    delete_task: '删除任务',
    confirm_delete_task: '确定要删除这个日常任务吗？',
    substeps_progress: '步骤完成',
    add_first_step: '+ 添加第一步',
    break_down_step: '智能拆解',
    steps_label: '步骤',

    focus_title: '单任务聚焦',
    focus_flowing: '进行中',
    focus_paused: '已暂停',
    pause_focus: '暂停',
    reset_timer: '重置',
    ready_to_focus: '准备好专注了吗？',
    no_active_tasks_focus: '你现在没有活动任务。创建你的第一个日常开始吧！',
    create_task_action: '创建任务',
    complete_claim_xp: '完成并领取 XP',
    back_to_checklist: '返回清单',
    skip_next_task: '下一个任务',
    micro_steps_title: '微步骤',
    auto_break_down: '智能拆解',
    type_micro_step: '输入一个1分钟温和步骤...',
    add_step_btn: '添加步骤',

    current_rank: '当前段位',
    total_xp_earned: '累计获得 XP',
    xp_to_next_level: '升级所需 XP',
    current_streak_label: '当前连续天数',
    best_streak_label: '历史最佳连续',
    shields_label: '连胜护盾',
    badges_label: '已解锁徽章',
    seven_day_history_title: '近7天日常完成情况',
    routines_by_time_title: '时间段日常分布',
    consistency_grid_title: '28天坚持热力图',
    badges_gallery_title: '成就与里程碑',
    what_is_xp_btn: '什么是XP？它是如何运作的？',
    progress_to_next_rank: '升至下一段位进度',
    active_routines_label: '活跃日常',
    less_active: '较少',
    more_active: '活跃',
    days_count: '天',
    active_count: '生效中',

    search_title: '搜索任务与日常',
    search_subtitle: '快速定位任务、筛选日常或进入专注模式',
    search_placeholder: '按任务名、分类或备注搜索...',
    search_no_match: '未找到匹配的任务',
    search_no_match_hint: '尝试调整搜索关键词或切换筛选标签',
    clear_search_btn: '清空搜索',
    esc_to_close: '按 ESC 关闭',

    spinner_title: '克服任务启动困难',
    spinner_subtitle: '陷入执行瘫痪？让轮盘为你挑选一个微小的小胜利。毫无压力。',
    spinner_all_done: '今天的日常任务已全部搞定！',
    spinner_all_done_sub: '好好休息，恢复精力，庆祝你的胜利。',
    spinner_cta: '点击“转动轮盘”挑选微小胜利',
    spinner_spin_btn: '转动轮盘 🎲',
    spinner_spinning: '挑选任务中...',
    spinner_start_task: '立即开始此任务！',

    create_task_title: '创建日常任务',
    edit_task_title: '编辑日常任务',
    task_title_label: '任务标题',
    routine_time_label: '适宜时间段',
    priority_label: '优先级',
    reward_xp_label: '奖励经验值 (XP)',
    cancel_btn: '取消',
    save_changes_btn: '保存更改',
    danger_zone_title: '⚠️ 危险区域：清除数据与重置账户',
    danger_zone_desc: '彻底清除所有日常任务、XP、徽章与连续记录，重新开始。',
    reset_account_btn: '清除所有数据并重置',
    confirm_reset_account: '确定要彻底清除所有数据并重置账户吗？此操作不可逆。',
    language_label: '界面语言',
    language_auto: '🌐 自动 (设备默认语言)',
    theme_label: '颜色主题与氛围',
    dyslexic_font_label: 'OpenDyslexic 易读字体',
    bionic_reading_label: '仿生阅读模式',
    sound_effects_label: '音频反馈与Lo-Fi合成器',
  },

  ko: {
    tab_today: '오늘의 할 일',
    tab_focus: '집중 모드',
    tab_dashboard: '진행도 및 통계',
    tab_settings: '설정',

    brand_subtitle: '부드러운 일일 트래커',
    level_badge: '레벨',
    streak_badge: '연속',
    shields_badge: '보호막',
    sync_cloud: '클라우드 동기화됨',
    sync_offline: '로컬 저장소',
    account: '계정',
    sign_in: '로그인 / 백업',

    checklist_title: '오늘의 작은 승리',
    checklist_subtitle: '신경다양인을 위해 설계된 부담 없는 일상 루틴',
    filter_today: '오늘의 집중',
    filter_oneoff: '단발성 작업',
    filter_morning: '아침',
    filter_afternoon: '오후',
    filter_evening: '저녁',
    filter_all: '모든 루틴',
    priority_all: '모든 우선순위',
    priority_high: '높은 집중',
    priority_medium: '보통',
    priority_low: '가벼움 / 부담 없음',
    add_task_btn: '새 작업',
    focus_spotlight_btn: '단일 집중 스포트라이트',
    task_roulette_btn: '작업 룰렛',
    command_menu_btn: '작업 검색',
    completed_banner: '리듬 달성',
    all_done_title: '✨ 오늘의 모든 루틴 완료! 대단해요.',
    all_done_subtitle: '편안하게 쉬거나, 룰렛을 돌려 보너스 작업을 확인하세요.',
    empty_filtered: '해당 조건의 작업이 없습니다. 편안하게 숨을 고르세요!',
    all_tasks_done_toast: '🌟 오늘의 모든 작업이 완료되었습니다!',

    energy_question: '오늘의 에너지 수준은 어떤가요?',
    energy_high: '활기참 (모든 작업)',
    energy_moderate: '안정적인 페이스 (≤15분)',
    energy_low: '가벼운 모드 (1–5분)',
    energy_high_desc: '활기참: 20분 이상의 깊은 집중 작업을 포함한 모든 작업을 표시합니다.',
    energy_moderate_desc: '안정적인 페이스: 15분 이내의 작업을 표시합니다.',
    energy_low_desc: '가벼운 모드: 번아웃 방지를 위해 1~5분의 가벼운 작업만 표시합니다.',
    spoon_theory_explanation: '신경다양성(스푼 이론)에서는 일일 정신적 에너지가 매일 달라집니다. "낮은 에너지"를 선택하면 부담스러운 작업이 숨겨져 죄책감 없이 전진할 수 있습니다.',

    ambient_title: '집중 앰비언트 사운드',
    ambient_soundscapes_title: '🎧 ADHD 집중 사운드스케이프:',
    sound_brown: '브라운 노이즈',
    sound_rain: '부드러운 빗소리',
    sound_ocean: '바다 파도',
    sound_forest: '숲속 바람',
    sound_stop: '소리 중지',
    sound_volume: '음량 조절',
    stop_soundscape: '사운드스케이프 중지',

    start_focus: '집중 시작',
    edit_task: '작업 수정',
    delete_task: '작업 삭제',
    confirm_delete_task: '이 루틴 작업을 삭제하시겠습니까?',
    substeps_progress: '단계 완료',
    add_first_step: '+ 첫 단계 추가',
    break_down_step: '자동 세부 분해',
    steps_label: '단계',

    focus_title: '단일 집중 스포트라이트',
    focus_flowing: '진행 중',
    focus_paused: '일시정지됨',
    pause_focus: '일시정지',
    reset_timer: '초기화',
    ready_to_focus: '집중할 준비가 되셨나요?',
    no_active_tasks_focus: '현재 활성 작업이 없습니다. 첫 번째 루틴을 만들어 시작하세요!',
    create_task_action: '작업 만들기',
    complete_claim_xp: '완료하고 XP 획득',
    back_to_checklist: '목록으로 돌아가기',
    skip_next_task: '다음 작업',
    micro_steps_title: '작은 단계들',
    auto_break_down: '자동 세부 분해',
    type_micro_step: '1분짜리 작은 단계를 입력하세요...',
    add_step_btn: '단계 추가',

    current_rank: '현재 등급',
    total_xp_earned: '총 획득 XP',
    xp_to_next_level: '다음 레벨까지',
    current_streak_label: '현재 연속 일수',
    best_streak_label: '최고 연속 일수',
    shields_label: '연속 보호막',
    badges_label: '잠금 해제된 배지',
    seven_day_history_title: '최근 7일간 루틴 달성 현황',
    routines_by_time_title: '시간대별 루틴 분포',
    consistency_grid_title: '28일간의 일관성 히트맵',
    badges_gallery_title: '업적 및 마일스톤',
    what_is_xp_btn: 'XP란 무엇이며 어떻게 작동하나요?',
    progress_to_next_rank: '다음 등급 달성률',
    active_routines_label: '활성 루틴',
    less_active: '적음',
    more_active: '활발함',
    days_count: '일',
    active_count: '개 활성',

    search_title: '작업 및 루틴 검색',
    search_subtitle: '작업을 빠르게 찾고, 필터링하며, 집중 모드를 시작하세요',
    search_placeholder: '작업 이름, 카테고리, 메모로 검색...',
    search_no_match: '일치하는 작업이 없습니다',
    search_no_match_hint: '검색어를 바꾸거나 필터 탭을 변경해 보세요',
    clear_search_btn: '검색 지우기',
    esc_to_close: 'ESC를 눌러 닫기',

    spinner_title: '작업 시작 지연 극복',
    spinner_subtitle: '실행 마비에 빠지셨나요? 룰렛이 당신을 위해 부담 없는 작은 승리를 하나 골라드립니다. 부담 갖지 마세요.',
    spinner_all_done: '오늘의 모든 루틴이 완료되었습니다!',
    spinner_all_done_sub: '편안히 쉬며 오늘 이룬 성취를 축하하세요.',
    spinner_cta: '"룰렛 돌리기"를 눌러 작은 승리를 선택하세요',
    spinner_spin_btn: '룰렛 돌리기 🎲',
    spinner_spinning: '선택하는 중...',
    spinner_start_task: '이 작업 지금 시작하기!',

    create_task_title: '루틴 작업 생성',
    edit_task_title: '루틴 작업 수정',
    task_title_label: '작업 제목',
    routine_time_label: '시간대',
    priority_label: '우선순위',
    reward_xp_label: '보상 경험치 (XP)',
    cancel_btn: '취소',
    save_changes_btn: '변경사항 저장',
    danger_zone_title: '⚠️ 위험 구역: 전체 데이터 삭제 및 계정 초기화',
    danger_zone_desc: '모든 루틴, 경험치, 배지, 연속 기록을 완전히 삭제하고 처음부터 다시 시작합니다.',
    reset_account_btn: '모든 데이터 삭제 및 초기화',
    confirm_reset_account: '정말로 모든 데이터를 삭제하고 계정을 초기화하시겠습니까? 이 작업은 취소할 수 없습니다.',
    language_label: '인터페이스 언어',
    language_auto: '🌐 자동 (기기 기본 언어)',
    theme_label: '컬러 테마 및 분위기',
    dyslexic_font_label: 'OpenDyslexic 폰트',
    bionic_reading_label: '바이오닉 리딩 모드',
    sound_effects_label: '오디오 피드백 및 로파이 신디사이저',
  },
};

/**
 * Detects the device / browser language automatically
 */
export function getDeviceLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'en';

  const userLangs = (navigator.languages && navigator.languages.length > 0)
    ? navigator.languages
    : [navigator.language || 'en'];

  for (const lang of userLangs) {
    const code = lang.toLowerCase().split('-')[0];
    if (code === 'es') return 'es';
    if (code === 'fr') return 'fr';
    if (code === 'de') return 'de';
    if (code === 'ja') return 'ja';
    if (code === 'pt') return 'pt';
    if (code === 'it') return 'it';
    if (code === 'zh') return 'zh';
    if (code === 'ko') return 'ko';
    if (code === 'en') return 'en';
  }

  return 'en';
}

/**
 * Resolves active language code based on user settings
 */
export function resolveActiveLanguage(settingLang?: SupportedLanguage): SupportedLanguage {
  if (!settingLang || settingLang === 'auto') {
    return getDeviceLanguage();
  }
  return settingLang;
}

/**
 * Returns translated string for key, falling back to English if missing
 */
export function getTranslation(key: keyof TranslationSchema, lang: SupportedLanguage): string {
  const activeLang = resolveActiveLanguage(lang);
  const dict = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || String(key);
}
