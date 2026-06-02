# Supabase setup කිරීමේ උපදෙස් මාලාව (Step-by-Step Setup Guide)

ඔබගේ MyCliniQ පද්ධතිය සඳහා නොමිලේ දත්ත සමුදාය (Free Database) සහ පරිශීලක කළමනාකරණය (User Authentication) සකසා ගැනීමට පහත පියවර අනුගමනය කරන්න.

---

### පියවර 1: Supabase ගිණුමක් සෑදීම (Sign Up)
1. [supabase.com](https://supabase.com) වෙබ් අඩවියට පිවිසෙන්න.
2. දකුණු පස ඉහළ කෙළවරේ ඇති **Start your project** හෝ **Sign Up** බොත්තම ක්ලික් කරන්න.
3. ඔබට GitHub ගිණුමක් ඇත්නම් එයින් (Continue with GitHub) හෝ ඔබගේ Email ලිපිනයක් භාවිතයෙන් ගිණුමක් සාදාගන්න.

---

### පියවර 2: නව Project එකක් නිර්මාණය කිරීම (Create Project)
1. ඔබගේ Supabase Dashboard එකට ඇතුළු වූ පසු, **New Project** බොත්තම ක්ලික් කරන්න.
2. මතු වන ෆෝම් එකේ පහත විස්තර ඇතුළත් කරන්න:
   - **Organization**: Default එක තෝරන්න.
   - **Name**: `MyCliniQ` ලෙස ඇතුළත් කරන්න.
   - **Database Password**: ශක්තිමත් මුරපදයක් (Password) ලබා දෙන්න. *(මෙය කොහේ හෝ සටහන් කර තබා ගන්න, පසුව අවශ්‍ය විය හැක)*
   - **Region**: ශ්‍රී ලංකාවට ආසන්නතම කලාපය වන **Singapore (ap-southeast-1)** තෝරන්න.
   - **Pricing Plan**: **Free** (නොමිලේ) යන්න තෝරන්න.
3. **Create New Project** බොත්තම ක්ලික් කරන්න. දත්ත සමුදාය සකස් වීමට විනාඩි 2-3ක් පමණ ගතවනු ඇත.

---

### පියවර 3: Database Tables සහ Triggers සකස් කිරීම
1. ඔබගේ Project එක සූදානම් වූ පසු, වම්පස ඇති මෙනුවේ (Sidebar) ඇති **SQL Editor** අයිකනය (කොළ පැහැති `>_` සලකුණ) ක්ලික් කරන්න.
2. **New Query** බොත්තම ක්ලික් කරන්න.
3. මෙම ෆෝල්ඩරයේම ඇති [setup.sql (file:///c:/Users/A.P.K%20Sanjeeva/Desktop/MyCliniQ/supabase/setup.sql)] ගොනුවේ අඩංගු සම්පූර්ණ SQL කේතය (Code) Copy කරගෙන, Supabase හි SQL Editor එකට Paste කරන්න.
4. දකුණු පස පහළ ඇති **Run** බොත්තම ක්ලික් කරන්න.
5. "Success. No rows returned." යනුවෙන් පණිවිඩයක් ලැබුණහොත්, සියලුම Tables, Triggers සහ RLS Policies සාර්ථකව නිර්මාණය වී ඇත.

---

### පියවර 4: Next.js සඳහා API Keys ලබා ගැනීම
1. වම්පස මෙනුවේ පහළම ඇති **Project Settings** (රෝද සලකුණ/Gear Icon) ක්ලික් කරන්න.
2. එහි ඇති **API** ටැබ් එක තෝරන්න.
3. එහි දක්වා ඇති:
   - **Project URL** එක Copy කරගෙන Next.js ව්‍යාපෘතියේ `NEXT_PUBLIC_SUPABASE_URL` අගය ලෙස යොදන්න.
   - **API Keys** යටතේ ඇති **anon / public** key එක Copy කරගෙන `NEXT_PUBLIC_SUPABASE_ANON_KEY` අගය ලෙස යොදන්න.

---

### පියවර 5: කාර්ය මණ්ඩල සාමාජිකයින් එකතු කිරීම (Staff Registration)
මෙම පද්ධතියේ ආරක්ෂාව සඳහා කාර්ය මණ්ඩලයට තනිව ලියාපදිංචි විය නොහැක (Public registration bypass කර ඇත). ඔවුන්ව එකතු කළ යුත්තේ:
1. Supabase Dashboard එකේ වම්පස ඇති **Authentication** (පුද්ගල සලකුණ) පිටුවට යන්න.
2. **Add User -> Invite User** ක්ලික් කර අදාළ සේවකයාගේ Email ලිපිනය ඇතුළත් කරන්න.
3. එම Email ලිපිනයට ලැබෙන සබැඳිය (Link) මගින් ඔවුන්ට Password එකක් සකසා ලොග් විය හැක.
4. ඔවුන් පළමු වරට ලොග් වූ පසු, **Profiles** Table එකේ ඔවුන්ගේ ගිණුම සෑදේ. ඉන්පසු Manager විසින් **Profiles** Table එකට ගොස් ඔවුන්ගේ Role එක (`doctor`, `pharmacist` හෝ `mlt` ලෙස) යාවත්කාලීන කළ යුතුය.

*(සටහන: පළමු වරට පද්ධතියට ලොග් වීමට පෙර, පළමු ගිණුම (Manager ගිණුම) සාදාගන්නා ආකාරය පද්ධතිය සාදා අවසන් වූ පසු අපි පියවරෙන් පියවර සිදුකරමු).*
