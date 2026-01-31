import 'dotenv/config';
import { generateDailyInsight } from './lib/gemini';

async function testDailyInsight() {
  console.log('🧪 Testing Daily Insight Generation...\n');

  try {
    // Test dengan tanggal hari ini
    const insight = await generateDailyInsight();
    
    console.log('✅ Daily Insight Generated!\n');
    console.log('Title:', insight.title);
    console.log('\nInsight:');
    console.log(insight.insight);
    console.log('\nAction Buttons:');
    insight.actionButtons.forEach(btn => {
      console.log(`  - ${btn.label} (${btn.action})`);
    });
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDailyInsight();
