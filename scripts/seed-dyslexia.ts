import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

const main = async () => {
  try {
    console.log("🌱 Seeding dyslexia learning content...");

    // Delete all existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      db.delete(schema.challengeProgress),
      db.delete(schema.challengeOptions),
      db.delete(schema.challenges),
      db.delete(schema.lessons),
      db.delete(schema.units),
      db.delete(schema.userProgress),
      db.delete(schema.courses),
    ]);

    // Insert Reading Skills course
    console.log("📚 Creating Reading Skills course...");
    const courses = await db
      .insert(schema.courses)
      .values([{ title: "Reading Skills", imageSrc: "/learn.svg" }])
      .returning();

    const course = courses[0];

    // Insert Units
    console.log("📖 Creating units...");
    const units = await db
      .insert(schema.units)
      .values([
        {
          courseId: course.id,
          title: "Phonics Fundamentals",
          description: "Learn letter sounds and phonemic awareness",
          order: 1,
        },
        {
          courseId: course.id,
          title: "Sight Words Mastery",
          description: "Master essential high-frequency words",
          order: 2,
        },
      ])
      .returning();

    // Unit 1: Phonics Fundamentals
    const phonicsUnit = units[0];
    console.log("🔤 Creating phonics lessons...");
    
    const phonicsLessons = await db
      .insert(schema.lessons)
      .values([
        { unitId: phonicsUnit.id, title: "Letter Sounds A-E", order: 1 },
        { unitId: phonicsUnit.id, title: "Letter Sounds F-J", order: 2 },
        { unitId: phonicsUnit.id, title: "Letter Sounds K-O", order: 3 },
        { unitId: phonicsUnit.id, title: "Letter Sounds P-T", order: 4 },
        { unitId: phonicsUnit.id, title: "Letter Sounds U-Z", order: 5 },
      ])
      .returning();

    // Unit 2: Sight Words
    const sightWordsUnit = units[1];
    console.log("⭐ Creating sight word lessons...");
    
    const sightWordLessons = await db
      .insert(schema.lessons)
      .values([
        { unitId: sightWordsUnit.id, title: "Pre-Primer Words", order: 1 },
        { unitId: sightWordsUnit.id, title: "Primer Words", order: 2 },
        { unitId: sightWordsUnit.id, title: "First Grade Words", order: 3 },
        { unitId: sightWordsUnit.id, title: "Common Words", order: 4 },
        { unitId: sightWordsUnit.id, title: "Tricky Words", order: 5 },
      ])
      .returning();

    // Create challenges for Lesson 1 (Letter Sounds A-E)
    console.log("🎯 Creating phonics challenges...");
    const lesson1 = phonicsLessons[0];
    
    const lesson1Challenges = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lesson1.id,
          type: "SELECT",
          question: "What sound does the letter A make?",
          order: 1,
        },
        {
          lessonId: lesson1.id,
          type: "SELECT",
          question: "What sound does the letter B make?",
          order: 2,
        },
        {
          lessonId: lesson1.id,
          type: "SELECT",
          question: "What sound does the letter C make?",
          order: 3,
        },
        {
          lessonId: lesson1.id,
          type: "ASSIST",
          question: "Match the letter to its sound: D",
          order: 4,
        },
        {
          lessonId: lesson1.id,
          type: "SELECT",
          question: "What sound does the letter E make?",
          order: 5,
        },
      ])
      .returning();

    // Add challenge options for Letter A
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: lesson1Challenges[0].id,
        correct: true,
        text: "/a/ as in apple",
        imageSrc: "/mascot.svg",
        audioSrc: "/correct.wav",
      },
      {
        challengeId: lesson1Challenges[0].id,
        correct: false,
        text: "/e/ as in egg",
        imageSrc: "/mascot.svg",
        audioSrc: "/incorrect.wav",
      },
      {
        challengeId: lesson1Challenges[0].id,
        correct: false,
        text: "/i/ as in igloo",
        imageSrc: "/mascot.svg",
        audioSrc: "/incorrect.wav",
      },
    ]);

    // Add challenge options for Letter B
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: lesson1Challenges[1].id,
        correct: true,
        text: "/b/ as in ball",
        imageSrc: "/mascot.svg",
        audioSrc: "/correct.wav",
      },
      {
        challengeId: lesson1Challenges[1].id,
        correct: false,
        text: "/d/ as in dog",
        imageSrc: "/mascot.svg",
        audioSrc: "/incorrect.wav",
      },
      {
        challengeId: lesson1Challenges[1].id,
        correct: false,
        text: "/p/ as in pig",
        imageSrc: "/mascot.svg",
        audioSrc: "/incorrect.wav",
      },
    ]);

    // Create challenges for Sight Words Lesson 1
    console.log("📝 Creating sight word challenges...");
    const sightLesson1 = sightWordLessons[0];
    
    const sightChallenges = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: sightLesson1.id,
          type: "SELECT",
          question: 'Which word says "the"?',
          order: 1,
        },
        {
          lessonId: sightLesson1.id,
          type: "SELECT",
          question: 'Which word says "and"?',
          order: 2,
        },
        {
          lessonId: sightLesson1.id,
          type: "SELECT",
          question: 'Which word says "can"?',
          order: 3,
        },
        {
          lessonId: sightLesson1.id,
          type: "ASSIST",
          question: 'Find the word "see"',
          order: 4,
        },
        {
          lessonId: sightLesson1.id,
          type: "SELECT",
          question: 'Which word says "you"?',
          order: 5,
        },
      ])
      .returning();

    // Add options for "the"
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: sightChallenges[0].id,
        correct: true,
        text: "the",
        audioSrc: "/correct.wav",
      },
      {
        challengeId: sightChallenges[0].id,
        correct: false,
        text: "a",
        audioSrc: "/incorrect.wav",
      },
      {
        challengeId: sightChallenges[0].id,
        correct: false,
        text: "an",
        audioSrc: "/incorrect.wav",
      },
    ]);

    // Add options for "and"
    await db.insert(schema.challengeOptions).values([
      {
        challengeId: sightChallenges[1].id,
        correct: true,
        text: "and",
        audioSrc: "/correct.wav",
      },
      {
        challengeId: sightChallenges[1].id,
        correct: false,
        text: "ant",
        audioSrc: "/incorrect.wav",
      },
      {
        challengeId: sightChallenges[1].id,
        correct: false,
        text: "add",
        audioSrc: "/incorrect.wav",
      },
    ]);

    console.log("✅ Database seeded successfully!");
    console.log(`📚 Course: ${course.title}`);
    console.log(`📖 Units: ${units.length}`);
    console.log(`📝 Lessons: ${phonicsLessons.length + sightWordLessons.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw new Error("Failed to seed the database");
  } finally {
    await client.end();
  }
};

main();
