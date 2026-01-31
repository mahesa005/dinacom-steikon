import 'dotenv/config';
import { chatbotQueryDatabase } from './lib/gemini';
import * as readline from 'readline';

async function interactiveChatbot() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const conversationHistory: Array<{
    role: 'user' | 'assistant';
    message: string;
  }> = [];

  console.log('='.repeat(80));
  console.log('🤖 Chatbot Dr. Gizi - Sentinel EWS');
  console.log('='.repeat(80));
  console.log('💡 Chatbot akan otomatis mengambil data dari database');
  console.log('💡 Ketik pertanyaan Anda (atau "exit" untuk keluar)\n');

  const askQuestion = () => {
    rl.question('❓ Anda: ', async (userInput) => {
      const question = userInput.trim();

      if (question.toLowerCase() === 'exit' || question.toLowerCase() === 'quit') {
        console.log('\n👋 Terima kasih! Semoga informasinya bermanfaat.\n');
        rl.close();
        process.exit(0);
        return;
      }

      if (!question) {
        askQuestion();
        return;
      }

      try {
        console.log('\n⏳ Dr. Gizi sedang menganalisis data dari database...\n');

        const response = await chatbotQueryDatabase(
          question,
          conversationHistory
        );

        // Save to history
        conversationHistory.push({
          role: 'user',
          message: question,
        });
        conversationHistory.push({
          role: 'assistant',
          message: response.answer,
        });

        console.log('🩺 Dr. Gizi:');
        console.log(response.answer);
        console.log('\n' + '─'.repeat(60) + '\n');
      } catch (error) {
        console.error('\n❌ Error:', (error as Error).message);
        console.log('');
      }

      askQuestion();
    });
  };

  askQuestion();
}

interactiveChatbot();
