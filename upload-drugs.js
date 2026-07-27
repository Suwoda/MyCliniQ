const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local file not found! Please create it and add your Supabase credentials first.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[key] = value.trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing in .env.local!');
  process.exit(1);
}

// 2. Read drugs_backup.json
const backupPath = path.join(__dirname, 'drugs_backup.json');
if (!fs.existsSync(backupPath)) {
  console.error('Error: drugs_backup.json not found! Please export the drugs from your browser and save the file in the project folder.');
  process.exit(1);
}

let drugs = [];
try {
  drugs = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
} catch (e) {
  console.error('Error parsing drugs_backup.json:', e.message);
  process.exit(1);
}

console.log(`Loaded ${drugs.length} drugs from drugs_backup.json.`);

// 3. Connect to Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadDrugs() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < drugs.length; i++) {
    const drug = drugs[i];
    const brandName = drug.brand_name;
    const genericName = drug.generic_name;
    const form = drug.form;
    const strength = drug.strength;

    try {
      // Check if drug already exists in database
      const { data: existing, error: checkError } = await supabase
        .from('drugs')
        .select('id')
        .eq('brand_name', brandName)
        .eq('generic_name', genericName)
        .eq('form', form)
        .eq('strength', strength)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking drug ${brandName}:`, checkError.message);
        errorCount++;
        continue;
      }

      if (existing) {
        console.log(`[${i + 1}/${drugs.length}] Skipping existing drug: ${brandName} (${strength})`);
        skipCount++;
        continue;
      }

      // Insert new drug
      const { error: insertError } = await supabase
        .from('drugs')
        .insert({
          brand_name: brandName,
          generic_name: genericName,
          form: form,
          route: drug.route || 'oral',
          manufacturer: drug.manufacturer || '',
          strength: strength,
          total_stock: 0, // Reset stock or use drug.total_stock if wanted
          reorder_level: drug.reorder_level || 50,
          unit_price: parseFloat(drug.unit_price) || 0,
          selling_price: parseFloat(drug.selling_price) || 0
        });

      if (insertError) {
        console.error(`[${i + 1}/${drugs.length}] Error inserting drug ${brandName}:`, insertError.message);
        errorCount++;
      } else {
        console.log(`[${i + 1}/${drugs.length}] Successfully added drug: ${brandName} (${strength})`);
        successCount++;
      }

    } catch (e) {
      console.error(`[${i + 1}/${drugs.length}] Unexpected error for drug ${brandName}:`, e.message);
      errorCount++;
    }
  }

  console.log('\n======================================');
  console.log('Upload Summary:');
  console.log(`- Successfully added: ${successCount}`);
  console.log(`- Already existed (skipped): ${skipCount}`);
  console.log(`- Errors encountered: ${errorCount}`);
  console.log('======================================');
}

uploadDrugs();
