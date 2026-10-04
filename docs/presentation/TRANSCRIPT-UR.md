# ڈیمو ویڈیو — اردو راوی (نریشن) ٹرانسکرپٹ (~4:50)

یہ transcript اردو زبان کی پیشکش کے لیے ہے۔ پروڈکٹ اور ٹیکنالوجی کے نام
انگریزی میں ہی رہنے دیں۔ bracket میں ہدایات پڑھنی نہیں، کرنا ہے۔
مجموعی طور پر تقریباً چار منٹ چالیس سیکنڈ سے پانچ منٹ، پرسکون رفتار سے۔

---

**[0:00 — ٹائٹل کارڈ → ہوم پیج]**

یہ ہے **Cognitive Fitness and Human Development** — ایک ایسا learning
platform جو بتاتا ہے کہ انسان سوچتا، سیکھتا، focus کرتا، سوتا اور عادات
بناتا کیسے ہے — اور یہ سب ثبوتوں کی بنیاد پر۔ مسئلہ کیا ہے؟ "brain
training" والی ایپس مبالغہ کرتی ہیں، سیکھنے کے اوزاد بکھرے ہوئے ہیں، اور
زیادہ تر interfaces اگلے قدم کو سجاوٹ کے نیچے دبا دیتے ہیں۔

**[0:25 — concept یا evidence page کا Boundary حصہ scroll کریں]**

تحقیق — مثلاً Simons اور ساتھیوں کا 2016 کا جائزہ، جس کا ہم حوالہ دیتے ہیں —
بتاتی ہے کہ games سے ملنے والا فائدہ عام طور پر زندگی میں transfer نہیں
ہوتا۔ پھر بھی زیادہ تر ایپس "آپ کا دماغ، اب بہتر" بیچتی ہیں۔ اس لیے ہمارے
ہر صفحے پر ایک *boundary* لازمی ہے: یہ score کیا **ثبوت نہیں**۔ آپ یہاں دیکھ
سکتے ہیں — scores صرف اسی task تک محدود ہیں، نہ diagnosis، نہ IQ۔

**[1:05 — ہوم، پھر journeys index]**

ہمارا حل ایک ایسا ڈھانچہ ہے جو آپ خود جانچ سکتے ہیں۔ تئیسوں صفحات میں سے
ہر صفحہ ایک manifest میں register ہے — ناظر کون ہے، مقصد کیا ہے، ایک بنیادی
عمل، اور آگے جانے والے لنکس۔ اگر کوئی چیز غائب ہو تو build fail ہو جاتا ہے —
یعنی "ہر صفحے کا مطلب" pipeline enforce کرتی ہے، پسند نہیں۔ اسی پر چھ guided
journeys ہیں: سمجھو، محسوس کرو، جانچو، مشق کرو، لاگو کرو، غور کرو — نہ account،
نہ tracking۔

**[1:45 — slide: technology stack]**

Stack: Next.js sixteen کے ساتھ React nineteen، strict TypeScript، content کو
JSON data بنا کر custom validators کے ساتھ، Vitest اور Testing Library — ایک
سو اٹھانوے خودکار tests، Tailwind اور CSS modules، deploy
Vercel پر، اور optional AI guide کے لیے Puter dot JS۔

**[2:20 — slide: diagram]**

اوپر سے دیکھیں: browser ایک static CDN سے بات کرتا ہے — بائیس صفحے
پہلے سے تیار شدہ files ہیں۔ Preferences اور practice history صرف آپ کے
device پر رہتی ہیں۔ اگر آپ AI guide چالو کریں تو آپ کا browser براہِ راست
provider کو call کرتا ہے Puter کے ذریعے؛ ہمارے پاس کوئی key نہیں ہوتی۔
اور CI — lint, types, tests, validators, build — ہر deploy پر پہرا دیتا ہے۔

**[2:50 — demo: journeys]**

Live demo۔ Start Here journey: ہر step بتاتا ہے کہ کیوں کر رہے ہیں، کیا کرنا
ہے، کیا ملا، اور کیا احتیاط ہے — اور اندر کی طرف لنک۔ ایک link، ایک back، اور
"where this leads" panel اس صفحے کا پورا neighborhood دکھاتا ہے۔

**[3:15 — demo: search]**

Search مکمل طور پر client-side ہے: "spac" لکھیں، typo کے باوجود — spacing
effect مل گیا، ایک بھی network request نہیں۔ Concept کھولیں تو evidence اور
boundary اسی جگہ anchor شدہ ہیں۔

**[3:35 — demo: preferences]**

Reading settings — text size، contrast، spacing، serif، reduced motion،
reading guide، link underlining — یہ page بننے سے پہلے لاگو ہوتے ہیں، device
پر محفوظ رہتے ہیں، اور تمام tabs میں sync ہوتے ہیں۔

**[3:55 — demo: progress]**

Progress صرف ان sessions کی بات کرتا ہے جو میں نے خود محفوظ کرنے چنے: ہر
activity کی گنتی اور ردِ و بدل — جانتے بوجھتے کوئی combined score نہیں۔

**[4:10 — demo: coach]**

Coach کی default حالت "this device only, no AI" ہے۔ Opt-in کریں تو یہ
**user-pays** billing پر چلتا ہے: آپ browser میں Puter سے sign in کرتے ہیں،
ہر صارف کو ماہانہ مفت رقم ملتی ہے، پھر وہ اپنا خرچ خود ادا کرتا ہے۔ ہمارے
پاس کبھی credential نہیں رہتا، ہر message پر واضح اجازت چاہیے، اور ایک kill
switch پورے feature کو بند کر دیتا ہے۔

**[4:35 — privacy page → closing card]**

نہ accounts، نہ database، نہ analytics — privacy page ہر اس راستے کی فہرست
دیتی ہے جہاں ڈیٹا جاتا ہے، کیونکہ یہ ایک research prototype ہے، دیমানعی
حدود کے ساتھ — launch کا دعوٰی نہیں۔ شکریہ۔

---

*پڑھنے کے نوٹ:* ہر "[time]" کے cut پر ایک سانس رکھیں؛ تعداد آہستہ بولیں
(تئیس صفحات، ایک سو اٹھانوے tests)؛ Puter popup آنے پر تین سیکنڈ خاموش
رہیں۔ اگر scene by scene ریکارڈ کریں تو اگلے scene کا پہلا جملہ warm-up میں
دہرا لیں۔
