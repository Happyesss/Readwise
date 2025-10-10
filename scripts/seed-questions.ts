/**
 * Seed script to add comprehensive assessment questions
 * Run with: npm run seed-questions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Sight Word Recognition Questions
const sightWordQuestions = [
  {
    assessment_id: 2,
    question_type: 'sight_word',
    content: {
      instruction: "Which word says 'the'?",
      target_word: "the",
      choices: ["the", "a", "an", "is"]
    },
    correct_answer: "the",
    difficulty_score: 1
  },
  {
    assessment_id: 2,
    question_type: 'sight_word',
    content: {
      instruction: "Find the word 'and'",
      target_word: "and",
      choices: ["and", "ant", "add", "ask"]
    },
    correct_answer: "and",
    difficulty_score: 1
  },
  {
    assessment_id: 2,
    question_type: 'sight_word',
    content: {
      instruction: "Which word is 'can'?",
      target_word: "can",
      choices: ["cat", "can", "car", "cap"]
    },
    correct_answer: "can",
    difficulty_score: 1
  },
  // Add more sight words...
];

// Letter-Sound Correspondence Questions
const letterSoundQuestions = [
  {
    assessment_id: 1,
    question_type: 'letter_sound',
    content: {
      instruction: "What sound does the letter M make?",
      letter: "M",
      choices: ["m", "n", "b", "w"]
    },
    correct_answer: "m",
    difficulty_score: 1
  },
  {
    assessment_id: 1,
    question_type: 'letter_sound',
    content: {
      instruction: "What sound does the letter N make?",
      letter: "N",
      choices: ["n", "m", "h", "r"]
    },
    correct_answer: "n",
    difficulty_score: 1
  },
  // Add all 26 letters...
];

// Reading Fluency Questions
const readingFluencyQuestions = [
  {
    assessment_id: 3,
    question_type: 'reading_fluency',
    content: {
      instruction: "Read this sentence: 'The cat sat on the mat.'",
      sentence: "The cat sat on the mat.",
      word_count: 6,
      expected_time_seconds: 5
    },
    correct_answer: "completed",
    difficulty_score: 1
  },
  // Add more sentences...
];

// Comprehension Questions
const comprehensionQuestions = [
  {
    assessment_id: 4,
    question_type: 'comprehension',
    content: {
      instruction: "Read the story and answer: What color was the dog?",
      passage: "Tom has a brown dog. The dog likes to play ball. Tom throws the ball and the dog runs fast.",
      question: "What color was the dog?",
      choices: ["brown", "black", "white", "yellow"]
    },
    correct_answer: "brown",
    difficulty_score: 2
  },
  // Add more passages...
];

async function seedQuestions() {
  console.log('🌱 Starting question seeding...');

  try {
    // Insert sight word questions
    console.log('📝 Adding sight word questions...');
    const { data: sightWords, error: swError } = await supabase
      .from('assessment_questions')
      .insert(sightWordQuestions);
    
    if (swError) throw swError;
    console.log(`✅ Added ${sightWordQuestions.length} sight word questions`);

    // Insert letter-sound questions
    console.log('🔤 Adding letter-sound questions...');
    const { data: letterSounds, error: lsError } = await supabase
      .from('assessment_questions')
      .insert(letterSoundQuestions);
    
    if (lsError) throw lsError;
    console.log(`✅ Added ${letterSoundQuestions.length} letter-sound questions`);

    // Insert reading fluency questions
    console.log('📖 Adding reading fluency questions...');
    const { data: fluency, error: flError } = await supabase
      .from('assessment_questions')
      .insert(readingFluencyQuestions);
    
    if (flError) throw flError;
    console.log(`✅ Added ${readingFluencyQuestions.length} fluency questions`);

    // Insert comprehension questions
    console.log('🧠 Adding comprehension questions...');
    const { data: comprehension, error: compError } = await supabase
      .from('assessment_questions')
      .insert(comprehensionQuestions);
    
    if (compError) throw compError;
    console.log(`✅ Added ${comprehensionQuestions.length} comprehension questions`);

    // Get total count
    const { count } = await supabase
      .from('assessment_questions')
      .select('*', { count: 'exact', head: true });

    console.log(`\n🎉 Seeding complete! Total questions: ${count}`);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
}

seedQuestions();
