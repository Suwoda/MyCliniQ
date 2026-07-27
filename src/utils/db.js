// Database abstraction layer supporting both production Supabase and interactive Offline Demo mode.
import { supabase } from './supabase';

const INITIAL_SPECIALISTS = [
  { id: 'spec1', name: 'Dr. Prasad', specialty: 'Cardiologist', doctor_fee: 1500.00, center_fee: 500.00 },
  { id: 'spec2', name: 'Dr. Sanduni', specialty: 'Pediatrician', doctor_fee: 1200.00, center_fee: 400.00 },
  { id: 'spec3', name: 'Dr. Ruwan', specialty: 'Dermatologist', doctor_fee: 1000.00, center_fee: 500.00 }
];

const INITIAL_DRUGS = [
  {
    "id": "d1",
    "brand_name": "Panadol",
    "generic_name": "Paracetamol",
    "form": "tablet",
    "route": "oral",
    "manufacturer": "GlaxoSmithKline Ceylon",
    "strength": "500mg",
    "total_stock": 1200,
    "reorder_level": 200,
    "unit_price": 1.5,
    "selling_price": 2.5
  },
  {
    "id": "d2",
    "brand_name": "Alerid",
    "generic_name": "Cetirizine",
    "form": "tablet",
    "route": "oral",
    "manufacturer": "Cipla Ltd",
    "strength": "10mg",
    "total_stock": 450,
    "reorder_level": 100,
    "unit_price": 2,
    "selling_price": 4
  },
  {
    "id": "d3",
    "brand_name": "Amoxil",
    "generic_name": "Amoxicillin",
    "form": "capsule",
    "route": "oral",
    "manufacturer": "GlaxoSmithKline",
    "strength": "250mg",
    "total_stock": 300,
    "reorder_level": 100,
    "unit_price": 5,
    "selling_price": 8
  },
  {
    "id": "d4",
    "brand_name": "Amoxil",
    "generic_name": "Amoxicillin",
    "form": "capsule",
    "route": "oral",
    "manufacturer": "GlaxoSmithKline",
    "strength": "500mg",
    "total_stock": 200,
    "reorder_level": 100,
    "unit_price": 8,
    "selling_price": 12
  },
  {
    "id": "d5",
    "brand_name": "Lipitor",
    "generic_name": "Atorvastatin",
    "form": "tablet",
    "route": "oral",
    "manufacturer": "Pfizer",
    "strength": "10mg",
    "total_stock": 150,
    "reorder_level": 50,
    "unit_price": 12,
    "selling_price": 18
  },
  {
    "id": "d6",
    "brand_name": "Glucophage",
    "generic_name": "Metformin",
    "form": "tablet",
    "route": "oral",
    "manufacturer": "Merck",
    "strength": "500mg",
    "total_stock": 800,
    "reorder_level": 150,
    "unit_price": 3,
    "selling_price": 5
  },
  {
    "id": "d7",
    "brand_name": "Zaart",
    "generic_name": "Losartan Potassium",
    "form": "tablet",
    "route": "oral",
    "manufacturer": "MSD",
    "strength": "50mg",
    "total_stock": 600,
    "reorder_level": 100,
    "unit_price": 8,
    "selling_price": 12
  },
  {
    "brand_name": "Cipium",
    "generic_name": "Chlorphenamine",
    "manufacturer": "Leben",
    "form": "syrup",
    "route": "oral",
    "strength": "2mg/5ml",
    "reorder_level": 50,
    "id": "d_2zimkwkv5",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T05:50:49.357Z"
  },
  {
    "brand_name": "Parace",
    "generic_name": "paracetamol",
    "manufacturer": "Ace",
    "form": "syrup",
    "route": "oral",
    "strength": "120mg/5ml",
    "reorder_level": 50,
    "id": "d_62hpi9c94",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:00:36.872Z"
  },
  {
    "brand_name": "Theofin",
    "generic_name": "Theophylline",
    "manufacturer": "GAMMA INTERPHARM",
    "form": "syrup",
    "route": "oral",
    "strength": "26.67/5ml",
    "reorder_level": 50,
    "id": "d_spix6rwu2",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:02:17.343Z"
  },
  {
    "brand_name": "Libitus",
    "generic_name": "Dexamethorpan,phenylephrine,chlorpeniramine",
    "manufacturer": "Leben",
    "form": "syrup",
    "route": "oral",
    "strength": "100ml",
    "reorder_level": 50,
    "id": "d_quf27ulxo",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:04:18.381Z"
  },
  {
    "brand_name": "Tus Q Dx",
    "generic_name": "Dextromethorphan",
    "manufacturer": "Blue Cross",
    "form": "syrup",
    "route": "oral",
    "strength": "100ml",
    "reorder_level": 50,
    "id": "d_6plilqwah",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:11:20.454Z"
  },
  {
    "brand_name": "Cophyllin",
    "generic_name": "Etofylline and theophylline",
    "manufacturer": "Astron Limited",
    "form": "syrup",
    "route": "oral",
    "strength": "46.5mg/12.73mg",
    "reorder_level": 50,
    "id": "d_3pjcsdmvx",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:15:09.287Z"
  },
  {
    "brand_name": "Azmet",
    "generic_name": "Salbutamol",
    "manufacturer": "MEDICON",
    "form": "syrup",
    "route": "oral",
    "strength": "2mg/5ml",
    "reorder_level": 50,
    "id": "d_19jrlthrd",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:18:12.126Z"
  },
  {
    "brand_name": "cetirizine",
    "generic_name": "Cetirizine",
    "manufacturer": "AGIO PHARMACEUTICALS",
    "form": "syrup",
    "route": "oral",
    "strength": "5mg/5ml",
    "reorder_level": 50,
    "id": "d_uqb9ipic4",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:20:50.964Z"
  },
  {
    "brand_name": "Alerid",
    "generic_name": "Cetirizine Hydrochloride",
    "manufacturer": "Cipla",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_08vle02es",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:27:34.428Z"
  },
  {
    "brand_name": "Montelukast",
    "generic_name": "Montelukast",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_r1xyb5xja",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:33:31.985Z"
  },
  {
    "brand_name": "Methylprednisolone",
    "generic_name": "Methylprednisolone",
    "manufacturer": "SPMC",
    "form": "tablet",
    "route": "oral",
    "strength": "4mg",
    "reorder_level": 50,
    "id": "d_ud0sha8vr",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:36:06.886Z"
  },
  {
    "brand_name": "Cetirizine",
    "generic_name": "Cetirizine",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_08wfz7w1n",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:37:04.136Z"
  },
  {
    "brand_name": "BENPROPHY-5",
    "generic_name": "Finasteride",
    "manufacturer": "Akums drugs and pharmaceuticals",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_mbpm3kta2",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:40:38.835Z"
  },
  {
    "brand_name": "CETRAZ",
    "generic_name": "Cetirizine",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "10",
    "reorder_level": 50,
    "id": "d_0v28o3fje",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:53:48.339Z"
  },
  {
    "brand_name": "FEXOFRED 180",
    "generic_name": "Fexofenadine",
    "manufacturer": "FREDUN PHARMACEUTICALS",
    "form": "tablet",
    "route": "oral",
    "strength": "180mg",
    "reorder_level": 50,
    "id": "d_cu1zzvfw6",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T06:58:06.515Z"
  },
  {
    "brand_name": "Cipium",
    "generic_name": "chlorpheniramine",
    "manufacturer": "Leben",
    "form": "tablet",
    "route": "oral",
    "strength": "4mg",
    "reorder_level": 50,
    "id": "d_tlq3ibrci",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T07:01:10.091Z"
  },
  {
    "brand_name": "ASTHAFEN",
    "generic_name": "Ketotifen fumarate",
    "manufacturer": "TORRENT PHARMACEUTICALS",
    "form": "tablet",
    "route": "oral",
    "strength": "1mg",
    "reorder_level": 50,
    "id": "d_wwmmhljnc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T07:02:43.562Z"
  },
  {
    "brand_name": "cetirizine hydrochloride",
    "generic_name": "cetirizine hydrochloride",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_x5cbwwzu9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T07:07:03.601Z"
  },
  {
    "brand_name": "VEROMON",
    "generic_name": "Desloratadine",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_uo206p14u",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T07:10:39.311Z"
  },
  {
    "brand_name": "Paediatric paracetamol",
    "generic_name": "paracetamol",
    "manufacturer": "Alvita",
    "form": "syrup",
    "route": "oral",
    "strength": "120mg/5ml",
    "reorder_level": 50,
    "id": "d_v87x9m9ks",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T07:18:58.460Z"
  },
  {
    "brand_name": "zydus",
    "generic_name": "sustained relese etofylline and theophylline",
    "manufacturer": "Zydus lifesciences limited",
    "form": "tablet",
    "route": "oral",
    "strength": "150mg",
    "reorder_level": 50,
    "id": "d_56agwpe1g",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:22:08.266Z"
  },
  {
    "brand_name": "Deriphyllin Retard 300",
    "generic_name": "etofylline and theophylline",
    "manufacturer": "zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "300mg",
    "reorder_level": 50,
    "id": "d_60u5j61pk",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:23:31.375Z"
  },
  {
    "brand_name": "ENALAPRIL SPC",
    "generic_name": "Enalapril",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_f7bgxc133",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:26:56.173Z"
  },
  {
    "brand_name": "Diltiazem SPC",
    "generic_name": "Diltiasem",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "30mg",
    "reorder_level": 50,
    "id": "d_o1kcwnuz6",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:27:51.741Z"
  },
  {
    "brand_name": "DILCARDIA SR 90",
    "generic_name": "Diltiazem",
    "manufacturer": "UNIQUE'S",
    "form": "tablet",
    "route": "oral",
    "strength": "90mg",
    "reorder_level": 50,
    "id": "d_jwlektv7c",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:29:22.482Z"
  },
  {
    "brand_name": "Cinekar 10",
    "generic_name": "Clinidipine",
    "manufacturer": "TEBRANE",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_b5leifsft",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:34:55.064Z"
  },
  {
    "brand_name": "carvedilol zydus",
    "generic_name": "carvedilol",
    "manufacturer": "zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "3,125mg",
    "reorder_level": 50,
    "id": "d_39kgpmmc6",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:37:00.262Z"
  },
  {
    "brand_name": "amlodipine zydus",
    "generic_name": "Amlodipine",
    "manufacturer": "zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_339opf5y6",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:37:44.377Z"
  },
  {
    "brand_name": "Losaride 50",
    "generic_name": "Losartan potassium",
    "manufacturer": "innova",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_pnd6njr3d",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:39:30.645Z"
  },
  {
    "brand_name": "Chewable montelukast SPC",
    "generic_name": "chewable montelukast",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "4mg",
    "reorder_level": 50,
    "id": "d_td6eceh3i",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:41:11.610Z"
  },
  {
    "brand_name": "Amlopress 5",
    "generic_name": "Amlodipine besylate",
    "manufacturer": "Cipla",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_88ns9g4z9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:42:19.105Z"
  },
  {
    "brand_name": "DILCARDIA 60",
    "generic_name": "Diltiazem hydrochloride",
    "manufacturer": "Unique's",
    "form": "tablet",
    "route": "oral",
    "strength": "60mg",
    "reorder_level": 50,
    "id": "d_gba1gb1tk",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:43:49.257Z"
  },
  {
    "brand_name": "Losaride 50",
    "generic_name": "Losartan potassium",
    "manufacturer": "CLINIOON BIOTECH",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_dml71uzb2",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:46:02.103Z"
  },
  {
    "brand_name": "Telirol 40",
    "generic_name": "Telmisartan",
    "manufacturer": "INNOVA CAPTAB LTD",
    "form": "tablet",
    "route": "oral",
    "strength": "40mg",
    "reorder_level": 50,
    "id": "d_ca43bcme2",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:47:02.784Z"
  },
  {
    "brand_name": "Caramont 5",
    "generic_name": "Montelukast sodium",
    "manufacturer": "CARAWAY PHARMACEUTICALS",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_wjebmkv4g",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:48:53.182Z"
  },
  {
    "brand_name": "Bisocor 2.5",
    "generic_name": "Bisoprolol fumarate",
    "manufacturer": "SQUARE PHARMACEUTICALS",
    "form": "tablet",
    "route": "oral",
    "strength": "2.5mg",
    "reorder_level": 50,
    "id": "d_5oxdyrwhx",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:50:39.262Z"
  },
  {
    "brand_name": "ENALAPRIL MALEATE",
    "generic_name": "Enalapril",
    "manufacturer": "Medopharm",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_h1qnrk8os",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:52:09.195Z"
  },
  {
    "brand_name": "Isosorbide mononitrate",
    "generic_name": "Isosorbid mononitrate",
    "manufacturer": "zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "60mg",
    "reorder_level": 50,
    "id": "d_1gc7jqd2g",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T09:53:28.426Z"
  },
  {
    "brand_name": "ATOSAN 10",
    "generic_name": "Atovastatin",
    "manufacturer": "SANDS ACTIVE",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_4qpm8v2z3",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:09:19.414Z"
  },
  {
    "brand_name": "Admit-100",
    "generic_name": "Sitagliptin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_b5v7z68xe",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:10:43.349Z"
  },
  {
    "brand_name": "Sitagliptin Bafna",
    "generic_name": "Sitagliptin",
    "manufacturer": "Bafna pharmaceuticals",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_sn0dc0b6i",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:12:44.251Z"
  },
  {
    "brand_name": "inosita",
    "generic_name": "Sitagliptin ",
    "manufacturer": "PharmEvo Specs",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_xqkgt6aa8",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:13:49.090Z"
  },
  {
    "brand_name": "Linatin",
    "generic_name": "Linagliptin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_ew4oy3u00",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:14:39.213Z"
  },
  {
    "brand_name": "Nioglix MR 30",
    "generic_name": "Gliclazide MR",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "30mg",
    "reorder_level": 50,
    "id": "d_jznir40s7",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:16:06.722Z"
  },
  {
    "brand_name": "Empaglo 25",
    "generic_name": "Empagliflozin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "25 mg",
    "reorder_level": 50,
    "id": "d_z7d3zvzbc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:16:53.385Z"
  },
  {
    "brand_name": "Neoglix",
    "generic_name": "Gliclazide",
    "manufacturer": "WALLACE",
    "form": "tablet",
    "route": "oral",
    "strength": "40mg",
    "reorder_level": 50,
    "id": "d_z1iiwermq",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:18:31.871Z"
  },
  {
    "brand_name": "CELOMET SR",
    "generic_name": "Metformin prolonged release",
    "manufacturer": "Celogen",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_5rhcm0oy4",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:19:57.126Z"
  },
  {
    "brand_name": "SRIMET SR500",
    "generic_name": "Metformin SR",
    "manufacturer": "FREDUN Pharmaceuticals",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_laak71xq0",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:21:15.959Z"
  },
  {
    "brand_name": "Bigsens XR 500",
    "generic_name": "Metformin SR ",
    "manufacturer": "Zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_3imv1f102",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:22:35.357Z"
  },
  {
    "brand_name": "NEFIN 20 ER",
    "generic_name": "Nifedipine ER",
    "manufacturer": "FREDUN PHARMACEUTICALS",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_dd3q0b6w7",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:24:02.099Z"
  },
  {
    "brand_name": "LIPIDROP-20",
    "generic_name": "Atovastatin",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_pihlv8wu9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:25:00.610Z"
  },
  {
    "brand_name": "Clopidogre  ACE",
    "generic_name": "Clopidogrel",
    "manufacturer": "ACE",
    "form": "tablet",
    "route": "oral",
    "strength": "75mg",
    "reorder_level": 50,
    "id": "d_ygbj641ll",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:26:33.377Z"
  },
  {
    "brand_name": "Ranlo ER 500",
    "generic_name": "Ranolazine ER",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_1t12pbpex",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:27:33.324Z"
  },
  {
    "brand_name": "ACESTAT 20",
    "generic_name": "Atorvastatin calcium",
    "manufacturer": "ACE",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_fy58d8jis",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:28:47.940Z"
  },
  {
    "brand_name": "Alphapress",
    "generic_name": "Prazosin",
    "manufacturer": "RENATA Limited",
    "form": "tablet",
    "route": "oral",
    "strength": "1mg",
    "reorder_level": 50,
    "id": "d_mwpry2mvy",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:29:56.946Z"
  },
  {
    "brand_name": "ROSUNOVA-20",
    "generic_name": "Rosuvastatin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_vdy7e782w",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:31:06.536Z"
  },
  {
    "brand_name": "Aspirin DR SPC",
    "generic_name": "Aspirin SR",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "75mg",
    "reorder_level": 50,
    "id": "d_kxb5m2r1m",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:32:14.525Z"
  },
  {
    "brand_name": "ROSUNOVA 10",
    "generic_name": "ROSUVASTATIN",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_y39eorfqg",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:33:36.477Z"
  },
  {
    "brand_name": "Ecorin-75",
    "generic_name": "Aspirin DR",
    "manufacturer": "USV",
    "form": "tablet",
    "route": "oral",
    "strength": "75mg",
    "reorder_level": 50,
    "id": "d_bh0ipuisy",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:34:47.427Z"
  },
  {
    "brand_name": "Glicamed",
    "generic_name": "Gliclazide",
    "manufacturer": "MEDICO REMEDIES LTD",
    "form": "tablet",
    "route": "oral",
    "strength": "80mg",
    "reorder_level": 50,
    "id": "d_jx2e3g5zw",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:37:17.172Z"
  },
  {
    "brand_name": "ROSUNOVA-5",
    "generic_name": "Rosuvastatin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_vfngp57ru",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:38:22.937Z"
  },
  {
    "brand_name": "ARBI",
    "generic_name": "irbesartan",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "150mg",
    "reorder_level": 50,
    "id": "d_2jaghpg4b",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:39:31.737Z"
  },
  {
    "brand_name": "Metoprolol succinate ER SPC",
    "generic_name": "Metoprolol succinate ER",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_3okn7a44x",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T10:40:55.728Z"
  },
  {
    "brand_name": "ELOCID",
    "generic_name": "Omeprazole DR",
    "manufacturer": "YASH PHARMA",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_fi3pbo38k",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:04:13.796Z"
  },
  {
    "brand_name": "OMMED-20",
    "generic_name": "omeprazole",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_omop8xo6o",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:05:25.233Z"
  },
  {
    "brand_name": "INNOCID 20",
    "generic_name": "Omeprazole",
    "manufacturer": "CLINIOON BIOTECH",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_3g6nhemo1",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:06:39.126Z"
  },
  {
    "brand_name": "Gas-med",
    "generic_name": "simethicone",
    "manufacturer": "T.man pharma co",
    "form": "syrup",
    "route": "oral",
    "strength": "40mg/0.6ml",
    "reorder_level": 50,
    "id": "d_2z4ww86ex",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:08:18.167Z"
  },
  {
    "brand_name": "Peptica GEL",
    "generic_name": "Alumina,Magnesia and simethicone",
    "manufacturer": "GENO",
    "form": "syrup",
    "route": "oral",
    "strength": "200ml",
    "reorder_level": 50,
    "id": "d_rwrocq95r",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:09:43.489Z"
  },
  {
    "brand_name": "Amboten",
    "generic_name": "Ambroxol Hydrochloride",
    "manufacturer": "ESKAYEF Pharmaceuticals",
    "form": "syrup",
    "route": "oral",
    "strength": "15mg/5ml",
    "reorder_level": 50,
    "id": "d_q8rwesyyt",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:11:46.365Z"
  },
  {
    "brand_name": "MaskAcid",
    "generic_name": "MAGADRATE and SIMETHICONE ",
    "manufacturer": "J.B.Chemicals and pharmaceuticals",
    "form": "syrup",
    "route": "oral",
    "strength": "400mg+20mg/5ml",
    "reorder_level": 50,
    "id": "d_btp6kyfca",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:13:52.877Z"
  },
  {
    "brand_name": "Lacfomac ",
    "generic_name": "Lactulose ",
    "manufacturer": "MAXTRA Global",
    "form": "syrup",
    "route": "oral",
    "strength": "10mg/15ml",
    "reorder_level": 50,
    "id": "d_sb5o9p6qi",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:15:25.134Z"
  },
  {
    "brand_name": "Antagit-DS Gel",
    "generic_name": "alumina,magnesia and simethicone",
    "manufacturer": "Leben",
    "form": "syrup",
    "route": "oral",
    "strength": "100ml",
    "reorder_level": 50,
    "id": "d_kqqcfxy4v",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:17:11.670Z"
  },
  {
    "brand_name": "Dompi",
    "generic_name": "Domperidone ",
    "manufacturer": "SPC",
    "form": "syrup",
    "route": "oral",
    "strength": "5mg/5ml",
    "reorder_level": 50,
    "id": "d_chiu71dlk",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:18:01.032Z"
  },
  {
    "brand_name": "MICRONEMA",
    "generic_name": "Sodium citrate, sadium lauryl sulphate,glycerin",
    "manufacturer": "ATCO",
    "form": "syrup",
    "route": "oral",
    "strength": "450mgl10ml+75mg/10ml+90%",
    "reorder_level": 50,
    "id": "d_8qzwj7d5l",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:21:15.544Z"
  },
  {
    "brand_name": "Famotadin SPC",
    "generic_name": "Famotadin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_swcyqqesg",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-06T11:22:07.013Z"
  },
  {
    "brand_name": "LAXAFRED",
    "generic_name": "Bisacodyl",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_rgkipxokb",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:05:45.939Z"
  },
  {
    "brand_name": "Oraspas",
    "generic_name": "Hyoscin Butylbromide",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_jeaq1ej33",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:12:38.690Z"
  },
  {
    "brand_name": "PANTAC-150",
    "generic_name": "Ranitidine",
    "manufacturer": "Pharma associates",
    "form": "tablet",
    "route": "oral",
    "strength": "150mg",
    "reorder_level": 50,
    "id": "d_cyesmti3l",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:14:27.381Z"
  },
  {
    "brand_name": "Lopex",
    "generic_name": "Loperamide Hydrochloride",
    "manufacturer": "Pharma associates",
    "form": "tablet",
    "route": "oral",
    "strength": "2mg",
    "reorder_level": 50,
    "id": "d_5jbmlgdva",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:19:36.197Z"
  },
  {
    "brand_name": "GENOCID 20",
    "generic_name": "Pantaprazole sodium",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_2oyn9hz49",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:22:49.561Z"
  },
  {
    "brand_name": "FAMOGEN 20",
    "generic_name": "Famotidine",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_uk77zb2zc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:24:26.614Z"
  },
  {
    "brand_name": "Rabeprazole sadium DR ZYDUD",
    "generic_name": "Rabeprazole",
    "manufacturer": "zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_l1anlh19n",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T05:59:18.092Z"
  },
  {
    "brand_name": "Domperidone ABC",
    "generic_name": "Domperidone",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_o2ng6317u",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T06:02:33.187Z"
  },
  {
    "brand_name": "Air X",
    "generic_name": "Simethicone",
    "manufacturer": "R.X. Manufacturing",
    "form": "tablet",
    "route": "oral",
    "strength": "80mg",
    "reorder_level": 50,
    "id": "d_htop2cc6c",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T06:04:21.172Z"
  },
  {
    "brand_name": "Esomeprazole SPC",
    "generic_name": "Esomeprazole",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "40mg",
    "reorder_level": 50,
    "id": "d_zvzy46fta",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T06:07:28.381Z"
  },
  {
    "brand_name": "Esomeprazole SPC",
    "generic_name": "Esomeprazole",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_bdtivs4ir",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T06:13:06.191Z"
  },
  {
    "brand_name": "ORINOL 100",
    "generic_name": "Allopurinol",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_8b6q49ghy",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T06:15:50.990Z"
  },
  {
    "brand_name": "ondanset ODS 4",
    "generic_name": "Ondansetron ODS",
    "manufacturer": "TABRANE Pharmaceuticals",
    "form": "tablet",
    "route": "oral",
    "strength": "4mg",
    "reorder_level": 50,
    "id": "d_ht7qkjr7i",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-07T06:19:12.183Z"
  },
  {
    "brand_name": "Celecoxibe SPC",
    "generic_name": "Celecoxibe",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_1ph2avxg4",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:13:06.460Z"
  },
  {
    "brand_name": "BETAHIST FORTE",
    "generic_name": "8% Betahistine Dihydrochloride",
    "manufacturer": "GENO",
    "form": "tablet",
    "route": "oral",
    "strength": "16mg",
    "reorder_level": 50,
    "id": "d_0ypm1tloo",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:15:10.582Z"
  },
  {
    "brand_name": "Celecoxib ACE",
    "generic_name": "Celecoxib",
    "manufacturer": "ACE",
    "form": "tablet",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_yo9htq8t0",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:16:16.743Z"
  },
  {
    "brand_name": "Etovin-90",
    "generic_name": "ETORICOXIB",
    "manufacturer": "AXON DRUGS",
    "form": "tablet",
    "route": "oral",
    "strength": "90mg",
    "reorder_level": 50,
    "id": "d_l9va5a59u",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:20:27.316Z"
  },
  {
    "brand_name": "Nostra",
    "generic_name": "Norethindrone",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_mnv2kj849",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:22:49.746Z"
  },
  {
    "brand_name": "KLODIC",
    "generic_name": "Diclofenac potassium",
    "manufacturer": "N PHARMA",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_q17tbklgb",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:25:38.609Z"
  },
  {
    "brand_name": "Neurotone",
    "generic_name": "NEUROTROPIC VITAMIN",
    "manufacturer": "Emerchemie NB",
    "form": "tablet",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_46w3dbxxt",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:29:12.989Z"
  },
  {
    "brand_name": "FLUNARIN-5",
    "generic_name": "Flunarizine",
    "manufacturer": "FDC Limited",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_o5y8s2qmt",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:30:58.068Z"
  },
  {
    "brand_name": "Betahistine Dihydrochloride SPC",
    "generic_name": "Betahistine Dihydrochloride",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "8mg",
    "reorder_level": 50,
    "id": "d_l1d3urjj5",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:32:39.045Z"
  },
  {
    "brand_name": "Dicloflan 50",
    "generic_name": "Diclofenac potassium",
    "manufacturer": "Zim",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_m67z0uhya",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:33:52.897Z"
  },
  {
    "brand_name": "MELOXICAM SPC",
    "generic_name": "MELOXICAM",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "7.5mg",
    "reorder_level": 50,
    "id": "d_4qz7azzx9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:34:50.604Z"
  },
  {
    "brand_name": "TRENAXA 500 SPC",
    "generic_name": "Tranexamic acid",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_2w94h7mms",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:35:49.838Z"
  },
  {
    "brand_name": "Walacort",
    "generic_name": "Betamethasone",
    "manufacturer": "WALLACE",
    "form": "tablet",
    "route": "oral",
    "strength": "0.5mg",
    "reorder_level": 50,
    "id": "d_myo3ejdzn",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:37:07.784Z"
  },
  {
    "brand_name": "Norethisterone BELCO",
    "generic_name": "Norethisterone",
    "manufacturer": "BELCO PHARMA",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_iyx2linbv",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:38:59.253Z"
  },
  {
    "brand_name": "BACLON-10",
    "generic_name": "BACLOFEN ",
    "manufacturer": "NOVACHEM LANKA",
    "form": "tablet",
    "route": "oral",
    "strength": "10mg",
    "reorder_level": 50,
    "id": "d_un503hc5x",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:40:41.556Z"
  },
  {
    "brand_name": "FENOFAST ",
    "generic_name": "Fenofibrate ",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_2drpbix67",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:49:04.096Z"
  },
  {
    "brand_name": "Parace",
    "generic_name": "Paracetamol",
    "manufacturer": "ACE",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_kn5477k0i",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:50:22.080Z"
  },
  {
    "brand_name": "Adiflam-50",
    "generic_name": "Diclofenac",
    "manufacturer": "LeBen",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_vuygeyukg",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T08:53:32.289Z"
  },
  {
    "brand_name": "DUROL",
    "generic_name": "IRON AND B COMPLEX",
    "manufacturer": "Astron Limited",
    "form": "syrup",
    "route": "oral",
    "strength": "200ml",
    "reorder_level": 50,
    "id": "d_x92rvhrix",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:07:58.188Z"
  },
  {
    "brand_name": "Vitalise gold",
    "generic_name": "Lysine and mierals",
    "manufacturer": "Astron",
    "form": "syrup",
    "route": "oral",
    "strength": "100ml",
    "reorder_level": 50,
    "id": "d_yl977kvzl",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:08:56.356Z"
  },
  {
    "brand_name": "ZINCORUP",
    "generic_name": "Multivitamin with zn",
    "manufacturer": "Astron",
    "form": "syrup",
    "route": "oral",
    "strength": "100ml",
    "reorder_level": 50,
    "id": "d_kyb6nnofk",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:09:46.389Z"
  },
  {
    "brand_name": "PEDIVIT",
    "generic_name": "MULTIVITAMIN WITH MINERALS",
    "manufacturer": "Unique",
    "form": "capsule",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_a1he7yof9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:16:06.157Z"
  },
  {
    "brand_name": "E-CAP-400",
    "generic_name": "Vitamin E ",
    "manufacturer": "DRUG INTERNATIONAL LTD",
    "form": "capsule",
    "route": "oral",
    "strength": "400mg",
    "reorder_level": 50,
    "id": "d_n67jljcge",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:17:42.261Z"
  },
  {
    "brand_name": "Chelferron",
    "generic_name": "iron with multivitamin",
    "manufacturer": "LeBen",
    "form": "capsule",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_jz9wuh0kh",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:19:36.053Z"
  },
  {
    "brand_name": "VITROMEGA",
    "generic_name": "Omega 3 fish oil",
    "manufacturer": "SPC",
    "form": "capsule",
    "route": "oral",
    "strength": "1000mg",
    "reorder_level": 50,
    "id": "d_lusmtivsb",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:20:52.593Z"
  },
  {
    "brand_name": "FAMOGEN 20",
    "generic_name": "Famotidine",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_xpmecy8zj",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:21:40.667Z"
  },
  {
    "brand_name": "sodium Bicarbonate SPC",
    "generic_name": "Sodium Bicarbonate",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "600mg",
    "reorder_level": 50,
    "id": "d_kr5ow4kqx",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:23:09.946Z"
  },
  {
    "brand_name": "VITA E 200",
    "generic_name": "Vitamin E",
    "manufacturer": "Renown pharmaceuticals",
    "form": "capsule",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_legkudy6p",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:24:53.835Z"
  },
  {
    "brand_name": "TOCOSOFT-400",
    "generic_name": "VITAMIN E",
    "manufacturer": "Softgel healthcare ",
    "form": "capsule",
    "route": "oral",
    "strength": "400mg",
    "reorder_level": 50,
    "id": "d_cdf8nqqmh",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:26:23.707Z"
  },
  {
    "brand_name": "PERITOL",
    "generic_name": "Cyproheptadine",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "4mg",
    "reorder_level": 50,
    "id": "d_0s8eiztki",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:27:52.598Z"
  },
  {
    "brand_name": "Kalzana",
    "generic_name": "chewable tablets of Calcium with Vitamis",
    "manufacturer": "Zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "430mg",
    "reorder_level": 50,
    "id": "d_y23xdvtkc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:29:44.170Z"
  },
  {
    "brand_name": "Cholecalciferol SPC",
    "generic_name": "Cholecalciferol",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "2000IU",
    "reorder_level": 50,
    "id": "d_xidhs4w0j",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:32:53.762Z"
  },
  {
    "brand_name": "FOLEE-1",
    "generic_name": "FOLIC ACID ",
    "manufacturer": "Swiss Garnier",
    "form": "tablet",
    "route": "oral",
    "strength": "1mg",
    "reorder_level": 50,
    "id": "d_ih2ynw2pi",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:35:18.907Z"
  },
  {
    "brand_name": "Cholecalciferol",
    "generic_name": "Cholecalciferol",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "1000IU",
    "reorder_level": 50,
    "id": "d_p0v0scdft",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:38:24.001Z"
  },
  {
    "brand_name": "CAD-D 2000",
    "generic_name": "Cholicalciferol",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "2000IU",
    "reorder_level": 50,
    "id": "d_oonva34j2",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:39:16.807Z"
  },
  {
    "brand_name": "CLONAZEPAM SPC",
    "generic_name": "CLONAZEPAM",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "0.5 mg",
    "reorder_level": 50,
    "id": "d_oe9n4k40j",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:54:55.221Z"
  },
  {
    "brand_name": "Evitra 500",
    "generic_name": "Levetiracetam",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_kskai9d5l",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:56:24.954Z"
  },
  {
    "brand_name": "Sertraline Hydrochloride",
    "generic_name": "Setraline",
    "manufacturer": "Zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_b0osrqasq",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T09:58:30.580Z"
  },
  {
    "brand_name": "NEPEZ-5",
    "generic_name": "DONEPEZIL HYDROCHLORIDE",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_hrmai4biq",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:00:24.923Z"
  },
  {
    "brand_name": "TOPIRAMATE",
    "generic_name": "TOPIRAMATE",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "25mg",
    "reorder_level": 50,
    "id": "d_52vnk68mh",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:02:30.932Z"
  },
  {
    "brand_name": "FLUTEX 20",
    "generic_name": "Fluoxetine",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "20mg",
    "reorder_level": 50,
    "id": "d_02ot0cnlt",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:05:18.386Z"
  },
  {
    "brand_name": "QVEX 25",
    "generic_name": "Quetiapine",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "25mg",
    "reorder_level": 50,
    "id": "d_jnqml3x9k",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:06:31.711Z"
  },
  {
    "brand_name": "NAZA-0.5",
    "generic_name": "CLONAZEPAM",
    "manufacturer": "Pharmafabrikon",
    "form": "tablet",
    "route": "oral",
    "strength": "0.5mg",
    "reorder_level": 50,
    "id": "d_b10fkuwrm",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:08:26.507Z"
  },
  {
    "brand_name": "Atrest",
    "generic_name": "Alprazolam",
    "manufacturer": "Centaur",
    "form": "tablet",
    "route": "oral",
    "strength": "0.5mg",
    "reorder_level": 50,
    "id": "d_4qzblq9qc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:09:12.520Z"
  },
  {
    "brand_name": "ABZ",
    "generic_name": "Albendazole",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "400mg",
    "reorder_level": 50,
    "id": "d_1jr9npl27",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:12:25.533Z"
  },
  {
    "brand_name": "Mithuri",
    "generic_name": "LEVONORGESTREL,ETHINYLESTRADIOL",
    "manufacturer": "FPA",
    "form": "tablet",
    "route": "oral",
    "strength": "0.15mg,0.03mg",
    "reorder_level": 50,
    "id": "d_h0lxj3mye",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:14:25.291Z"
  },
  {
    "brand_name": "T4 50 Montpellier",
    "generic_name": "Levothyroxine sodium",
    "manufacturer": "Bago",
    "form": "tablet",
    "route": "oral",
    "strength": "50mcg",
    "reorder_level": 50,
    "id": "d_sgnjadvl7",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:16:26.582Z"
  },
  {
    "brand_name": "Panadeine",
    "generic_name": "Paracetamol,codaine phosphate",
    "manufacturer": "GSK",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_67jaz1oia",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:17:55.514Z"
  },
  {
    "brand_name": "ENOGRA-50",
    "generic_name": "Sildenafil",
    "manufacturer": "ZIM",
    "form": "tablet",
    "route": "oral",
    "strength": "50mg",
    "reorder_level": 50,
    "id": "d_lo19apojh",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:20:04.160Z"
  },
  {
    "brand_name": "Paragon",
    "generic_name": "Paracetamol",
    "manufacturer": "Zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_i9wsxetb8",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:21:17.653Z"
  },
  {
    "brand_name": "PYRANTIN",
    "generic_name": "PYRANTEL PAMOATE",
    "manufacturer": "Astron",
    "form": "tablet",
    "route": "oral",
    "strength": "125mg",
    "reorder_level": 50,
    "id": "d_zjfrdcupc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:23:05.063Z"
  },
  {
    "brand_name": "Tamsulosin Hydrochloride Zydus",
    "generic_name": "Tamsulosin Hydrochloride",
    "manufacturer": "Zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "0.4mg",
    "reorder_level": 50,
    "id": "d_0fn0ycqij",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:25:44.578Z"
  },
  {
    "brand_name": "Cacicure 0.25",
    "generic_name": "Alfacalcidol",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "0.25mg",
    "reorder_level": 50,
    "id": "d_gnyuoep7h",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:27:37.678Z"
  },
  {
    "brand_name": "Neoprox",
    "generic_name": "Naproxen",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_3tc0sulub",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:30:42.670Z"
  },
  {
    "brand_name": "ALNATE",
    "generic_name": "ALENDRONATE SODIUM",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "70mg",
    "reorder_level": 50,
    "id": "d_np1aagvhn",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-08T10:31:42.177Z"
  },
  {
    "brand_name": "Cyclovir",
    "generic_name": "Acyclovir",
    "manufacturer": "Zydus",
    "form": "tablet",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_adimj6o2n",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:11:18.907Z"
  },
  {
    "brand_name": "SANDSCEF-500",
    "generic_name": "Cefuroxime Axetl",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_58dk1uodw",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:12:39.633Z"
  },
  {
    "brand_name": "Finemox CV ",
    "generic_name": "Co-Amoxiclav",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "625mg",
    "reorder_level": 50,
    "id": "d_5lwypml7i",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:13:41.185Z"
  },
  {
    "brand_name": "Dalagen 300",
    "generic_name": "Clindamycin Hydrochloride",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "300mg",
    "reorder_level": 50,
    "id": "d_loslmmp8h",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:14:42.913Z"
  },
  {
    "brand_name": "Flucloxacillin SPMC",
    "generic_name": "Flucloxacillin",
    "manufacturer": "SPMC",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_aj23y5zck",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:16:23.316Z"
  },
  {
    "brand_name": "NUMOX-500",
    "generic_name": "Amoxacillin",
    "manufacturer": "SLIM Pharmaceuticals",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_jfijuw8k6",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:18:23.747Z"
  },
  {
    "brand_name": "MAHACEF-200",
    "generic_name": "Cefixime",
    "manufacturer": "Makind",
    "form": "tablet",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_kz7vtea9f",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:19:24.594Z"
  },
  {
    "brand_name": "cefuroxime Axetil SPC",
    "generic_name": "Cefuroxime Axetil",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "125mg",
    "reorder_level": 50,
    "id": "d_vnl03qjuy",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:20:46.055Z"
  },
  {
    "brand_name": "TERBINAFORCE250",
    "generic_name": "Terbinafine",
    "manufacturer": "Makind",
    "form": "tablet",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_o69iyrb6p",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:22:32.186Z"
  },
  {
    "brand_name": "CEFIXIME DT",
    "generic_name": "Cefixime",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "200mg",
    "reorder_level": 50,
    "id": "d_3ehsqiqct",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:51:54.330Z"
  },
  {
    "brand_name": "Clindamycin SPC",
    "generic_name": "Clindamycin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "150mg",
    "reorder_level": 50,
    "id": "d_6epqzqa93",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:53:26.742Z"
  },
  {
    "brand_name": "climycin 300",
    "generic_name": "Clindamycin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "300mg",
    "reorder_level": 50,
    "id": "d_es9exr5ev",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:54:28.894Z"
  },
  {
    "brand_name": "Moxileb-250",
    "generic_name": "Amoxicillin",
    "manufacturer": "Leben",
    "form": "tablet",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_x8l9bu3ub",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:55:41.111Z"
  },
  {
    "brand_name": "Doxyleb",
    "generic_name": "Doxycycline",
    "manufacturer": "Leben",
    "form": "tablet",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_6owc5umtl",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:57:14.511Z"
  },
  {
    "brand_name": "cephalexin SPC",
    "generic_name": "Cephalexin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "125mg",
    "reorder_level": 50,
    "id": "d_vbaaypi41",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T08:58:26.715Z"
  },
  {
    "brand_name": "Azithromycin",
    "generic_name": "Azithromycin",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_0scz8h5zf",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:02:03.014Z"
  },
  {
    "brand_name": "MAHACEF-100",
    "generic_name": "Cefixime DT",
    "manufacturer": "Mankind",
    "form": "tablet",
    "route": "oral",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_ev32i81dx",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:03:50.917Z"
  },
  {
    "brand_name": "UCLOX-250",
    "generic_name": "Cloxacillin Sadium",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_8ggs10k6r",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:22:09.470Z"
  },
  {
    "brand_name": "Zetro",
    "generic_name": "Azithromycin",
    "manufacturer": "Getz",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_fm14exqee",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:23:44.684Z"
  },
  {
    "brand_name": "CLATRIL",
    "generic_name": "Clarithromycin",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_k95tyrqew",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:25:07.745Z"
  },
  {
    "brand_name": "AUXTOCEF",
    "generic_name": "Cefuroxime Axetil",
    "manufacturer": "SPC",
    "form": "tablet",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_o85m2jx5m",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:26:42.196Z"
  },
  {
    "brand_name": "Diclovin-100",
    "generic_name": "Diclofenac  sodium ",
    "manufacturer": "SPC",
    "form": "suppository",
    "route": "rectal",
    "strength": "100mg",
    "reorder_level": 50,
    "id": "d_onwsy8ri4",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:29:07.216Z"
  },
  {
    "brand_name": "MOXOL-250",
    "generic_name": "AMOXICILLIN",
    "manufacturer": "Sterilingn Lab",
    "form": "capsule",
    "route": "oral",
    "strength": "250mg",
    "reorder_level": 50,
    "id": "d_dmtyw1ypc",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:31:00.721Z"
  },
  {
    "brand_name": "AZIFRED -DS",
    "generic_name": "AZITHROMYCIN",
    "manufacturer": "SPC",
    "form": "syrup",
    "route": "oral",
    "strength": "200mg/5ml",
    "reorder_level": 50,
    "id": "d_nla1tir9f",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:35:03.104Z"
  },
  {
    "brand_name": "LIVOX-500",
    "generic_name": "Levofloxacin",
    "manufacturer": "abcpharma",
    "form": "tablet",
    "route": "oral",
    "strength": "500mg",
    "reorder_level": 50,
    "id": "d_7kx1qts4w",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:44:41.036Z"
  },
  {
    "brand_name": "Asclav",
    "generic_name": "co-amoxiclav",
    "manufacturer": "Astron",
    "form": "syrup",
    "route": "oral",
    "strength": "156.25mg/5ml",
    "reorder_level": 50,
    "id": "d_h092hjcae",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:46:55.987Z"
  },
  {
    "brand_name": "Erox",
    "generic_name": "Amoxacillin",
    "manufacturer": "MICRO LABS LIMITED",
    "form": "syrup",
    "route": "oral",
    "strength": "125mg/5ml",
    "reorder_level": 50,
    "id": "d_ymkymn1uv",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:49:46.161Z"
  },
  {
    "brand_name": "Azileb-200",
    "generic_name": "Azithromycin",
    "manufacturer": "Leben",
    "form": "syrup",
    "route": "oral",
    "strength": "200mg/5ml",
    "reorder_level": 50,
    "id": "d_lxte2lr3x",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:50:43.298Z"
  },
  {
    "brand_name": "Lecef",
    "generic_name": "Cefalexin ",
    "manufacturer": "MICRO LABS",
    "form": "syrup",
    "route": "oral",
    "strength": "125mg/5ml",
    "reorder_level": 50,
    "id": "d_rvj84a27s",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:58:20.765Z"
  },
  {
    "brand_name": "Alclox",
    "generic_name": "Cloxacillin",
    "manufacturer": "Leben",
    "form": "syrup",
    "route": "oral",
    "strength": "125mg/5ml",
    "reorder_level": 50,
    "id": "d_y0hqx4eag",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T09:59:58.431Z"
  },
  {
    "brand_name": "Zetro",
    "generic_name": "Azithromycin",
    "manufacturer": "Getz pharma",
    "form": "syrup",
    "route": "oral",
    "strength": "200mg/5ml",
    "reorder_level": 50,
    "id": "d_wmqs0cq4k",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:01:35.323Z"
  },
  {
    "brand_name": "Betasol-N",
    "generic_name": "Betamethasone sodium",
    "manufacturer": "mbl",
    "form": "dropper",
    "route": "ophthalmic",
    "strength": "5ml",
    "reorder_level": 50,
    "id": "d_brj5lqdao",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:24:11.426Z"
  },
  {
    "brand_name": "I-CIP",
    "generic_name": "ciprofloxacin",
    "manufacturer": "abcpharma",
    "form": "dropper",
    "route": "ophthalmic",
    "strength": "0.3%",
    "reorder_level": 50,
    "id": "d_1ekg8o8ud",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:25:39.736Z"
  },
  {
    "brand_name": "Optimox",
    "generic_name": "Moxifloxacin",
    "manufacturer": "ARISTOPHARMA",
    "form": "dropper",
    "route": "ophthalmic",
    "strength": "0.5%",
    "reorder_level": 50,
    "id": "d_j5965170w",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:26:39.616Z"
  },
  {
    "brand_name": "Glenper",
    "generic_name": "permethrin ",
    "manufacturer": "Glenmark",
    "form": "cream",
    "route": "topical",
    "strength": "5%",
    "reorder_level": 50,
    "id": "d_ps2ey7cp0",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:27:25.753Z"
  },
  {
    "brand_name": "Pyloocain ",
    "generic_name": "betamethasone,lidocaine,phenylephrine",
    "manufacturer": "Galentic",
    "form": "ointment",
    "route": "rectal",
    "strength": "0.5mng,1mg,25mg in 1g",
    "reorder_level": 50,
    "id": "d_cobric68d",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:31:00.821Z"
  },
  {
    "brand_name": "CLOBIT",
    "generic_name": "Clobetasol",
    "manufacturer": "SPC",
    "form": "cream",
    "route": "topical",
    "strength": "0.05%",
    "reorder_level": 50,
    "id": "d_cy3q5qrlg",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:32:44.339Z"
  },
  {
    "brand_name": "flutocone",
    "generic_name": "Fluticasone",
    "manufacturer": "Zydus",
    "form": "inhaler",
    "route": "nasal",
    "strength": "50mcg",
    "reorder_level": 50,
    "id": "d_t8ojhqczt",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:34:03.863Z"
  },
  {
    "brand_name": "Tetracycline Hydrochloride",
    "generic_name": "Tetracycline",
    "manufacturer": "SPC",
    "form": "ointment",
    "route": "topical",
    "strength": "3%",
    "reorder_level": 50,
    "id": "d_yv9hy9fga",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:35:52.701Z"
  },
  {
    "brand_name": "ANASICA",
    "generic_name": "Lidocaine Hydrochloride jelly",
    "manufacturer": "SPC",
    "form": "cream",
    "route": "topical",
    "strength": "2%",
    "reorder_level": 50,
    "id": "d_dlct2myfa",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:37:42.704Z"
  },
  {
    "brand_name": "BEAM  FIEL",
    "generic_name": "BEAMFIEL OINTMENT",
    "manufacturer": "Beam hela",
    "form": "cream",
    "route": "topical",
    "strength": "15mg",
    "reorder_level": 50,
    "id": "d_v6plt0h83",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:41:14.588Z"
  },
  {
    "brand_name": "Enderm",
    "generic_name": "Clobetasol Propionate",
    "manufacturer": "Leben",
    "form": "cream",
    "route": "topical",
    "strength": "0.05%",
    "reorder_level": 50,
    "id": "d_tjc5cm6k7",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:42:15.673Z"
  },
  {
    "brand_name": "Tetracycline Hydrochloride  ",
    "generic_name": "Tetracycline Hydrochloride",
    "manufacturer": "asence",
    "form": "ointment",
    "route": "ophthalmic",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_j8jqdjl1k",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:44:01.111Z"
  },
  {
    "brand_name": "HI-SILD",
    "generic_name": "Zilver sulfadiazine",
    "manufacturer": "SPC",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_yixtl8a4b",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:45:50.610Z"
  },
  {
    "brand_name": "Framicin",
    "generic_name": "Framycetin Sulfate",
    "manufacturer": "NEM ",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_jr69pvebp",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:48:00.546Z"
  },
  {
    "brand_name": "Povidone - Iodine SPC",
    "generic_name": "Povidone iodine",
    "manufacturer": "SPC",
    "form": "ointment",
    "route": "topical",
    "strength": "5%",
    "reorder_level": 50,
    "id": "d_vqudsj5lx",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:49:48.764Z"
  },
  {
    "brand_name": "Terbinaforce",
    "generic_name": "Terbinafine ",
    "manufacturer": "MANKIND",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_r8yrzqz03",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:50:50.649Z"
  },
  {
    "brand_name": "Canben",
    "generic_name": "Clotrimazole",
    "manufacturer": "Leben",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_0gav21zqy",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:51:36.415Z"
  },
  {
    "brand_name": "Deriva - c",
    "generic_name": "Adapalene,Clindamycine gel",
    "manufacturer": "Glenmark",
    "form": "cream",
    "route": "topical",
    "strength": "15mg",
    "reorder_level": 50,
    "id": "d_8yd07fkkm",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:52:39.717Z"
  },
  {
    "brand_name": "Oximetazoline Hydrochloride SPC",
    "generic_name": "Oximetazoline Hydrochloride",
    "manufacturer": "SPC",
    "form": "dropper",
    "route": "nasal",
    "strength": "0.025%",
    "reorder_level": 50,
    "id": "d_uooh0nl6z",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:54:19.222Z"
  },
  {
    "brand_name": "Tetra-cort",
    "generic_name": "Oxitetracycline and Hydrocortisone",
    "manufacturer": "Astron",
    "form": "ointment",
    "route": "topical",
    "strength": "15mg",
    "reorder_level": 50,
    "id": "d_z5i5g4lqy",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:55:47.907Z"
  },
  {
    "brand_name": "Hycor 15",
    "generic_name": "Hydrocortisone",
    "manufacturer": "MICRO LAB",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_brkqe69al",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:56:45.371Z"
  },
  {
    "brand_name": "BETANONE",
    "generic_name": "Betamethasone ",
    "manufacturer": "SPC",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_kc650lfv9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T10:58:48.233Z"
  },
  {
    "brand_name": "DERM KETA",
    "generic_name": "Ketoconazole",
    "manufacturer": "GALENTIC",
    "form": "cream",
    "route": "topical",
    "strength": "2%",
    "reorder_level": 50,
    "id": "d_iikgvuhre",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:00:14.245Z"
  },
  {
    "brand_name": "GARACIN",
    "generic_name": "Gentamycin",
    "manufacturer": "BELCO PHARMA",
    "form": "dropper",
    "route": "ophthalmic",
    "strength": "0.3%",
    "reorder_level": 50,
    "id": "d_jv2bp3rob",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:01:36.967Z"
  },
  {
    "brand_name": "Candid mouth paint",
    "generic_name": "Clotrimazole",
    "manufacturer": "Glenmark",
    "form": "other",
    "route": "oral",
    "strength": "15ml",
    "reorder_level": 50,
    "id": "d_oh7qevxou",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:03:04.846Z"
  },
  {
    "brand_name": "ocumycin",
    "generic_name": "Chlorompenicol",
    "manufacturer": "SPC",
    "form": "ointment",
    "route": "ophthalmic",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_ndd0j8z84",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:04:29.932Z"
  },
  {
    "brand_name": "Betaleb-N",
    "generic_name": "Betamethasone and neomycin sulphate",
    "manufacturer": "Leben",
    "form": "cream",
    "route": "topical",
    "strength": "5mg",
    "reorder_level": 50,
    "id": "d_7rwfadf2b",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:06:02.233Z"
  },
  {
    "brand_name": "Momson",
    "generic_name": "Mometasone Furoate",
    "manufacturer": "Leben",
    "form": "cream",
    "route": "topical",
    "strength": "0.1%",
    "reorder_level": 50,
    "id": "d_3m9pq2x4k",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:07:03.839Z"
  },
  {
    "brand_name": "Fusidic acid cream",
    "generic_name": "Fusidic Acid Cream",
    "manufacturer": "Ace",
    "form": "cream",
    "route": "topical",
    "strength": "2%",
    "reorder_level": 50,
    "id": "d_mku5e8pbo",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:08:36.819Z"
  },
  {
    "brand_name": "Nasoclear",
    "generic_name": "Saline nasal spray",
    "manufacturer": "Zydus",
    "form": "dropper",
    "route": "nasal",
    "strength": "20ml",
    "reorder_level": 50,
    "id": "d_xa1evm83j",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:09:54.758Z"
  },
  {
    "brand_name": "Miconaszole Nitrate",
    "generic_name": "Miconazole Nitrate",
    "manufacturer": "SPC",
    "form": "cream",
    "route": "topical",
    "strength": "2%",
    "reorder_level": 50,
    "id": "d_9oylx2t1d",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:10:51.695Z"
  },
  {
    "brand_name": "Fusiwal Cream",
    "generic_name": "Fusidic ACID",
    "manufacturer": "Wallace",
    "form": "cream",
    "route": "topical",
    "strength": "2%",
    "reorder_level": 50,
    "id": "d_cpbhvjz6b",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-09T11:11:50.469Z"
  },
  {
    "brand_name": "Analep Cream",
    "generic_name": "Methyl salicylate Compound cream",
    "manufacturer": "Panacea medical",
    "form": "cream",
    "route": "topical",
    "strength": "30g",
    "reorder_level": 50,
    "id": "d_856ucke3u",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T04:14:10.257Z"
  },
  {
    "brand_name": "corsodyl mint mouth wash",
    "generic_name": "chlohexidine digluconate",
    "manufacturer": "Heleon lanka",
    "form": "other",
    "route": "oral",
    "strength": "0.2%",
    "reorder_level": 50,
    "id": "d_96ym8p11n",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T04:54:31.535Z"
  },
  {
    "brand_name": "Clotrimazole powder SPC",
    "generic_name": "Clotrimazole",
    "manufacturer": "SPC",
    "form": "other",
    "route": "topical",
    "strength": "30g",
    "reorder_level": 50,
    "id": "d_tfvrl9qjn",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T04:56:49.227Z"
  },
  {
    "brand_name": "Aqueous cream B.P.",
    "generic_name": "Aqueous cream B.P.",
    "manufacturer": "FALCON PHARMACEUTICALS",
    "form": "cream",
    "route": "topical",
    "strength": "100g",
    "reorder_level": 50,
    "id": "d_8o8pydfp9",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T04:59:05.925Z"
  },
  {
    "brand_name": "VIVION",
    "generic_name": "Diclofenac gel",
    "manufacturer": "SPC",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_e4cndnxfo",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T04:59:50.876Z"
  },
  {
    "brand_name": "UNIREN Spray",
    "generic_name": "Diclofenac Na spray",
    "manufacturer": "UNISON LABORATORIES",
    "form": "other",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_nf5hrcdqx",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T05:08:57.314Z"
  },
  {
    "brand_name": "Adiflam gel",
    "generic_name": "Diclofenac gel BP",
    "manufacturer": "Leben",
    "form": "cream",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_ulo12yaqb",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T05:10:44.524Z"
  },
  {
    "brand_name": "TOLNAFTATE TOPICAL SOLUTION BECLO",
    "generic_name": "TOLNAFTATE TOPICAL SOLUTION",
    "manufacturer": "BECLO PHARMA",
    "form": "other",
    "route": "topical",
    "strength": "1%",
    "reorder_level": 50,
    "id": "d_5v0n8u8oh",
    "total_stock": 0,
    "unit_price": 0,
    "selling_price": 0,
    "created_at": "2026-07-10T05:12:48.962Z"
  }
];

const INITIAL_LAB_TESTS = [
  { id: 't1', test_name: 'Fasting Blood Sugar (FBS)', reference_range: '70 - 100', unit: 'mg/dL', cost: 250.00 },
  { id: 't2', test_name: 'Random Blood Sugar (RBS)', reference_range: 'Below 140', unit: 'mg/dL', cost: 200.00 },
  { id: 't3', test_name: 'HbA1c', reference_range: 'Below 5.7', unit: '%', cost: 1200.00 },
  { id: 't4', test_name: 'Full Blood Count (FBC)', reference_range: 'Multiple Parameters', unit: 'cells/uL', cost: 450.00 },
  { id: 't5', test_name: 'Lipid Profile', reference_range: 'Multiple Parameters', unit: 'mg/dL', cost: 1500.00 },
  { id: 't6', test_name: 'Serum Creatinine', reference_range: '0.6 - 1.2', unit: 'mg/dL', cost: 400.00 },
  { id: 't7', test_name: 'Urine Full Report (UFR)', reference_range: 'Normal', unit: 'N/A', cost: 350.00 }
];

const INITIAL_PATIENTS = [
  { 
    id: 'SM100001', 
    prefix: 'Mr.', 
    full_name: 'Sunil Perera', 
    date_of_birth: '1978-05-12', 
    gender: 'male', 
    phone: '0771234567', 
    phone_owner_name: 'Self',
    address: '123, Galle Road, Colombo 03', 
    occupation: 'Teacher',
    allergies: ['Penicillin'], 
    past_medical_history: ['Hypertension', 'Diabetes'], 
    past_surgical_history: ['Appendectomy'],
    comments: 'Patient prefers evening visits.',
    photo_url: '',
    created_at: new Date().toISOString() 
  },
  { 
    id: 'SM100002', 
    prefix: 'Mrs.', 
    full_name: 'Anula Jayasinghe', 
    date_of_birth: '1985-09-24', 
    gender: 'female', 
    phone: '0719876543', 
    phone_owner_name: 'Husband',
    address: '45, Kandy Road, Kadawatha', 
    occupation: 'Housewife',
    allergies: [], 
    past_medical_history: ['Asthma'], 
    past_surgical_history: [],
    comments: 'Allergic to dust as well.',
    photo_url: '',
    created_at: new Date().toISOString() 
  }
];

const INITIAL_VISITS = [
  { id: 'v1', patient_id: 'SM100001', visit_date: new Date().toISOString().split('T')[0], queue_number: 1, doctor_id: 'doc1', status: 'waiting', systolic_bp: 130, diastolic_bp: 85, temperature: 36.8, weight_kg: 74.5, chief_complaint: 'Mild chest discomfort and headache.', created_at: new Date().toISOString() }
];

const INITIAL_APPOINTMENTS = [
  { id: 'a1', patient_id: 'SM100002', doctor_id: 'doc1', appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], queue_number: 5, status: 'scheduled', booked_by: 'phone', created_at: new Date().toISOString() }
];

const INITIAL_USERS = [
  { id: 'u1', username: 'admin', full_name: 'Dr. A.P.K Sanjeeva', role: 'manager', password: 'admin', created_at: new Date().toISOString() },
  { id: 'u2', username: 'doctor', full_name: 'Dr. Sunil Perera', role: 'doctor', password: 'doctor', created_at: new Date().toISOString() },
  { id: 'u3', username: 'pharmacist', full_name: 'Pharmacist Nimali', role: 'pharmacist', password: 'pharmacist', is_chief: false, created_at: new Date().toISOString() },
  { id: 'u4', username: 'mlt', full_name: 'MLT Kamalanath', role: 'mlt', password: 'mlt', created_at: new Date().toISOString() },
  { id: 'u5', username: 'assistant', full_name: 'Assistant Ruwan', role: 'assistant', password: 'assistant', created_at: new Date().toISOString() },
  { id: 'u6', username: 'chief', full_name: 'Chief Pharmacist Kamal', role: 'pharmacist', password: 'chief', is_chief: true, created_at: new Date().toISOString() }
];

// Helper to check if we are in demo mode
const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isDemo') === 'true';
};

const getActiveLocationId = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('activeLocation') || 'main';
  }
  return 'main';
};

// Initialize Storage if empty
const initDemoDb = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mycliniq_specialists')) localStorage.setItem('mycliniq_specialists', JSON.stringify(INITIAL_SPECIALISTS));
  if (!localStorage.getItem('mycliniq_patients')) localStorage.setItem('mycliniq_patients', JSON.stringify(INITIAL_PATIENTS));
  const existingDrugs = localStorage.getItem('mycliniq_drugs');
  if (!existingDrugs || JSON.parse(existingDrugs).length < 200) {
    localStorage.setItem('mycliniq_drugs', JSON.stringify(INITIAL_DRUGS));
  }
  if (!localStorage.getItem('mycliniq_lab_tests')) localStorage.setItem('mycliniq_lab_tests', JSON.stringify(INITIAL_LAB_TESTS));
  if (!localStorage.getItem('mycliniq_visits')) localStorage.setItem('mycliniq_visits', JSON.stringify(INITIAL_VISITS));
  if (!localStorage.getItem('mycliniq_appointments')) localStorage.setItem('mycliniq_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
  if (!localStorage.getItem('mycliniq_users')) {
    localStorage.setItem('mycliniq_users', JSON.stringify(INITIAL_USERS));
  } else {
    // Make sure 'mycliniq_users' contains chief user and is_chief property
    const users = JSON.parse(localStorage.getItem('mycliniq_users'));
    let changed = false;
    const pharmacistIdx = users.findIndex(u => u.username === 'pharmacist');
    if (pharmacistIdx !== -1 && users[pharmacistIdx].is_chief === undefined) {
      users[pharmacistIdx].is_chief = false;
      changed = true;
    }
    if (!users.some(u => u.username === 'chief')) {
      users.push({ id: 'u6', username: 'chief', full_name: 'Chief Pharmacist Kamal', role: 'pharmacist', password: 'chief', is_chief: true, created_at: new Date().toISOString() });
      changed = true;
    }
    if (changed) {
      localStorage.setItem('mycliniq_users', JSON.stringify(users));
    }
  }
  if (!localStorage.getItem('mycliniq_prescriptions')) localStorage.setItem('mycliniq_prescriptions', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_prescription_items')) localStorage.setItem('mycliniq_prescription_items', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_lab_requests')) localStorage.setItem('mycliniq_lab_requests', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_consultations')) localStorage.setItem('mycliniq_consultations', JSON.stringify([]));
  
  const existingBatchesStr = localStorage.getItem('mycliniq_stock_batches');
  if (!existingBatchesStr || JSON.parse(existingBatchesStr).length <= 3) {
    const batches = [
      { id: 'b1', drug_id: 'd1', batch_number: 'PAN-2026', expiry_date: '2027-12-31', quantity_received: 1500, quantity_remaining: 1200, purchase_price: 1.50, selling_price: 2.50, bonus_quantity: 0 },
      { id: 'b2', drug_id: 'd2', batch_number: 'ALE-004', expiry_date: '2026-11-30', quantity_received: 500, quantity_remaining: 450, purchase_price: 2.00, selling_price: 4.00, bonus_quantity: 0 },
      { id: 'b3', drug_id: 'd7', batch_number: 'ZAA-19', expiry_date: '2027-05-15', quantity_received: 1000, quantity_remaining: 600, purchase_price: 8.00, selling_price: 12.00, bonus_quantity: 0 },
      { id: 'b4', drug_id: 'd3', batch_number: 'AMX-250', expiry_date: '2027-08-31', quantity_received: 500, quantity_remaining: 300, purchase_price: 3.50, selling_price: 5.00, bonus_quantity: 0 },
      { id: 'b5', drug_id: 'd4', batch_number: 'AMX-500', expiry_date: '2027-08-31', quantity_received: 300, quantity_remaining: 200, purchase_price: 5.00, selling_price: 8.00, bonus_quantity: 0 },
      { id: 'b6', drug_id: 'd5', batch_number: 'LIP-010', expiry_date: '2027-10-31', quantity_received: 200, quantity_remaining: 150, purchase_price: 8.00, selling_price: 12.00, bonus_quantity: 0 },
      { id: 'b7', drug_id: 'd6', batch_number: 'GLU-500', expiry_date: '2027-12-31', quantity_received: 1000, quantity_remaining: 800, purchase_price: 1.50, selling_price: 5.00, bonus_quantity: 0 }
    ];
    localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
  }

  // Initialize new tables
  if (!localStorage.getItem('mycliniq_locations')) {
    localStorage.setItem('mycliniq_locations', JSON.stringify([
      { id: 'main', name: 'Main Pharmacy', is_main: true },
      { id: 'branch_1', name: 'Affiliated Branch Pharmacy A', is_main: false }
    ]));
  }
  if (!localStorage.getItem('mycliniq_suppliers')) {
    localStorage.setItem('mycliniq_suppliers', JSON.stringify([
      { id: 's1', name: 'Astron Limited', phone: '0112345678', address: 'Colombo' },
      { id: 's2', name: 'Galle Wholesalers', phone: '0912234567', address: 'Galle' }
    ]));
  }
  if (!localStorage.getItem('mycliniq_supplier_bills')) {
    localStorage.setItem('mycliniq_supplier_bills', JSON.stringify([
      { id: 'sb1', supplier_id: 's1', bill_number: 'AST-9901', total_amount: 15000.00, amount_paid: 5000.00, payment_status: 'partially_paid', created_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem('mycliniq_supplier_payments')) {
    localStorage.setItem('mycliniq_supplier_payments', JSON.stringify([
      { id: 'sp1', bill_id: 'sb1', payment_date: new Date().toISOString().split('T')[0], amount: 5000.00, payment_mode: 'cash', remarks: 'Advance payment' }
    ]));
  }
  if (!localStorage.getItem('mycliniq_stock_transfers')) {
    localStorage.setItem('mycliniq_stock_transfers', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_stock_transfer_items')) {
    localStorage.setItem('mycliniq_stock_transfer_items', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_location_stock')) {
    const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];
    const locStocks = batches.map((b, idx) => ({
      id: 'ls_' + idx,
      location_id: 'main',
      drug_id: b.drug_id,
      batch_id: b.id,
      quantity: b.quantity_remaining
    }));
    localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
  }
  if (!localStorage.getItem('mycliniq_cash_sessions')) {
    localStorage.setItem('mycliniq_cash_sessions', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_cash_transactions')) {
    localStorage.setItem('mycliniq_cash_transactions', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_lab_weekly_balances')) {
    localStorage.setItem('mycliniq_lab_weekly_balances', JSON.stringify([]));
  }
};

// Database API helper
export const db = {
  // Patients API
  getPatients: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_patients'));
    }
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addPatient: async (patient) => {
    if (isDemoMode()) {
      initDemoDb();
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
      
      // Auto-generate Patient ID like SM100001
      const ids = patients
        .map(p => p.id)
        .filter(id => id && (id.startsWith('SM-') || id.startsWith('SM') || id.startsWith('sm') || id.startsWith('sm-')))
        .map(id => {
          const numPart = id.replace('SM-', '').replace('SM', '').replace('sm-', '').replace('sm', '');
          return parseInt(numPart, 10);
        })
        .filter(num => !isNaN(num));
      const maxId = ids.length > 0 ? Math.max(...ids) : 100000;
      const nextId = maxId + 1;
      const newId = 'SM' + nextId;

      const newPatient = { 
        ...patient, 
        id: newId, 
        created_at: new Date().toISOString() 
      };
      patients.push(newPatient);
      localStorage.setItem('mycliniq_patients', JSON.stringify(patients));
      return newPatient;
    }
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) throw error;
    return data;
  },

  updatePatient: async (patientId, updates) => {
    if (isDemoMode()) {
      initDemoDb();
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
      const idx = patients.findIndex(p => p.id === patientId);
      if (idx !== -1) {
        patients[idx] = { ...patients[idx], ...updates };
        localStorage.setItem('mycliniq_patients', JSON.stringify(patients));
        return patients[idx];
      }
      throw new Error('Patient not found.');
    }
    const { data, error } = await supabase.from('patients').update(updates).eq('id', patientId).select().single();
    if (error) throw error;
    return data;
  },

  // Appointments API
  getAppointments: async (date) => {
    if (isDemoMode()) {
      initDemoDb();
      const appointments = JSON.parse(localStorage.getItem('mycliniq_appointments'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      let filtered = appointments;
      if (date) {
        filtered = appointments.filter(a => a.appointment_date === date);
      }
      return filtered.map(a => ({
        ...a,
        patient: patients.find(p => p.id === a.patient_id)
      }));
    }
    let query = supabase.from('appointments').select('*, patient:patients(*)');
    if (date) query = query.eq('appointment_date', date);
    const { data, error } = await query.order('queue_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  addAppointment: async (appointment) => {
    if (isDemoMode()) {
      initDemoDb();
      const appointments = JSON.parse(localStorage.getItem('mycliniq_appointments'));
      const newAppointment = { ...appointment, id: 'a_' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
      appointments.push(newAppointment);
      localStorage.setItem('mycliniq_appointments', JSON.stringify(appointments));
      return newAppointment;
    }
    const { data, error } = await supabase.from('appointments').insert(appointment).select().single();
    if (error) throw error;
    return data;
  },

  // Visits API
  getVisits: async (date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const filtered = visits.filter(v => v.visit_date === targetDate);
      return filtered.map(v => ({
        ...v,
        patient: patients.find(p => p.id === v.patient_id)
      }));
    }
    const { data, error } = await supabase
      .from('visits')
      .select('*, patient:patients(*)')
      .eq('visit_date', targetDate)
      .order('queue_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  addVisit: async (visit) => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const newVisit = { 
        ...visit, 
        id: 'v_' + Math.random().toString(36).substr(2, 9), 
        visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
        visit_type: visit.visit_type || 'opd',
        payment_status: visit.payment_status || 'pending',
        doctor_fee: visit.doctor_fee !== undefined ? visit.doctor_fee : (visit.visit_type === 'channeling' ? 0 : 500.00),
        center_fee: visit.center_fee || 0,
        bill_amount: visit.bill_amount || 0,
        created_at: new Date().toISOString() 
      };
      visits.push(newVisit);
      localStorage.setItem('mycliniq_visits', JSON.stringify(visits));
      return newVisit;
    }
    const { data, error } = await supabase.from('visits').insert(visit).select().single();
    if (error) throw error;
    return data;
  },

  updateVisitStatus: async (visitId, status) => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const idx = visits.findIndex(v => v.id === visitId);
      if (idx !== -1) {
        visits[idx].status = status;
        localStorage.setItem('mycliniq_visits', JSON.stringify(visits));
      }
      return visits[idx];
    }
    const { data, error } = await supabase.from('visits').update({ status }).eq('id', visitId).select().single();
    if (error) throw error;
    return data;
  },

  // Specialists List
  getSpecialists: async () => {
    if (isDemoMode() || !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-')) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_specialists')) || INITIAL_SPECIALISTS;
    }
    try {
      const { data, error } = await supabase.from('specialists').select('*').order('name', { ascending: true });
      if (error) {
        return INITIAL_SPECIALISTS;
      }
      return data;
    } catch (e) {
      return INITIAL_SPECIALISTS;
    }
  },

  // Pending Payments Queue
  getPendingBills: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits')) || [];
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions')) || [];
      const prescriptionItems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      const labRequests = JSON.parse(localStorage.getItem('mycliniq_lab_requests')) || [];
      const labTests = JSON.parse(localStorage.getItem('mycliniq_lab_tests')) || [];

      // Filter visits:
      // payment_status should be 'pending' (default to pending if not present).
      // OPD visits must be 'completed' (consulted) to be billed.
      // Lab and channeling visits are billed immediately upon check-in.
      const pendingVisits = visits.filter(v => {
        const payStatus = v.payment_status || 'pending';
        if (payStatus !== 'pending') return false;
        
        const type = v.visit_type || 'opd';
        if (type === 'opd') {
          return v.status === 'completed';
        }
        return true;
      });

      return pendingVisits.map(v => {
        const patient = patients.find(p => p.id === v.patient_id);
        
        // Find prescription for this visit
        const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations')) || [];
        const consultation = consultations.find(c => c.visit_id === v.id);
        
        let prescription = null;
        if (consultation) {
          const rx = prescriptions.find(p => p.consultation_id === consultation.id);
          if (rx) {
            const items = prescriptionItems.filter(item => item.prescription_id === rx.id).map(item => ({
              ...item,
              drug: drugs.find(d => d.id === item.drug_id)
            }));
            prescription = { ...rx, items };
          }
        }

        // Find lab requests for this visit
        const vLabRequests = labRequests.filter(lr => lr.visit_id === v.id).map(lr => ({
          ...lr,
          test: labTests.find(t => t.id === lr.test_id)
        }));

        return {
          ...v,
          visit_type: v.visit_type || 'opd',
          payment_status: v.payment_status || 'pending',
          doctor_fee: v.doctor_fee !== undefined ? v.doctor_fee : (v.visit_type === 'opd' ? 500.00 : 0),
          center_fee: v.center_fee || 0,
          patient,
          prescription,
          lab_requests: vLabRequests
        };
      });
    }

    try {
      const { data: visits, error } = await supabase
        .from('visits')
        .select(`
          *,
          patient:patients(*),
          consultations(
            id,
            prescriptions(
              *,
              items:prescription_items(
                *,
                drug:drugs(*)
              )
            )
          ),
          lab_requests(
            *,
            test:lab_tests(*)
          )
        `)
        .eq('payment_status', 'pending');
        
      if (error) throw error;
      
      const filtered = visits.filter(v => {
        const type = v.visit_type || 'opd';
        if (type === 'opd') {
          return v.status === 'completed';
        }
        return true;
      });

      return filtered.map(v => {
        let prescription = null;
        if (v.consultations && v.consultations.length > 0) {
          const consultation = v.consultations[0];
          if (consultation.prescriptions && consultation.prescriptions.length > 0) {
            prescription = consultation.prescriptions[0];
          }
        }
        return {
          ...v,
          visit_type: v.visit_type || 'opd',
          payment_status: v.payment_status || 'pending',
          prescription,
          lab_requests: v.lab_requests || []
        };
      });
    } catch (err) {
      console.error("Error in getPendingBills:", err);
      return [];
    }
  },

  collectPayment: async (visitId, paymentDetails) => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits')) || [];
      const idx = visits.findIndex(v => v.id === visitId);
      if (idx === -1) throw new Error('Visit not found');

      const visit = visits[idx];
      visit.payment_status = 'paid';
      visit.bill_amount = paymentDetails.bill_amount;
      visit.discount = paymentDetails.discount || 0;
      visit.payment_received = paymentDetails.payment_received || 0;
      visit.change_due = paymentDetails.change_due || 0;

      localStorage.setItem('mycliniq_visits', JSON.stringify(visits));

      // Update Active Cash Session (only if NOT direct lab payment)
      if (!paymentDetails.collected_at_lab) {
        const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
        const activeSession = sessions.find(s => s.status === 'open');
        if (activeSession) {
          activeSession.cash_sales = (parseFloat(activeSession.cash_sales) || 0) + parseFloat(paymentDetails.bill_amount);
          localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));

          // Get patient name
          const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
          const patient = patients.find(p => p.id === visit.patient_id);
          const pName = patient ? patient.full_name : (visit.patient_name || 'Patient');

          // Add cash transaction
          const txs = JSON.parse(localStorage.getItem('mycliniq_cash_transactions')) || [];
          txs.push({
            id: 'tx_' + Math.random().toString(36).substr(2, 9),
            session_id: activeSession.id,
            transaction_type: 'income',
            amount: parseFloat(paymentDetails.bill_amount),
            description: `Patient Payment (${visit.visit_type?.toUpperCase() || 'OPD'}) - ${pName}`,
            reference_id: visitId,
            created_by: paymentDetails.collected_by || 'pharmacist',
            created_at: new Date().toISOString()
          });
          localStorage.setItem('mycliniq_cash_transactions', JSON.stringify(txs));
        }
      }

      // Find prescription to dispense
      const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations')) || [];
      const consultation = consultations.find(c => c.visit_id === visitId);
      
      if (consultation) {
        const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions')) || [];
        const rx = prescriptions.find(p => p.consultation_id === consultation.id && p.status === 'pending');
        if (rx) {
          const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
          const rxItems = pitems.filter(item => item.prescription_id === rx.id);

          const itemsToDispense = rxItems.map(item => ({
            item_id: item.id,
            drug_id: item.drug_id,
            quantity: item.total_quantity
          }));

          const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
          const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];

          itemsToDispense.forEach(dispItem => {
            const itemIdx = pitems.findIndex(pi => pi.id === dispItem.item_id);
            if (itemIdx !== -1) {
              pitems[itemIdx].dispensed_quantity = dispItem.quantity;
            }

            let qtyToDeduct = dispItem.quantity;
            const drugBatches = batches.filter(b => b.drug_id === dispItem.drug_id).sort((a,b) => new Date(a.expiry_date) - new Date(b.expiry_date));
            
            for (let batch of drugBatches) {
              if (qtyToDeduct <= 0) break;
              const available = batch.quantity_remaining;
              if (available > 0) {
                const deduct = Math.min(qtyToDeduct, available);
                batch.quantity_remaining -= deduct;
                qtyToDeduct -= deduct;
              }
            }

            const drugIdx = drugs.findIndex(d => d.id === dispItem.drug_id);
            if (drugIdx !== -1) {
              const remaining = batches.filter(b => b.drug_id === dispItem.drug_id).reduce((sum, b) => sum + b.quantity_remaining, 0);
              drugs[drugIdx].total_stock = remaining;
            }
          });

          rx.status = 'dispensed';

          localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
          localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
          localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
          localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
        }
      }
      return visit;
    }

    try {
      // 1. Update visit
      const { data: visitData, error: visitErr } = await supabase
        .from('visits')
        .update({
          payment_status: 'paid',
          bill_amount: paymentDetails.bill_amount,
          discount: paymentDetails.discount || 0,
          payment_received: paymentDetails.payment_received || 0,
          change_due: paymentDetails.change_due || 0
        })
        .eq('id', visitId)
        .select()
        .single();
        
      if (visitErr) throw visitErr;

      // Update Active Cash Session in Supabase (only if NOT direct lab payment)
      if (!paymentDetails.collected_at_lab) {
        const { data: activeSession } = await supabase
          .from('cash_sessions')
          .select('*')
          .eq('status', 'open')
          .maybeSingle();

        if (activeSession) {
          await supabase
            .from('cash_sessions')
            .update({ cash_sales: (parseFloat(activeSession.cash_sales) || 0) + parseFloat(paymentDetails.bill_amount) })
            .eq('id', activeSession.id);

          await supabase.from('cash_transactions').insert({
            session_id: activeSession.id,
            transaction_type: 'income',
            amount: parseFloat(paymentDetails.bill_amount),
            description: `Patient Payment (${visitData.visit_type?.toUpperCase() || 'OPD'})`,
            reference_id: visitId,
            created_by: paymentDetails.collected_by || 'pharmacist'
          });
        }
      }

      // 2. Dispense prescription if any
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id')
        .eq('visit_id', visitId)
        .maybeSingle();

      if (consultation) {
        const { data: rx } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('consultation_id', consultation.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (rx) {
          const { data: rxItems } = await supabase
            .from('prescription_items')
            .select('*')
            .eq('prescription_id', rx.id);

          if (rxItems && rxItems.length > 0) {
            const itemsToDispense = rxItems.map(item => ({
              item_id: item.id,
              drug_id: item.drug_id,
              quantity: item.total_quantity
            }));
            
            await db.dispensePrescription(rx.id, itemsToDispense);
          }
        }
      }

      return visitData;
    } catch (err) {
      console.error("Error collecting payment:", err);
      throw err;
    }
  },
  addLabRequests: async (visitId, patientId, testIds, doctorId) => {
    if (isDemoMode()) {
      initDemoDb();
      const labRequests = JSON.parse(localStorage.getItem('mycliniq_lab_requests')) || [];
      testIds.forEach(testId => {
        labRequests.push({
          id: 'lr_' + Math.random().toString(36).substr(2, 9),
          visit_id: visitId,
          patient_id: patientId,
          test_id: testId,
          doctor_id: doctorId || 'doc1',
          status: 'requested',
          result_value: '',
          remarks: '',
          created_at: new Date().toISOString()
        });
      });
      localStorage.setItem('mycliniq_lab_requests', JSON.stringify(labRequests));
      return true;
    }
    const labRequestsToInsert = testIds.map(testId => ({
      visit_id: visitId,
      patient_id: patientId,
      test_id: testId,
      doctor_id: doctorId || null,
      status: 'requested'
    }));
    const { error } = await supabase.from('lab_requests').insert(labRequestsToInsert);
    if (error) throw error;
    return true;
  },

  // Clinical Consultation & Prescriptions
  addConsultation: async (consultation, prescriptionItems, labTests) => {
    if (isDemoMode()) {
      initDemoDb();
      const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations'));
      const cid = 'c_' + Math.random().toString(36).substr(2, 9);
      
      // Separate doctor_fee from consultation since it is saved to visits table
      const { doctor_fee, ...consProps } = consultation;
      
      const newConsultation = { ...consProps, id: cid, created_at: new Date().toISOString() };
      consultations.push(newConsultation);
      localStorage.setItem('mycliniq_consultations', JSON.stringify(consultations));

      // Update visit status and doctor fee
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const vidx = visits.findIndex(v => v.id === consultation.visit_id);
      if (vidx !== -1) {
        visits[vidx].status = 'completed';
        if (doctor_fee !== undefined) {
          visits[vidx].doctor_fee = doctor_fee;
        }
      }
      localStorage.setItem('mycliniq_visits', JSON.stringify(visits));

      // Handle Prescriptions
      if (prescriptionItems && prescriptionItems.length > 0) {
        const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions'));
        const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items'));
        const pid = 'pr_' + Math.random().toString(36).substr(2, 9);
        
        prescriptions.push({
          id: pid,
          consultation_id: cid,
          patient_id: visits[vidx]?.patient_id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

        prescriptionItems.forEach(item => {
          pitems.push({
            ...item,
            id: 'pi_' + Math.random().toString(36).substr(2, 9),
            prescription_id: pid,
            dispensed_quantity: 0
          });
        });

        localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
        localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
      }

      // Handle Lab requests
      if (labTests && labTests.length > 0) {
        const labRequests = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
        labTests.forEach(testId => {
          labRequests.push({
            id: 'lr_' + Math.random().toString(36).substr(2, 9),
            visit_id: consultation.visit_id,
            patient_id: visits[vidx]?.patient_id,
            test_id: testId,
            doctor_id: consultation.doctor_id || 'doc1',
            status: 'requested',
            result_value: '',
            remarks: '',
            created_at: new Date().toISOString()
          });
        });
        localStorage.setItem('mycliniq_lab_requests', JSON.stringify(labRequests));
      }

      return newConsultation;
    }

    // Separate doctor_fee
    const { doctor_fee, ...consProps } = consultation;

    const { data: consData, error: consErr } = await supabase.from('consultations').insert(consProps).select().single();
    if (consErr) throw consErr;

    // Update visit status and doctor fee
    const updateObj = { status: 'completed' };
    if (doctor_fee !== undefined) {
      updateObj.doctor_fee = doctor_fee;
    }
    await supabase.from('visits').update(updateObj).eq('id', consultation.visit_id);

    // Insert prescription header
    if (prescriptionItems && prescriptionItems.length > 0) {
      const { data: visitData } = await supabase.from('visits').select('patient_id').eq('id', consultation.visit_id).single();
      
      const { data: rxData, error: rxErr } = await supabase.from('prescriptions').insert({
        consultation_id: consData.id,
        patient_id: visitData.patient_id,
        status: 'pending'
      }).select().single();

      if (!rxErr) {
        const itemsToInsert = prescriptionItems.map(item => ({
          prescription_id: rxData.id,
          drug_id: item.drug_id,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          total_quantity: item.total_quantity,
          instructions: item.instructions
        }));
        await supabase.from('prescription_items').insert(itemsToInsert);
      }
    }

    // Insert Lab requests
    if (labTests && labTests.length > 0) {
      const { data: visitData } = await supabase.from('visits').select('patient_id').eq('id', consultation.visit_id).single();
      const labRequestsToInsert = labTests.map(testId => ({
        visit_id: consultation.visit_id,
        patient_id: visitData.patient_id,
        test_id: testId,
        doctor_id: consultation.doctor_id,
        status: 'requested'
      }));
      await supabase.from('lab_requests').insert(labRequestsToInsert);
    }

    return consData;
  },

  // Pharmacy API
  getPrescriptions: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items'));
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));

      // Filter only pending prescriptions for ease of workflow
      return prescriptions.filter(p => p.status === 'pending').map(p => {
        const patient = patients.find(pat => pat.id === p.patient_id);
        const items = pitems.filter(item => item.prescription_id === p.id).map(item => ({
          ...item,
          drug: drugs.find(d => d.id === item.drug_id)
        }));
        return { ...p, patient, items };
      });
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*, patient:patients(*), items:prescription_items(*, drug:drugs(*))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  dispensePrescription: async (prescriptionId, dispensedItems) => {
    // dispensedItems = [{ item_id, drug_id, quantity }]
    if (isDemoMode()) {
      initDemoDb();
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions'));
      const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items'));
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches'));
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
      const activeLocId = getActiveLocationId();

      // Update prescription items
      dispensedItems.forEach(dispItem => {
        const itemIdx = pitems.findIndex(pi => pi.id === dispItem.item_id);
        if (itemIdx !== -1) {
          pitems[itemIdx].dispensed_quantity = dispItem.quantity;
        }

        // Deduct from location stock
        let qtyToDeduct = dispItem.quantity;
        const drugLocBatches = locStocks
          .filter(ls => ls.location_id === activeLocId && ls.drug_id === dispItem.drug_id && ls.quantity > 0)
          .map(ls => {
            const batch = batches.find(b => b.id === ls.batch_id);
            return { ls, batch };
          })
          .filter(item => item.batch !== undefined)
          .sort((a, b) => new Date(a.batch.expiry_date) - new Date(b.batch.expiry_date));

        for (let item of drugLocBatches) {
          if (qtyToDeduct <= 0) break;
          const available = item.ls.quantity;
          const deduct = Math.min(qtyToDeduct, available);
          
          item.ls.quantity -= deduct;
          
          // Deduct from batch total
          const batchIdx = batches.findIndex(b => b.id === item.batch.id);
          if (batchIdx !== -1) {
            batches[batchIdx].quantity_remaining -= deduct;
          }
          
          qtyToDeduct -= deduct;
        }

        // Recompute drug total stock
        const drugIdx = drugs.findIndex(d => d.id === dispItem.drug_id);
        if (drugIdx !== -1) {
          const remaining = batches.filter(b => b.drug_id === dispItem.drug_id).reduce((sum, b) => sum + b.quantity_remaining, 0);
          drugs[drugIdx].total_stock = remaining;
        }
      });

      // Update prescription status
      const rxIdx = prescriptions.findIndex(p => p.id === prescriptionId);
      if (rxIdx !== -1) {
        prescriptions[rxIdx].status = 'dispensed';
      }

      localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
      localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return true;
    }

    // Supabase operations
    const activeLocId = getActiveLocationId();
    for (let dispItem of dispensedItems) {
      // Update item dispensed qty
      await supabase.from('prescription_items').update({ dispensed_quantity: dispItem.quantity }).eq('id', dispItem.item_id);

      // Decrement location stock & batch inventory
      const { data: activeLocStocks } = await supabase
        .from('location_stock')
        .select('*, stock_batches!inner(expiry_date)')
        .eq('location_id', activeLocId)
        .eq('drug_id', dispItem.drug_id)
        .gt('quantity', 0)
        .order('stock_batches(expiry_date)', { ascending: true });

      let qtyLeft = dispItem.quantity;
      if (activeLocStocks) {
        for (let locStockItem of activeLocStocks) {
          if (qtyLeft <= 0) break;
          const deduct = Math.min(qtyLeft, locStockItem.quantity);
          
          // Update location stock
          await supabase
            .from('location_stock')
            .update({ quantity: locStockItem.quantity - deduct })
            .eq('id', locStockItem.id);

          // Update batch stock
          const { data: batch } = await supabase
            .from('stock_batches')
            .select('quantity_remaining')
            .eq('id', locStockItem.batch_id)
            .single();
          if (batch) {
            await supabase
              .from('stock_batches')
              .update({ quantity_remaining: Math.max(0, batch.quantity_remaining - deduct) })
              .eq('id', locStockItem.batch_id);
          }
          
          // Log Transaction
          await supabase.from('inventory_transactions').insert({
            drug_id: dispItem.drug_id,
            batch_id: locStockItem.batch_id,
            transaction_type: 'dispense',
            quantity: -deduct
          });

          qtyLeft -= deduct;
        }
      }
    }

    // Set prescription status to completed
    await supabase.from('prescriptions').update({ status: 'dispensed' }).eq('id', prescriptionId);
    return true;
  },

  dispenseDirectPrescription: async (patientName, patientId, items) => {
    // items = [{ drug_id, dosage, frequency, duration, quantity, instructions }]
    if (isDemoMode()) {
      initDemoDb();
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions')) || [];
      const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
      const activeLocId = getActiveLocationId();

      // Create a dummy patient if not selected
      let finalPatientId = patientId;
      if (!finalPatientId) {
        finalPatientId = 'SM_WALKIN';
      }

      const rxId = 'rx_' + Math.random().toString(36).substr(2, 9);
      const newRx = {
        id: rxId,
        patient_id: finalPatientId,
        patient_name: patientName || 'Walk-in Patient',
        status: 'dispensed',
        created_at: new Date().toISOString()
      };
      prescriptions.push(newRx);

      items.forEach(item => {
        const itemId = 'pi_' + Math.random().toString(36).substr(2, 9);
        pitems.push({
          id: itemId,
          prescription_id: rxId,
          drug_id: item.drug_id,
          dosage: item.dosage || '1 tab',
          frequency: item.frequency || 'OD',
          duration: item.duration || '5 days',
          total_quantity: item.quantity,
          dispensed_quantity: item.quantity,
          instructions: item.instructions || ''
        });

        // Deduct from location stock
        let qtyToDeduct = item.quantity;
        const drugLocBatches = locStocks
          .filter(ls => ls.location_id === activeLocId && ls.drug_id === item.drug_id && ls.quantity > 0)
          .map(ls => {
            const batch = batches.find(b => b.id === ls.batch_id);
            return { ls, batch };
          })
          .filter(x => x.batch !== undefined)
          .sort((a, b) => new Date(a.batch.expiry_date) - new Date(b.batch.expiry_date));

        for (let pair of drugLocBatches) {
          if (qtyToDeduct <= 0) break;
          const available = pair.ls.quantity;
          const deduct = Math.min(qtyToDeduct, available);
          
          pair.ls.quantity -= deduct;
          
          const batchIdx = batches.findIndex(b => b.id === pair.batch.id);
          if (batchIdx !== -1) {
            batches[batchIdx].quantity_remaining -= deduct;
          }
          
          qtyToDeduct -= deduct;
        }

        // Recompute drug total stock
        const drugIdx = drugs.findIndex(d => d.id === item.drug_id);
        if (drugIdx !== -1) {
          const remaining = batches.filter(b => b.drug_id === item.drug_id).reduce((sum, b) => sum + b.quantity_remaining, 0);
          drugs[drugIdx].total_stock = remaining;
        }
      });

      localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
      localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return { id: rxId, patient_name: patientName, items };
    }

    // Supabase mode
    let finalPatientId = patientId;
    if (!finalPatientId) {
      const { data: walkinPat } = await supabase.from('patients').select('id').eq('full_name', 'Walk-in Patient').limit(1);
      if (walkinPat && walkinPat.length > 0) {
        finalPatientId = walkinPat[0].id;
      } else {
        const { data: newPat } = await supabase.from('patients').insert({
          id: 'SM999999',
          full_name: 'Walk-in Patient',
          gender: 'other',
          phone: '0000000000',
          address: 'Walk-in'
        }).select().single();
        finalPatientId = newPat.id;
      }
    }

    const { data: rxData, error: rxErr } = await supabase.from('prescriptions').insert({
      patient_id: finalPatientId,
      status: 'dispensed',
      notes: `Walk-in Dispense for: ${patientName}`
    }).select().single();

    if (rxErr) throw rxErr;

    const activeLocId = getActiveLocationId();
    for (let item of items) {
      await supabase.from('prescription_items').insert({
        prescription_id: rxData.id,
        drug_id: item.drug_id,
        dosage: item.dosage || '1 tab',
        frequency: item.frequency || 'OD',
        duration: item.duration || '5 days',
        total_quantity: item.quantity,
        dispensed_quantity: item.quantity,
        instructions: item.instructions || ''
      });

      const { data: activeLocStocks } = await supabase
        .from('location_stock')
        .select('*, stock_batches!inner(expiry_date)')
        .eq('location_id', activeLocId)
        .eq('drug_id', item.drug_id)
        .gt('quantity', 0)
        .order('stock_batches(expiry_date)', { ascending: true });

      let qtyLeft = item.quantity;
      if (activeLocStocks) {
        for (let locStockItem of activeLocStocks) {
          if (qtyLeft <= 0) break;
          const deduct = Math.min(qtyLeft, locStockItem.quantity);
          
          await supabase
            .from('location_stock')
            .update({ quantity: locStockItem.quantity - deduct })
            .eq('id', locStockItem.id);

          const { data: batch } = await supabase
            .from('stock_batches')
            .select('quantity_remaining')
            .eq('id', locStockItem.batch_id)
            .single();
          if (batch) {
            await supabase
              .from('stock_batches')
              .update({ quantity_remaining: Math.max(0, batch.quantity_remaining - deduct) })
              .eq('id', locStockItem.batch_id);
          }
          
          await supabase.from('inventory_transactions').insert({
            drug_id: item.drug_id,
            batch_id: locStockItem.batch_id,
            transaction_type: 'dispense',
            quantity: -deduct
          });

          qtyLeft -= deduct;
        }
      }
    }

    return rxData;
  },

  // Inventory Catalog API
  getDrugs: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_drugs'));
    }
    const { data, error } = await supabase.from('drugs').select('*').order('brand_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  addDrugBatch: async (drugId, batchNumber, expiryDate, qty, cost, sellingPrice, bonusQty, locationId = 'main', billId = null) => {
    const parsedQty = parseInt(qty) || 0;
    const parsedBonusQty = parseInt(bonusQty) || 0;
    const totalQty = parsedQty + parsedBonusQty;
    const parsedCost = parseFloat(cost) || 0;
    const parsedSellingPrice = parseFloat(sellingPrice) || 0;

    if (isDemoMode()) {
      initDemoDb();
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches'));
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];

      const newBatch = {
        id: 'b_' + Math.random().toString(36).substr(2, 9),
        drug_id: drugId,
        batch_number: batchNumber,
        expiry_date: expiryDate,
        quantity_received: parsedQty,
        bonus_quantity: parsedBonusQty,
        quantity_remaining: totalQty,
        purchase_price: parsedCost,
        selling_price: parsedSellingPrice,
        bill_id: billId,
        created_at: new Date().toISOString()
      };

      batches.push(newBatch);
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));

      // Add to location stock
      const locIdx = locStocks.findIndex(ls => ls.location_id === locationId && ls.drug_id === drugId && ls.batch_id === newBatch.id);
      if (locIdx !== -1) {
        locStocks[locIdx].quantity += totalQty;
      } else {
        locStocks.push({
          id: 'ls_' + Math.random().toString(36).substr(2, 9),
          location_id: locationId,
          drug_id: drugId,
          batch_id: newBatch.id,
          quantity: totalQty
        });
      }
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));

      // Recalculate stock
      const drugIdx = drugs.findIndex(d => d.id === drugId);
      if (drugIdx !== -1) {
        drugs[drugIdx].total_stock = batches.filter(b => b.drug_id === drugId).reduce((sum, b) => sum + b.quantity_remaining, 0);
        drugs[drugIdx].unit_price = parsedCost;
        drugs[drugIdx].selling_price = parsedSellingPrice;
        localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      }
      return newBatch;
    }

    const insertObj = {
      drug_id: drugId,
      batch_number: batchNumber,
      expiry_date: expiryDate,
      quantity_received: parsedQty,
      quantity_remaining: totalQty,
      purchase_price: parsedCost,
      bill_id: billId
    };

    try {
      insertObj.selling_price = parsedSellingPrice;
      insertObj.bonus_quantity = parsedBonusQty;
    } catch(e) {}

    const { data: batchData, error } = await supabase.from('stock_batches').insert(insertObj).select().single();

    if (error) throw error;

    // Add to location_stock
    await supabase.from('location_stock').insert({
      location_id: locationId,
      drug_id: drugId,
      batch_id: batchData.id,
      quantity: totalQty
    });

    // Log transaction
    await supabase.from('inventory_transactions').insert({
      drug_id: drugId,
      batch_id: batchData.id,
      transaction_type: 'stock_in',
      quantity: totalQty
    });

    return batchData;
  },

  addDrug: async (drug) => {
    if (isDemoMode()) {
      initDemoDb();
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      const newDrug = {
        ...drug,
        id: 'd_' + Math.random().toString(36).substr(2, 9),
        total_stock: 0,
        reorder_level: parseInt(drug.reorder_level) || 50,
        unit_price: parseFloat(drug.unit_price) || 0,
        selling_price: parseFloat(drug.selling_price) || 0,
        created_at: new Date().toISOString()
      };
      drugs.push(newDrug);
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return newDrug;
    }

    const { data, error } = await supabase.from('drugs').insert({
      brand_name: drug.brand_name,
      generic_name: drug.generic_name,
      form: drug.form,
      route: drug.route || 'oral',
      manufacturer: drug.manufacturer || '',
      strength: drug.strength,
      reorder_level: parseInt(drug.reorder_level) || 50,
      unit_price: parseFloat(drug.unit_price) || 0,
      selling_price: parseFloat(drug.selling_price) || 0
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Lab Module API
  getLabRequests: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const requests = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const tests = JSON.parse(localStorage.getItem('mycliniq_lab_tests'));

      // Filter only requested/collected
      return requests.map(req => ({
        ...req,
        patient: patients.find(p => p.id === req.patient_id),
        test: tests.find(t => t.id === req.test_id)
      }));
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .select('*, patient:patients(*), test:lab_tests(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  updateLabResult: async (requestId, resultValue, remarks, mltId) => {
    if (isDemoMode()) {
      initDemoDb();
      const requests = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].result_value = resultValue;
        requests[idx].remarks = remarks;
        requests[idx].status = 'completed';
        requests[idx].mlt_id = mltId || 'mlt1';
        localStorage.setItem('mycliniq_lab_requests', JSON.stringify(requests));
      }
      return requests[idx];
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        result_value: resultValue,
        remarks: remarks,
        status: 'completed',
        mlt_id: mltId
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Lab Tests Catalog
  getLabTests: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_lab_tests'));
    }
    const { data, error } = await supabase.from('lab_tests').select('*').order('test_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  getBatches: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];
    }
    const { data, error } = await supabase.from('stock_batches').select('*').order('expiry_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  getUsers: async () => {
    if (isDemoMode() || !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-')) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_users')) || [];
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_users')) || [];
    }
  },

  addUser: async (user) => {
    if (isDemoMode()) {
      initDemoDb();
      const users = JSON.parse(localStorage.getItem('mycliniq_users')) || [];
      if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
        throw new Error('Username already exists.');
      }
      const newUser = { 
        ...user, 
        id: 'u_' + Math.random().toString(36).substr(2, 9), 
        created_at: new Date().toISOString() 
      };
      users.push(newUser);
      localStorage.setItem('mycliniq_users', JSON.stringify(users));
      return newUser;
    }
    const { data, error } = await supabase.from('profiles').insert(user).select().single();
    if (error) throw error;
    return data;
  },

  deleteUser: async (userId) => {
    if (isDemoMode()) {
      initDemoDb();
      const users = JSON.parse(localStorage.getItem('mycliniq_users')) || [];
      const filtered = users.filter(u => u.id !== userId);
      localStorage.setItem('mycliniq_users', JSON.stringify(filtered));
      return true;
    }
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return true;
  },

  updateUser: async (userId, updates) => {
    if (isDemoMode()) {
      initDemoDb();
      const users = JSON.parse(localStorage.getItem('mycliniq_users')) || [];
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem('mycliniq_users', JSON.stringify(users));
        return users[idx];
      }
      throw new Error('User not found.');
    }
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  getSuppliers: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_suppliers')) || [];
    }
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  addSupplier: async (supplier) => {
    if (isDemoMode()) {
      initDemoDb();
      const suppliers = JSON.parse(localStorage.getItem('mycliniq_suppliers')) || [];
      const newSupplier = {
        ...supplier,
        id: 's_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      suppliers.push(newSupplier);
      localStorage.setItem('mycliniq_suppliers', JSON.stringify(suppliers));
      return newSupplier;
    }
    const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
    if (error) throw error;
    return data;
  },

  getSupplierBills: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_supplier_bills')) || [];
    }
    const { data, error } = await supabase.from('supplier_bills').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addSupplierBill: async (bill) => {
    if (isDemoMode()) {
      initDemoDb();
      const bills = JSON.parse(localStorage.getItem('mycliniq_supplier_bills')) || [];
      const newBill = {
        ...bill,
        id: 'sb_' + Math.random().toString(36).substr(2, 9),
        amount_paid: 0.00,
        payment_status: bill.payment_status || 'credit',
        created_at: new Date().toISOString()
      };
      bills.push(newBill);
      localStorage.setItem('mycliniq_supplier_bills', JSON.stringify(bills));
      return newBill;
    }
    const { data, error } = await supabase.from('supplier_bills').insert(bill).select().single();
    if (error) throw error;
    return data;
  },

  getSupplierPayments: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_supplier_payments')) || [];
    }
    const { data, error } = await supabase.from('supplier_payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addSupplierPayment: async (payment) => {
    const amount = parseFloat(payment.amount) || 0;
    if (isDemoMode()) {
      initDemoDb();
      const payments = JSON.parse(localStorage.getItem('mycliniq_supplier_payments')) || [];
      const bills = JSON.parse(localStorage.getItem('mycliniq_supplier_bills')) || [];
      
      const newPayment = {
        ...payment,
        id: 'sp_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      payments.push(newPayment);
      localStorage.setItem('mycliniq_supplier_payments', JSON.stringify(payments));

      // Update bill
      const billIdx = bills.findIndex(b => b.id === payment.bill_id);
      if (billIdx !== -1) {
        bills[billIdx].amount_paid = (parseFloat(bills[billIdx].amount_paid) || 0) + amount;
        if (bills[billIdx].amount_paid >= bills[billIdx].total_amount) {
          bills[billIdx].payment_status = 'paid';
        } else if (bills[billIdx].amount_paid > 0) {
          bills[billIdx].payment_status = 'partially_paid';
        }
        localStorage.setItem('mycliniq_supplier_bills', JSON.stringify(bills));
      }
      return newPayment;
    }

    const { data, error } = await supabase.from('supplier_payments').insert(payment).select().single();
    if (error) throw error;

    // Fetch and update bill
    const { data: bill } = await supabase.from('supplier_bills').select('*').eq('id', payment.bill_id).single();
    if (bill) {
      const newPaid = (parseFloat(bill.amount_paid) || 0) + amount;
      let newStatus = 'credit';
      if (newPaid >= bill.total_amount) {
        newStatus = 'paid';
      } else if (newPaid > 0) {
        newStatus = 'partially_paid';
      }
      await supabase.from('supplier_bills').update({ amount_paid: newPaid, payment_status: newStatus }).eq('id', payment.bill_id);
    }

    return data;
  },

  getLocations: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_locations')) || [];
    }
    const { data, error } = await supabase.from('locations').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  getLocationStock: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
    }
    const { data, error } = await supabase.from('location_stock').select('*');
    if (error) throw error;
    return data;
  },

  getStockTransfers: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const transfers = JSON.parse(localStorage.getItem('mycliniq_stock_transfers')) || [];
      const items = JSON.parse(localStorage.getItem('mycliniq_stock_transfer_items')) || [];
      return transfers.map(t => ({
        ...t,
        items: items.filter(i => i.transfer_id === t.id)
      }));
    }
    const { data, error } = await supabase
      .from('stock_transfers')
      .select('*, items:stock_transfer_items(*)')
      .order('transfer_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  transferStock: async (fromLocationId, toLocationId, items) => {
    // items = [{ drug_id, batch_id, quantity }]
    if (isDemoMode()) {
      initDemoDb();
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
      const transfers = JSON.parse(localStorage.getItem('mycliniq_stock_transfers')) || [];
      const transferItems = JSON.parse(localStorage.getItem('mycliniq_stock_transfer_items')) || [];

      const transferId = 't_' + Math.random().toString(36).substr(2, 9);
      const newTransfer = {
        id: transferId,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        transfer_date: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString()
      };

      for (let item of items) {
        const qty = parseInt(item.quantity) || 0;
        if (qty <= 0) continue;

        // Deduct from sender location
        const fromIdx = locStocks.findIndex(ls => ls.location_id === fromLocationId && ls.drug_id === item.drug_id && ls.batch_id === item.batch_id);
        if (fromIdx !== -1) {
          locStocks[fromIdx].quantity = Math.max(0, locStocks[fromIdx].quantity - qty);
        }

        // Add to receiver location
        const toIdx = locStocks.findIndex(ls => ls.location_id === toLocationId && ls.drug_id === item.drug_id && ls.batch_id === item.batch_id);
        if (toIdx !== -1) {
          locStocks[toIdx].quantity += qty;
        } else {
          locStocks.push({
            id: 'ls_' + Math.random().toString(36).substr(2, 9),
            location_id: toLocationId,
            drug_id: item.drug_id,
            batch_id: item.batch_id,
            quantity: qty
          });
        }

        transferItems.push({
          id: 'ti_' + Math.random().toString(36).substr(2, 9),
          transfer_id: transferId,
          drug_id: item.drug_id,
          batch_id: item.batch_id,
          quantity: qty,
          created_at: new Date().toISOString()
        });
      }

      transfers.push(newTransfer);
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
      localStorage.setItem('mycliniq_stock_transfers', JSON.stringify(transfers));
      localStorage.setItem('mycliniq_stock_transfer_items', JSON.stringify(transferItems));
      return { ...newTransfer, items: transferItems.filter(i => i.transfer_id === transferId) };
    }

    // Supabase mode
    const { data: transferData, error: tErr } = await supabase.from('stock_transfers').insert({
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      status: 'completed'
    }).select().single();

    if (tErr) throw tErr;

    for (let item of items) {
      const qty = parseInt(item.quantity) || 0;
      if (qty <= 0) continue;

      // Deduct from sender location
      const { data: fromStock } = await supabase
        .from('location_stock')
        .select('*')
        .eq('location_id', fromLocationId)
        .eq('drug_id', item.drug_id)
        .eq('batch_id', item.batch_id)
        .single();
      if (fromStock) {
        await supabase
          .from('location_stock')
          .update({ quantity: Math.max(0, fromStock.quantity - qty) })
          .eq('id', fromStock.id);
      }

      // Add to receiver location
      const { data: toStock } = await supabase
        .from('location_stock')
        .select('*')
        .eq('location_id', toLocationId)
        .eq('drug_id', item.drug_id)
        .eq('batch_id', item.batch_id);

      if (toStock && toStock.length > 0) {
        await supabase
          .from('location_stock')
          .update({ quantity: toStock[0].quantity + qty })
          .eq('id', toStock[0].id);
      } else {
        await supabase.from('location_stock').insert({
          location_id: toLocationId,
          drug_id: item.drug_id,
          batch_id: item.batch_id,
          quantity: qty
        });
      }

      // Insert item
      await supabase.from('stock_transfer_items').insert({
        transfer_id: transferData.id,
        drug_id: item.drug_id,
        batch_id: item.batch_id,
        quantity: qty
      });
    }

    return transferData;
  },

  getActiveCashSession: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const active = sessions.find(s => s.status === 'open');
      return active || null;
    }
    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('status', 'open')
      .maybeSingle();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  openCashSession: async (openedBy, openingBalance) => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const active = sessions.find(s => s.status === 'open');
      if (active) throw new Error('A cash register session is already open.');

      const newSession = {
        id: 'cs_' + Math.random().toString(36).substr(2, 9),
        opened_at: new Date().toISOString(),
        opened_by: openedBy,
        closed_at: null,
        closed_by: null,
        opening_balance: parseFloat(openingBalance) || 0,
        cash_sales: 0,
        expenses: 0,
        payouts: 0,
        closing_balance_actual: null,
        closing_balance_expected: null,
        status: 'open',
        manager_handover_amount: 0,
        notes: '',
        created_at: new Date().toISOString()
      };
      sessions.push(newSession);
      localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));
      return newSession;
    }

    const { data: active } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('status', 'open')
      .maybeSingle();
    if (active) throw new Error('A cash register session is already open.');

    const { data, error } = await supabase
      .from('cash_sessions')
      .insert({
        opened_by: openedBy,
        opening_balance: parseFloat(openingBalance) || 0,
        status: 'open'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  closeCashSession: async (sessionId, closedBy, actualBalance, handoverAmount, notes) => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx === -1) throw new Error('Session not found');

      const s = sessions[idx];
      const expected = parseFloat(s.opening_balance) + parseFloat(s.cash_sales) - parseFloat(s.expenses) - parseFloat(s.payouts);
      
      s.closed_at = new Date().toISOString();
      s.closed_by = closedBy;
      s.closing_balance_actual = parseFloat(actualBalance) || 0;
      s.closing_balance_expected = expected;
      s.status = 'closed';
      s.manager_handover_amount = parseFloat(handoverAmount) || 0;
      s.notes = notes;

      localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));
      return s;
    }

    const { data: s, error: fErr } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (fErr) throw fErr;

    const expected = parseFloat(s.opening_balance) + parseFloat(s.cash_sales) - parseFloat(s.expenses) - parseFloat(s.payouts);

    const { data, error } = await supabase
      .from('cash_sessions')
      .update({
        closed_at: new Date().toISOString(),
        closed_by: closedBy,
        closing_balance_actual: parseFloat(actualBalance) || 0,
        closing_balance_expected: expected,
        status: 'closed',
        manager_handover_amount: parseFloat(handoverAmount) || 0,
        notes: notes
      })
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  addCashTransaction: async (sessionId, type, amount, description, createdBy, referenceId = null) => {
    if (isDemoMode()) {
      initDemoDb();
      const txs = JSON.parse(localStorage.getItem('mycliniq_cash_transactions')) || [];
      const newTx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        session_id: sessionId,
        transaction_type: type,
        amount: parseFloat(amount) || 0,
        description,
        reference_id: referenceId,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
      txs.push(newTx);
      localStorage.setItem('mycliniq_cash_transactions', JSON.stringify(txs));

      // Update session totals
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const sIdx = sessions.findIndex(s => s.id === sessionId);
      if (sIdx !== -1) {
        const val = parseFloat(amount) || 0;
        if (type === 'expense') {
          sessions[sIdx].expenses = (parseFloat(sessions[sIdx].expenses) || 0) + val;
        } else if (type === 'payout') {
          sessions[sIdx].payouts = (parseFloat(sessions[sIdx].payouts) || 0) + val;
        } else if (type === 'income') {
          sessions[sIdx].cash_sales = (parseFloat(sessions[sIdx].cash_sales) || 0) + val;
        }
        localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));
      }
      return newTx;
    }

    const { data, error } = await supabase
      .from('cash_transactions')
      .insert({
        session_id: sessionId,
        transaction_type: type,
        amount: parseFloat(amount) || 0,
        description,
        reference_id: referenceId,
        created_by: createdBy
      })
      .select()
      .single();
    if (error) throw error;

    // Update session totals in database
    const val = parseFloat(amount) || 0;
    const { data: s } = await supabase.from('cash_sessions').select('*').eq('id', sessionId).single();
    if (s) {
      const updates = {};
      if (type === 'expense') updates.expenses = (parseFloat(s.expenses) || 0) + val;
      else if (type === 'payout') updates.payouts = (parseFloat(s.payouts) || 0) + val;
      else if (type === 'income') updates.cash_sales = (parseFloat(s.cash_sales) || 0) + val;
      
      if (Object.keys(updates).length > 0) {
        await supabase.from('cash_sessions').update(updates).eq('id', sessionId);
      }
    }

    return data;
  },

  getCashSessions: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      return [...sessions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getCashTransactions: async (sessionId) => {
    if (isDemoMode()) {
      initDemoDb();
      const txs = JSON.parse(localStorage.getItem('mycliniq_cash_transactions')) || [];
      return txs.filter(t => t.session_id === sessionId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const { data, error } = await supabase
      .from('cash_transactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getLabWeeklyBalances: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const balances = JSON.parse(localStorage.getItem('mycliniq_lab_weekly_balances')) || [];
      return [...balances].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const { data, error } = await supabase
      .from('lab_weekly_balances')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addLabWeeklyBalance: async (startDate, endDate, expectedAmount, actualAmount, notes, createdBy) => {
    if (isDemoMode()) {
      initDemoDb();
      const balances = JSON.parse(localStorage.getItem('mycliniq_lab_weekly_balances')) || [];
      const newB = {
        id: 'wb_' + Math.random().toString(36).substr(2, 9),
        start_date: startDate,
        end_date: endDate,
        expected_amount: parseFloat(expectedAmount) || 0,
        actual_amount: parseFloat(actualAmount) || 0,
        status: 'pending',
        settled_by: null,
        settled_at: null,
        notes,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
      balances.push(newB);
      localStorage.setItem('mycliniq_lab_weekly_balances', JSON.stringify(balances));
      return newB;
    }

    const { data, error } = await supabase
      .from('lab_weekly_balances')
      .insert({
        start_date: startDate,
        end_date: endDate,
        expected_amount: parseFloat(expectedAmount) || 0,
        actual_amount: parseFloat(actualAmount) || 0,
        status: 'pending',
        notes,
        created_by: createdBy
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateLabWeeklyBalanceStatus: async (balanceId, status, settledBy) => {
    if (isDemoMode()) {
      initDemoDb();
      const balances = JSON.parse(localStorage.getItem('mycliniq_lab_weekly_balances')) || [];
      const idx = balances.findIndex(b => b.id === balanceId);
      if (idx !== -1) {
        balances[idx].status = status;
        balances[idx].settled_by = settledBy;
        balances[idx].settled_at = new Date().toISOString();
        localStorage.setItem('mycliniq_lab_weekly_balances', JSON.stringify(balances));
        return balances[idx];
      }
      throw new Error('Settlement not found');
    }

    const { data, error } = await supabase
      .from('lab_weekly_balances')
      .update({
        status,
        settled_by: settledBy,
        settled_at: new Date().toISOString()
      })
      .eq('id', balanceId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getLabRevenueForPeriod: async (startDate, endDate) => {
    if (isDemoMode()) {
      initDemoDb();
      const lr = JSON.parse(localStorage.getItem('mycliniq_lab_requests')) || [];
      const lt = JSON.parse(localStorage.getItem('mycliniq_lab_tests')) || [];
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits')) || [];

      // Filter visits of type 'lab' or other visits that are paid
      const paidVisits = visits.filter(v => v.payment_status === 'paid');
      
      const filtered = lr.filter(r => {
        // Must belong to a paid visit or be completed
        const isPaid = paidVisits.some(v => v.id === r.visit_id);
        if (!isPaid) return false;

        const dateStr = r.created_at ? r.created_at.split('T')[0] : '';
        return dateStr >= startDate && dateStr <= endDate;
      });

      const total = filtered.reduce((sum, r) => {
        const test = lt.find(t => t.id === r.test_id);
        return sum + (test ? parseFloat(test.cost) : 0);
      }, 0);
      return total;
    }

    // Supabase mode
    const { data, error } = await supabase
      .from('lab_requests')
      .select(`
        created_at,
        visit_id,
        test:lab_tests(cost),
        visit:visits(payment_status)
      `)
      .gte('created_at', startDate + 'T00:00:00Z')
      .lte('created_at', endDate + 'T23:59:59Z');

    if (error) throw error;
    
    // Filter client-side where visit is paid
    const paidRequests = data.filter(r => r.visit && r.visit.payment_status === 'paid');
    const total = paidRequests.reduce((sum, r) => {
      return sum + (r.test ? parseFloat(r.test.cost) : 0);
    }, 0);
    return total;
  }
};
