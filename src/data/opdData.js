export const OPD_DIAGNOSES = [
  {
    id: 'urti',
    name: 'URTI',
    symptoms: ['Fever', 'Cough', 'SOB', 'chest pain', 'headache', 'Sore throat', 'Runny nose', 'LOA'],
    negative_symptoms: ['No SOB', 'No chest pain', 'No high fever', 'No ear pain', 'No rash'],
    signs: ['Pharyngeal erythema', 'Tonsillar enlargement', 'Nasal congestion', 'Clear lungs']
  },
  {
    id: 'lrti',
    name: 'LRTI',
    symptoms: ['Fever', 'Cough', 'SOB', 'chest pain', 'headache', 'Sore throat', 'Runny nose', 'LOA'],
    negative_symptoms: ['No cyanosis', 'No hemoptysis', 'No confusion', 'No chest wall deformity'],
    signs: ['Lung crepitations', 'Rhonchi / Wheezing', 'Tachypnea', 'Intercostal recession', 'Warm / Febrile']
  },
  {
    id: 'ex_of_ba',
    name: 'Ex Of BA',
    symptoms: ['Fever', 'Cough', 'SOB', 'chest pain', 'Headache', 'Sore throat', 'Runny nose', 'LOA'],
    negative_symptoms: ['No fever', 'No chest pain', 'No leg edema', 'No hemoptysis'],
    signs: ['Polyphonic rhonchi / Wheezing', 'Prolonged expiration', 'Tachypnea', 'Use of accessory muscles']
  },
  {
    id: 'sinusitis',
    name: 'Sinusitis',
    symptoms: ['Headache', 'Runny nose', 'Nasal congestion', 'Fever', 'Cough'],
    negative_symptoms: ['No neck stiffness', 'No visual disturbances', 'No severe photophobia'],
    signs: ['Maxillary sinus tenderness', 'Frontal sinus tenderness', 'Purulent nasal discharge']
  },
  {
    id: 'gord',
    name: 'GORD',
    symptoms: ['Nausia', 'Vomiting', 'Epigastric pain', 'Bloating', 'Diarrhea'],
    negative_symptoms: ['No dysphagia', 'No odynophagia', 'No hematemesis', 'No weight loss'],
    signs: ['Mild epigastric tenderness', 'No abdominal rigidity', 'No palpable mass']
  },
  {
    id: 'age',
    name: 'AGE',
    symptoms: ['Nausia', 'Vomiting', 'Epigastric pain', 'Abdominal pain', 'Bloating', 'Diarrhea'],
    negative_symptoms: ['No fever', 'No blood in stool', 'No severe dehydration', 'No localized rebound tenderness'],
    signs: ['Abdominal tenderness', 'Hyperactive bowel sounds', 'Dry mucous membranes', 'Sunken eyes']
  },
  {
    id: 'constipation',
    name: 'Constipation',
    symptoms: ['Constipation', 'Nausia', 'Vomiting', 'Epigastric pain', 'Abdominal pain', 'Bloating', 'Diarrhea'],
    negative_symptoms: ['No rectal bleeding', 'No fever', 'No weight loss', 'No vomiting'],
    signs: ['Abdominal fullness', 'Palpable fecal masses', 'Mild abdominal tenderness']
  },
  {
    id: 'viral_fever',
    name: 'Viral Fever',
    symptoms: ['Fever', 'Chills', 'Rhigos', 'Cough', 'Myalgia', 'Arthralgia', 'headache', 'Vertigo', 'LOA'],
    negative_symptoms: ['No bleeding', 'No neck stiffness', 'No shortness of breath', 'No abdominal pain'],
    signs: ['Febrile', 'Mild pharyngeal erythema', 'No jaundice', 'No lymphadenopathy']
  },
  {
    id: 'fever_df',
    name: 'Fever suspecting DF',
    symptoms: ['Fever', 'Chills', 'Rhigos', 'Cough', 'Myalgia', 'Arthralgia', 'headache', 'Vertigo', 'LOA'],
    negative_symptoms: ['No warning signs', 'No severe abdominal pain', 'No persistent vomiting', 'No mucosal bleeding'],
    signs: ['Febrile', 'Hepatomegaly', 'Petechiae / Rash', 'Flushing', 'Positive tourniquet test']
  },
  {
    id: 'fever_lepto',
    name: 'Fever suspecting Lepto',
    symptoms: ['Fever', 'Muddy contact history', 'Chills', 'Rhigos', 'Cough', 'Myalgia', 'Arthralgia', 'headache', 'Vertigo', 'LOA'],
    negative_symptoms: ['No oliguria', 'No shortness of breath', 'No jaundice'],
    signs: ['Conjunctival suffusion', 'Calf muscle tenderness', 'Febrile', 'Icteric sclera']
  },
  {
    id: 'uti',
    name: 'UTI',
    symptoms: ['Dysuria', 'Frequancy', 'Urgency', 'Fever', 'Chills', 'Rhigos', 'Lower abdominal pain', 'Back pain', 'Heamaturea'],
    negative_symptoms: ['No flank tenderness / CVA tenderness', 'No high fever', 'No vaginal discharge'],
    signs: ['Suprapubic tenderness', 'No renal angle tenderness', 'Febrile']
  },
  {
    id: 'urolithysis',
    name: 'Urolithysis',
    symptoms: ['Dysuria', 'Frequancy', 'Urgency', 'Fever', 'Chills', 'Rhigos', 'Lower abdominal pain', 'Back pain', 'Heamaturea'],
    negative_symptoms: ['No fever', 'No anuria'],
    signs: ['CVA / Renal angle tenderness', 'Renal punch positive', 'Abdominal tenderness']
  },
  {
    id: 'skin_infection',
    name: 'Skin infection',
    symptoms: ['Ulcer', 'Fever', 'Chills', 'Rhigos', 'Redness', 'Pain', 'Swelling', 'Itching', 'Myalgia', 'Arthralgia'],
    negative_symptoms: ['No systemic toxicity', 'No crepitus', 'No spreading necrosis'],
    signs: ['Erythema', 'Warmth', 'Local tenderness', 'Purulent discharge', 'Fluctuant abscess']
  },
  {
    id: 'eczema',
    name: 'Eczema',
    symptoms: ['Redness', 'Pain', 'Itching', 'Fever', 'Oozing', 'Blisters', 'Swelling', 'Ulcer'],
    negative_symptoms: ['No fever', 'No secondary pus / purulent discharge'],
    signs: ['Erythematous plaques', 'Lichenification', 'Excoriations', 'Dry scaly skin']
  },
  {
    id: 'fungal_skin',
    name: 'Fungal Skin infection/Teaniasis',
    symptoms: ['Redness', 'Pain', 'Itching', 'Oozing', 'Blisters', 'Swelling', 'Ulcer'],
    negative_symptoms: ['No fever', 'No purulent discharge'],
    signs: ['Annular erythematous lesion', 'Active scaly border', 'Central clearing']
  },
  {
    id: 'pediculosis',
    name: 'Pediculosis',
    symptoms: ['Itching', 'Oozing', 'Blisters', 'Swelling', 'Ulcer', 'Fever'],
    negative_symptoms: ['No fever', 'No purulent lymphadenopathy'],
    signs: ['Nits attached to hair shaft', 'Excoriation marks', 'Occipital lymphadenopathy']
  },
  {
    id: 'psorisis',
    name: 'Psorisis',
    symptoms: ['Itching', 'Oozing', 'Blisters', 'Swelling', 'Ulcer', 'Fever'],
    negative_symptoms: ['No joint pain / swelling', 'No pustules'],
    signs: ['Silver scaly plaques', 'Auspitz sign positive', 'Extensor surface involvement']
  },
  {
    id: 'arthritis',
    name: 'Arthritis',
    symptoms: ['KJ pain', 'SJ pain', 'Small joint pain', 'Heel pain', 'Nack pain', 'Back pain', 'Myalgia'],
    negative_symptoms: ['No fever', 'No skin rash', 'No redness'],
    signs: ['Joint tenderness', 'Joint effusion / Swelling', 'Restricted range of motion', 'Heberden/Bouchard nodes']
  },
  {
    id: 'ckd',
    name: 'CKD',
    symptoms: ['Lethargy', 'Edema', 'Oliguria', 'Nausea', 'Loss of appetite', 'Pruritus', 'Hypertension'],
    negative_symptoms: ['No acute oliguria', 'No hematuria'],
    signs: ['Pale', 'Bilateral pedal edema', 'Elevated BP', 'Periorbital puffiness']
  },
  {
    id: 'msp',
    name: 'MSP',
    symptoms: ['KJ pain', 'SJ pain', 'Small joint pain', 'Heel pain', 'Nack pain', 'Back pain', 'Myalgia'],
    negative_symptoms: ['No fever', 'No joint swelling / redness'],
    signs: ['Muscle tenderness', 'Trigger points', 'Normal joint range of motion']
  },
  {
    id: 'conjunctivitis',
    name: 'Conjunctivitis',
    symptoms: ['Discharge', 'Redness', 'Crusting', 'Irritation', 'Tearing', 'Swelling of eyelids'],
    negative_symptoms: ['No vision loss / visual reduction', 'No severe eye pain', 'No photophobia'],
    signs: ['Conjunctival injection / hyperemia', 'Mucopurulent discharge', 'Eyelid edema']
  },
  {
    id: 'fb_eye',
    name: 'FB in eye',
    symptoms: ['Discharge', 'Redness', 'Crusting', 'Irritation', 'Tearing', 'Swelling of eyelids'],
    negative_symptoms: ['No hyphema', 'No corneal perforation'],
    signs: ['Corneal foreign body visible', 'Fluorescein stain uptake', 'Conjunctival congestion']
  },
  {
    id: 'ear_infection',
    name: 'Ear infection',
    symptoms: ['Earache', 'Discharges', 'Hearing Change', 'Fever', 'Headache', 'Dizziness'],
    negative_symptoms: ['No mastoid tenderness', 'No facial nerve weakness'],
    signs: ['Tympanic membrane erythema / bulging', 'Otorrhea / Purulent discharge', 'Tragal tenderness']
  },
  {
    id: 'oral_infection',
    name: 'Oral infection',
    symptoms: ['toothache', 'Swollen gums', 'Tooth sensitivity', 'Pus or drainage', 'Loose teeth', 'Oral ulcers', 'Fever', 'Headache', 'Mouth opening difficulties'],
    negative_symptoms: ['No trismus', 'No airway compromise / stridor'],
    signs: ['Dental caries', 'Gingival inflammation / abscess', 'Submandibular lymphadenopathy']
  },
  {
    id: 'depression',
    name: 'Depression',
    symptoms: ['Low mood', 'Irritability', 'Negative feelings', 'Loss of interest', 'Fatigue', 'insomnia'],
    negative_symptoms: ['No suicidal ideation', 'No psychotic symptoms / hallucinations'],
    signs: ['Psychomotor retardation / agitation', 'Flat affect', 'Low pitch speech']
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    symptoms: ['Low mood', 'Irritability', 'Negative feelings', 'Loss of interest', 'Fatigue', 'insomnia', 'Agitation'],
    negative_symptoms: ['No chest pain', 'No syncope', 'No suicidal intent'],
    signs: ['Tremor', 'Tachycardia', 'Diaphoresis', 'Restlessness']
  },
  {
    id: 'somatoform',
    name: 'Somatoform disorder',
    symptoms: ['Fatigue', 'Multiple pains', 'insomnia', 'Restlessness'],
    negative_symptoms: ['No organic signs of severe disease', 'No weight loss'],
    signs: ['Normal systemic examination']
  },
  {
    id: 'dementia',
    name: 'Dementia',
    symptoms: ['Short-term memory loss', 'Disorientation', 'Poor judgment', 'Misplacing items', 'Agitation'],
    negative_symptoms: ['No acute delirium / fluctuating consciousness', 'No focal neurological deficits'],
    signs: ['Impaired MMSE / cognitive score', 'Preserved long term memory early on']
  },
  {
    id: 'migraine',
    name: 'migraine',
    symptoms: ['Headache', 'Nausia', 'Vomiting', 'Visual changes', 'Dizziness'],
    negative_symptoms: ['No fever', 'No neck stiffness', 'No focal neurological deficit', 'No sudden onset thunderclap'],
    signs: ['Normal neurological exam', 'Photophobia positive']
  },
  {
    id: 'bppv',
    name: 'BPPV',
    symptoms: ['Vertigo', 'Dizziness', 'Nausia', 'Vomiting', 'Headache', 'Abdominal pain'],
    negative_symptoms: ['No hearing loss', 'No tinnitus', 'No focal motor/sensory weakness'],
    signs: ['Dix-Hallpike test positive (Rotary nystagmus)', 'No cranial nerve deficit']
  },
  {
    id: 'menstrual_disorder',
    name: 'Menstrual dissorder',
    symptoms: ['Dysmenorrhea', 'Menorrhagia', 'Intermenstrual bleeding', 'Amenorrhea', 'Dyspareunia', 'Leukorrhea', 'Pruritus vulvae', 'Lower abdominal pain', 'Ulcers'],
    negative_symptoms: ['No fever', 'No acute abdomen', 'No syncope'],
    signs: ['Pale', 'Pelvic tenderness', 'No acute rebound tenderness']
  },
  {
    id: 'sexual_disorder',
    name: 'Sexual disorder',
    symptoms: ['Erectile dysfunction', 'Premature ejaculation', 'Dyspareunia', 'Vaginal dryness', 'Absence of sexual desire'],
    negative_symptoms: ['No pelvic mass', 'No abnormal discharge'],
    signs: ['Normal external genital examination']
  },
  {
    id: 'pregnancy',
    name: 'Pregnancy',
    symptoms: ['Abdominal pain', 'Reduce fetal movment', 'Leukorrhea', 'Urgency', 'Dysuria'],
    negative_symptoms: ['No vaginal bleeding', 'No severe headache / visual aura', 'No loss of fluid'],
    signs: ['Uterine height consistent with gestational age', 'Fetal heart sound present', 'No pedal edema']
  },
  {
    id: 'cosmatic',
    name: 'Cosmatic',
    symptoms: ['Hair loss', 'Hyperpigmented patches'],
    negative_symptoms: ['No systemic autoimmune symptoms', 'No scarring alopecia'],
    signs: ['Melasma patches', 'Non-scarring hair thinning']
  },
  {
    id: 'hiccup',
    name: 'Hiccup',
    symptoms: ['Hiccup', 'Chest pain', 'Vomiting', 'Abdominal distention'],
    negative_symptoms: ['No hematemesis', 'No shortness of breath'],
    signs: ['Diaphragmatic flutter / Spasms', 'No abdominal rigidity']
  }
];

export const COMMON_NEGATIVE_SYMPTOMS = [
  'No fever',
  'No vomiting',
  'No shortness of breath',
  'No chest pain',
  'No headache',
  'No diarrhea',
  'No cough',
  'No abdominal pain',
  'No weight loss',
  'No dysuria',
  'No bleeding',
  'No neck stiffness',
  'No rash',
  'No visual changes',
  'No ear pain',
  'No sore throat'
];

export const COMMON_SIGNS = [
  'Pale',
  'Icteric',
  'Abdominal tenderness',
  'Ejection systolic murmur',
  'Lung crepitations',
  'Rhonchi / Wheezing',
  'Cyanosis',
  'Clubbing',
  'Bilateral pedal edema',
  'Lymphadenopathy',
  'Dehydration signs',
  'Pharyngeal erythema',
  'Sinus tenderness',
  'Febrile',
  'Hepatomegaly',
  'Splenomegaly'
];

export const SYMPTOM_DURATIONS = [
  'for 1 day',
  'for 2 days',
  'for 3 days',
  'for 5 days',
  'for 1 week',
  'for 2 weeks',
  'for 1 month',
  'for 1 year'
];

