# Implementation Plan: MyCliniQ - රෝහල් තොරතුරු කළමනාකරණ පද්ධතිය

මෙම සැලැස්ම (Implementation Plan) මගින් **MyCliniQ** පුද්ගලික වෛද්‍ය මධ්‍යස්ථානයේ තොරතුරු කළමනාකරණය සඳහා Next.js, Supabase සහ Vercel භාවිතයෙන් නිපදවන පද්ධතියේ ව්‍යුහය, දත්ත සමුදාය (Database Schema), සහ පියවරෙන් පියවර සංවර්ධන ක්‍රියාවලිය සිංහලෙන් පැහැදිලි කරයි. 

---

## 🌟 ප්‍රධාන අරමුණු සහ සැලසුම් මූලධර්ම (Core Goals)

1. **නොමිලේ පවත්වාගෙන යාම (Free Tier Compatibility)**: Supabase හි සහ Vercel හි ඇති නොමිලේ ලබාදෙන සේවාවන් (Free Tier) උපරිමයෙන් ප්‍රයෝජනයට ගනිමින් මාසික පිරිවැය ශුන්‍ය මට්ටමක තබා ගැනීම.
2. **අනාගත ජංගම දුරකථන යෙදවුම් සහය (Mobile-Ready Backend)**: පසුව නිර්මාණය කරන ඇන්ඩ්‍රොයිඩ් ඇප් එක (Android App) සඳහා ද මෙම දත්ත සමුදායම (Supabase API) කිසිදු වෙනසකින් තොරව ඍජුව සම්බන්ධ කළ හැකි වන සේ සකස් කිරීම.
3. **පරිශීලක හිතකාමී සැලසුම (User-Friendly UI)**: වේගවත්, පිරිසිදු සහ ජංගම දුරකථන/ටැබ්ලට් වලට පහසුවෙන් ගැළපෙන (Responsive Modern Design) එකක් සැකසීම.
4. **Thermal Printer සහය**: ඖෂධ වට්ටෝරු, ලැබ් රිසිට්පත් සහ බිල්පත් 58mm හෝ 80mm තාප මුද්‍රණ යන්ත්‍ර (Thermal Printers) මගින් මුද්‍රණය කිරීමට හැකි විශේෂ Print CSS Styles ඇතුළත් කිරීම.

---

## 👥 පරිශීලක භූමිකාවන් (User Roles & Access Control)

පද්ධතිය තුළ පහත සඳහන් පරිශීලක මට්ටම් (User Roles) ක්‍රියාත්මක වේ:

| Role (භූමිකාව) | අවසරයන් සහ ප්‍රවේශයන් (Permissions & Workflows) |
| :--- | :--- |
| **Assistant (සහායක)** | රෝගීන් ලියාපදිංචි කිරීම, චැනලින් (Appointments) ඇතුළත් කිරීම (දුරකථන මාර්ගයෙන් හෝ වෙනත් දින සඳහා), දෛනික පෝලිම කළමනාකරණය සහ මූලික ශරීර දත්ත (BP, Temperature, Weight) ඇතුළත් කිරීම. |
| **Doctor (වෛද්‍යවරයා)** | දෛනික රෝගී පෝලිම බැලීම, රෝග විනිශ්චය (Diagnosis), ඖෂධ නියම කිරීම (E-Prescriptions - Generic සහ Brand දෙකම ඇතුළත්ව), ලැබ් පරීක්ෂණ නියම කිරීම (Lab requests) සහ රෝගී ඉතිහාසය පරීක්ෂා කිරීම. |
| **Pharmacist (ඖෂධවේදියා)** | වෛද්‍යවරයා එවූ බෙහෙත් වට්ටෝරු බැලීම, බෙහෙත් නිකුත් කිරීම, ඖෂධ තොග කළමනාකරණය (Drug Inventory) සහ කල් ඉකුත් වීමේ අනතුරු ඇඟවීම් බැලීම. |
| **MLT (ලැබ් ශිල්පියා)** | නියම කරන ලද ලැබ් පරීක්ෂණ සඳහා රෝගීන්ගේ සාම්පල ලබා ගැනීම සටහන් කිරීම, පරීක්ෂණ වාර්තා (Results) ඇතුළත් කිරීම සහ රිපෝට් PDF ආකාරයෙන් අප්ලෝඩ් කිරීම. |
| **Manager / Super Admin** | සමස්ත පද්ධතියේ වාර්තා (Analytics), සේවක ගිණුම් නිර්මාණය/කළමනාකරණය, ඖෂධ තොග මිලදී ගැනීම් සහ ලැබ් පරීක්ෂණ ගාස්තු සැකසීම. |
| **Patient (රෝගියා - Future)** | රෝගීන්ට වෙබ්/ඇප් හරහා ලොග් වී තමන්ගේ වෛද්‍ය වාර්තා බැලීම, නියමිත බෙහෙත් වට්ටෝරු බැලීම සහ අනාගත දින සඳහා චැනලින් (Bookings) සිදු කර ගැනීම. |

---

## 🗄️ Supabase Database Schema (දත්ත සමුදාය සැකැස්ම)

අනාගතයේදී රෝගීන්ට ද ලොග් විය හැකි පරිදි සහ ලැබ්/චැනලින් විස්තර ඇතුළත් වන පරිදි දත්ත සමුදාය පහත පරිදි සැලසුම් කර ඇත:

### 1. `profiles` (කාර්ය මණ්ඩල තොරතුරු)
Supabase Auth එකට සම්බන්ධ කාර්ය මණ්ඩල සාමාජිකයින්ගේ විස්තර.
- `id` (UUID, Primary Key -> references auth.users)
- `full_name` (Text)
- `role` (Text - 'assistant', 'doctor', 'pharmacist', 'mlt', 'manager')
- `phone` (Text)
- `is_active` (Boolean)
- `created_at` (Timestamp)

### 2. `patients` (රෝගීන්ගේ නාමාවලිය)
- `id` (UUID, Primary Key)
- `nic` (Text, Unique, Optional)
- `full_name` (Text)
- `date_of_birth` (Date)
- `gender` (Text)
- `phone` (Text)
- `address` (Text)
- `allergies` (Text[]) -- අසාත්මිකතා ඇති ඖෂධ ලැයිස්තුව
- `chronic_illnesses` (Text[]) -- දීර්ඝකාලීන රෝග (දියවැඩියාව, අධික රුධිර පීඩනය ආදී)
- `user_id` (UUID, references auth.users, Optional) -- අනාගතයේදී රෝගියාට තනිව ලොග් වීමට.

### 3. `appointments` (චැනලින් / කලින් වෙන් කරවා ගැනීම්)
දුරකථන මාර්ගයෙන් හෝ ඇප් එකෙන් වෙනත් දින සඳහා වෙන්කරවා ගන්නා අවස්ථා.
- `id` (UUID, Primary Key)
- `patient_id` (UUID, references patients.id)
- `doctor_id` (UUID, references profiles.id)
- `appointment_date` (Date)
- `queue_number` (Integer)
- `status` (Text - 'scheduled', 'attended', 'cancelled')
- `booked_by` (Text - 'phone', 'online', 'walk_in')
- `created_at` (Timestamp)

### 4. `visits` (දෛනික පැමිණීම් සහ Queue)
දිනපතා සායනයට පැමිණෙන විට සාදන පෝලිම් වාර්තා.
- `id` (UUID, Primary Key)
- `patient_id` (UUID, references patients.id)
- `appointment_id` (UUID, references appointments.id, Optional)
- `visit_date` (Date, default: today)
- `queue_number` (Integer)
- `doctor_id` (UUID, references profiles.id)
- `status` (Text - 'waiting', 'in_consultation', 'completed', 'cancelled')
- `systolic_bp` (Integer) -- රුධිර පීඩනය
- `diastolic_bp` (Integer)
- `temperature` (Numeric) -- උණ
- `weight_kg` (Numeric) -- බර
- `chief_complaint` (Text) -- රෝග ලක්ෂණ/පැමිණිල්ල
- `created_at` (Timestamp)

### 5. `consultations` (වෛද්‍ය පරීක්ෂණ විස්තර)
- `id` (UUID, Primary Key)
- `visit_id` (UUID, references visits.id, Unique)
- `doctor_id` (UUID, references profiles.id)
- `symptoms` (Text)
- `diagnosis` (Text)
- `clinical_notes` (Text)
- `created_at` (Timestamp)

### 6. `drugs` (ඖෂධ තොග නාමාවලිය)
Generic සහ Brand නාමයන් දෙකම ඇතුළත් වේ.
- `id` (UUID, Primary Key)
- `brand_name` (Text) -- උදා: Panadol
- `generic_name` (Text) -- උදා: Paracetamol
- `form` (Text - 'tablet', 'syrup', 'capsule', etc.)
- `strength` (Text - උදා: '500mg', '120mg/5ml')
- `total_stock` (Integer, default: 0)
- `reorder_level` (Integer, default: 50)
- `unit_price` (Decimal)
- `selling_price` (Decimal)

### 7. `stock_batches` (ඖෂධ කාණ්ඩ සහ කල් ඉකුත්වීම්)
- `id` (UUID, Primary Key)
- `drug_id` (UUID, references drugs.id)
- `batch_number` (Text)
- `expiry_date` (Date)
- `quantity_received` (Integer)
- `quantity_remaining` (Integer)
- `purchase_price` (Decimal)
- `created_at` (Timestamp)

### 8. `prescriptions` (බෙහෙත් වට්ටෝරු)
- `id` (UUID, Primary Key)
- `consultation_id` (UUID, references consultations.id)
- `patient_id` (UUID, references patients.id)
- `status` (Text - 'pending', 'dispensed', 'partially_dispensed')
- `created_at` (Timestamp)

### 9. `prescription_items` (වට්ටෝරුවේ ඇති ඖෂධ ලැයිස්තුව)
- `id` (UUID, Primary Key)
- `prescription_id` (UUID, references prescriptions.id)
- `drug_id` (UUID, references drugs.id)
- `dosage` (Text) -- උදා: '1 tab'
- `frequency` (Text) -- උදා: 'TID' (දිනකට 3 වරක්)
- `duration` (Integer) -- දින ගණන
- `total_quantity` (Integer) -- මුළු පෙති/ඖෂධ ප්‍රමාණය
- `instructions` (Text) -- උදා: "කෑමට පසු"
- `dispensed_quantity` (Integer)

### 10. `lab_tests` (ලැබ් පරීක්ෂණ නාමාවලිය)
- `id` (UUID, Primary Key)
- `test_name` (Text) -- උදා: FBS, Lipid Profile, Full Blood Count
- `reference_range` (Text) -- සාමාන්‍ය සීමාවන්
- `unit` (Text) -- මිනුම් ඒකකය (උදා: mg/dL)
- `cost` (Decimal) -- ගාස්තුව

### 11. `lab_requests` (ලැබ් වාර්තා ඉල්ලීම් සහ ප්‍රතිඵල)
- `id` (UUID, Primary Key)
- `visit_id` (UUID, references visits.id)
- `patient_id` (UUID, references patients.id)
- `test_id` (UUID, references lab_tests.id)
- `doctor_id` (UUID, references profiles.id)
- `mlt_id` (UUID, references profiles.id, Optional)
- `status` (Text - 'requested', 'collected', 'completed')
- `result_value` (Text) -- ලැබුණු අගය
- `remarks` (Text) -- සටහන්
- `attachment_url` (Text) -- PDF හෝ පින්තූර අප්ලෝඩ් කිරීම සඳහා Supabase Storage URL
- `created_at` (Timestamp)

### 12. `inventory_transactions` (තොග වෙනස්වීම් සටහන්)
- `id` (UUID, Primary Key)
- `drug_id` (UUID, references drugs.id)
- `batch_id` (UUID, references stock_batches.id)
- `transaction_type` (Text - 'stock_in', 'dispense', 'adjustment')
- `quantity` (Integer)
- `performed_by` (UUID, references profiles.id)
- `created_at` (Timestamp)

---

## 🛠️ Step-by-Step Supabase Setup Guide (පළමු පියවර)

Supabase හි ඔබගේ නොමිලේ දත්ත සමුදාය සැකසීමට පහත පියවර අනුගමනය කරන්න:

1. **Supabase ගිණුමක් සාදා ගැනීම**:
   - [supabase.com](https://supabase.com) වෙත ගොස් ඔබගේ GitHub ගිණුම භාවිතයෙන් හෝ Email මගින් නොමිලේ ලියාපදිංචි වන්න.
2. **නව ව්‍යාපෘතියක් (New Project) ඇරඹීම**:
   - "New Project" ක්ලික් කර, ව්‍යාපෘතියට නමක් (`MyCliniQ`) සහ ශක්තිමත් Database Password එකක් ලබා දෙන්න. Region එක ලෙස ආසන්නතම කලාපයක් (උදා: Singapore) තෝරන්න. Free Tier එක තෝරා Project එක සාදන්න.
3. **SQL Editor එක භාවිතයෙන් Tables සෑදීම**:
   - Supabase Dashboard එකේ වම්පස ඇති **SQL Editor** වෙත යන්න.
   - අප ලබාදෙන SQL setup script එක එතැනට Copy-Paste කර **Run** ක්ලික් කරන්න. එවිට ඉහත දැක්වූ සියලුම Tables, Primary Keys, Foreign Keys, සහ Roles ස්වයංක්‍රීයව සැකසේ.
4. **API Keys ලබා ගැනීම**:
   - **Project Settings -> API** වෙත ගොස් `SUPABASE_URL` සහ `SUPABASE_ANON_KEY` ලබාගෙන අපගේ Next.js ව්‍යාපෘතියේ `.env.local` ගොනුවේ සුරකින්න.

---

## 🚀 පියවරෙන් පියවර සංවර්ධන සැලැස්ම (Development Roadmap)

### Phase 1: ව්‍යාපෘති ඇරඹුම සහ ලොගින් පද්ධතිය
1. Next.js ව්‍යාපෘතිය `MyCliniQ` ෆෝල්ඩරය තුළ ආරම්භ කිරීම.
2. Supabase Client එක ව්‍යාපෘතියට සම්බන්ධ කිරීම.
3. Assistant, Doctor, Pharmacist, MLT, සහ Manager සඳහා සුදුසු පරිශීලක ලොගින් පිටුව (Role-based Login) සැකසීම.

### Phase 2: සහායක (Assistant) සහ චැනලින් මොඩියුලය
1. රෝගීන් ලියාපදිංචි කිරීමේ ෆෝම් එක සෑදීම.
2. දුරකථන මාර්ගයෙන් ඉදිරි දින සඳහා Appointments (චැනලින්) ඇතුළත් කිරීමේ පහසුකම.
3. දෛනික පැමිණීම් ලියාපදිංචි කිරීම සහ රෝගියාගේ බර, උණ, රුධිර පීඩනය (BP) වැනි මූලික ශරීර දත්ත ඇතුළත් කර වෛද්‍යවරයාගේ පෝලිමට යොමු කිරීම.

### Phase 3: වෛද්‍ය මොඩියුලය (Doctor's EHR & E-Prescription)
1. වෛද්‍යවරයාට එදින පැමිණි රෝගීන්ගේ පෝලිම පෙන්වන Dashboard එක.
2. රෝග විනිශ්චය, රෝග ලක්ෂණ සහ සටහන් ඇතුළත් කිරීමේ පහසුකම.
3. **E-Prescription Builder**: Generic සහ Brand නාමයන් දෙකෙන්ම ඖෂධ සෙවීමේ සහ තේරීමේ හැකියාව. මාත්‍රාව (Dosage) සහ දින ගණන ඇතුළත් කර ඍජුවම ෆාමසිය වෙත යැවීම.
4. ලැබ් පරීක්ෂණ (Lab Tests) නිර්දේශ කිරීම.

### Phase 4: ෆාමසි සහ තොග පාලන මොඩියුලය (Pharmacy & Inventory)
1. වෛද්‍යවරයා නිර්දේශ කළ ඖෂධ වට්ටෝරු ෆාමසි Dashboard එකේ දිස්වීම.
2. ඖෂධ ලබා දීම (Dispensing) සටහන් කිරීම, එවිට ස්වයංක්‍රීයවම අදාළ Batch එකෙන් ඖෂධ ප්‍රමාණය අඩු වීම.
3. Thermal printer එකකින් ඖෂධ වට්ටෝරු සහ රිසිට්පත් මුද්‍රණය කිරීමට හැකිවීම.
4. ඖෂධ තොග කළමනාකරණය: අලුත් Batch ඇතුළත් කිරීම, කල් ඉකුත්වන දින පාලනය, Reorder level ළඟාවූ විට අනතුරු ඇඟවීම් පෙන්වීම.

### Phase 5: ලැබ් මොඩියුලය (MLT Lab Portal)
1. MLT පරිශීලකයාට වෛද්‍යවරුන් නිර්දේශ කළ ලැබ් පරීක්ෂණ ලැයිස්තුව දැකගත හැකිවීම.
2. සාම්පල ලබාගත් වේලාවන් සටහන් කිරීම.
3. ලැබ් රිපෝට් එකේ අගයන් (Result Values) ඇතුළත් කර, නිල රිපෝට් එක PDF එකක් ලෙස අප්ලෝඩ් කිරීම.
4. රෝගීන්ට තමන්ගේ ලැබ් රිපෝට් පද්ධතිය හරහා බාගත කිරීමට (Download) හැකිවීම.

### Phase 6: මැනේජර් සහ පද්ධති පාලනය (Manager & Optimization)
1. දෛනික ආදායම් වාර්තා, රෝගීන් සංඛ්‍යාව සහ වැඩියෙන්ම අලෙවි වූ ඖෂධ පිළිබඳ සවිස්තරාත්මක ප්‍රස්ථාර (Charts).
2. කාර්ය මණ්ඩල ගිණුම් කළමනාකරණය.
3. සමස්ත පද්ධතියේ වේගය සහ UI එක තවදුරටත් ඔප්නැංවීම (Micro-animations සහ Responsive layout optimization).

---

## 🧪 පරීක්ෂණ සැලැස්ම (Verification Plan)

1. **භූමිකාවන් අනුව අවසර පරීක්ෂාව (Role Permission Verification)**:
   - MLT කෙනෙකුට ඖෂධ තොග වෙනස් කිරීමට හෝ වෛද්‍යවරයෙකුගේ රෝග විනිශ්චය සටහන් සංස්කරණය කිරීමට නොහැකි බව තහවුරු කිරීම.
2. **සම්පූර්ණ පද්ධති පරීක්ෂාව (End-to-End Walkthrough)**:
   - සහායකයා විසින් රෝගියෙකු ලියාපදිංචි කර, පෝලිමට දමා, වෛද්‍යවරයා විසින් පරීක්ෂා කර බෙහෙත් සහ ලැබ් ලියා, ලැබ් එකෙන් MLT විසින් රිපෝට් එක සකසා, ෆාමසියෙන් බෙහෙත් ලබාදී, අවසානයේ තොග අඩු වී ඇති ආකාරය පරීක්ෂා කිරීම.
3. **ප්‍රින්ටර් පරීක්ෂාව (Thermal Printer Layout Test)**:
   - විවිධ බ්‍රවුසර් හරහා 58mm සහ 80mm layouts නිවැරදිව පේළි නොකැඩී ප්‍රින්ට් වෙනවාදැයි පරීක්ෂා කිරීම.
