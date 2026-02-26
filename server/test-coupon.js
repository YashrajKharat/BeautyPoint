import { couponDB, supabase } from './utils/supabaseDB.js';

async function testCoupon() {
  // Step 1: Check what columns the table has by querying it
  console.log('=== Step 1: Checking coupons table structure ===');
  const { data: existingData, error: selectError } = await supabase
    .from('coupons')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('SELECT ERROR:', selectError);
  } else {
    console.log('Existing data sample:', existingData);
    if (existingData && existingData.length > 0) {
      console.log('Column names:', Object.keys(existingData[0]));
    } else {
      console.log('Table is empty, no columns to inspect from data');
    }
  }

  // Step 2: Try inserting a coupon the same way the controller does
  console.log('\n=== Step 2: Testing insert ===');
  try {
    const result = await couponDB.create({
      code: 'DEBUGTEST',
      discount_percent: 10,
      max_uses: null,
      expiry_date: '2030-01-01',
      current_uses: 0
    });
    console.log('INSERT SUCCESS:', result);
  } catch (insertError) {
    console.error('INSERT ERROR:', insertError.message);
    console.error('ERROR CODE:', insertError.code);
    console.error('ERROR DETAILS:', insertError.details);
    console.error('ERROR HINT:', insertError.hint);
  }

  // Step 3: Try inserting with minimal columns
  console.log('\n=== Step 3: Testing minimal insert ===');
  const { data: minData, error: minError } = await supabase
    .from('coupons')
    .insert([{ code: 'MINTEST' }])
    .select();

  if (minError) {
    console.error('MINIMAL INSERT ERROR:', minError);
  } else {
    console.log('MINIMAL INSERT SUCCESS:', minData);
  }
}

testCoupon();
