import { GrammarTopic } from '@/types';

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'conditionals',
    titleTr: 'Koşul Cümleleri',
    description: 'If-clauses, inverted conditionals ve mixed conditionals',
    theme: 'sentence_structure',
    difficulty: 'intermediate',
    icon: 'GitBranch',
    color: '#3B82F6',
    content: {
      introduction:
        'Koşul cümleleri (Conditionals), bir olayın gerçekleşmesi için gerekli koşulları ifade eder. YDS sınavında en sık çıkan gramer konularından biridir. Dört temel tip vardır: Zero, First, Second ve Third Conditional. Ayrıca mixed conditional ve inverted conditional yapıları da sınavda karşınıza çıkabilir.',
      rules: [
        {
          formula: 'Zero: If + Present Simple, Present Simple',
          explanation: 'Genel doğrular ve bilimsel gerçekler için kullanılır.',
        },
        {
          formula: 'First: If + Present Simple, will + V1',
          explanation: 'Gerçekleşmesi muhtemel gelecek durumlar için kullanılır.',
        },
        {
          formula: 'Second: If + Past Simple (were), would + V1',
          explanation: 'Şu anda gerçek olmayan, hayali durumlar için kullanılır.',
        },
        {
          formula: 'Third: If + Past Perfect, would have + V3',
          explanation: 'Geçmişte gerçekleşmemiş durumlar ve pişmanlıklar için kullanılır.',
        },
        {
          formula: 'Inverted: Had + S + V3, S + would have + V3',
          explanation: '"If" olmadan devrik yapıyla aynı anlam ifade edilir. Akademik metinlerde sık kullanılır.',
        },
      ],
      examples: [
        { english: 'If I were you, I would accept the offer.', turkish: 'Yerinde olsam teklifi kabul ederdim.' },
        { english: 'Had the students been informed earlier, they would have been better prepared.', turkish: 'Öğrenciler daha erken bilgilendirilseydi, daha iyi hazırlanmış olurlardı.' },
        { english: 'Were it not for the donations, the charity would not be able to continue.', turkish: 'Bağışlar olmasaydı, hayır kurumu faaliyetlerine devam edemezdi.' },
        { english: 'If the weather is better tomorrow, we will go to the beach.', turkish: 'Yarın hava daha iyi olursa, sahile gideriz.' },
      ],
      ydsPatterns: [
        'YDS\'de 3. tip koşul cümleleri (Third Conditional) en sık çıkan tiptir.',
        '"Had + S + V3" devrik yapısı neredeyse her sınavda sorulur.',
        '"Were it not for..." ve "But for..." yapılarına dikkat edin.',
        '"Should you encounter..." (= If you should encounter) resmi/akademik stildeki 1. tip devrik yapıdır.',
        '"Provided that", "on condition that", "as long as" gibi koşul bağlaçları da sıklıkla sorulur.',
      ],
      commonMistakes: [
        '"If I would..." YANLIŞ → "If I + Past Simple" olmalı.',
        '3. tip koşulda "would have + V3" yerine "would + V1" kullanmak.',
        'Devrik yapıda (Had + S + V3) "if" kullanmak gereksizdir.',
        '"Were" tüm özneler için kullanılır: "If I were", "If he were" (was değil).',
      ],
      quickTip: 'Devrik koşul cümlelerini tanımak için cümle başındaki "Had", "Were", "Should" sözcüklerine dikkat edin.',
    },
    relatedQuestionIds: ['g001', 'g006', 'g012', 'g016', 'g032', 'g046', 'g054', 'g059', 'g068', 'g078'],
    order: 1,
  },
  {
    id: 'relative_clauses',
    titleTr: 'İlgi Cümlecikleri',
    description: 'Defining, non-defining relative clauses ve relative pronouns',
    theme: 'clauses',
    difficulty: 'intermediate',
    icon: 'Link',
    color: '#8B5CF6',
    content: {
      introduction:
        'İlgi cümlecikleri (Relative Clauses), bir isim hakkında ek bilgi veren yan cümleciklerdir. İki türü vardır: tanımlayan (defining) ve tanımlamayan (non-defining). YDS\'de özellikle "which", "whose", "whom" ve "where" kullanımı sıklıkla sorulur.',
      rules: [
        {
          formula: 'Defining: ... noun + who/which/that + clause',
          explanation: 'İsmi tanımlar, virgül kullanılmaz, "that" kullanılabilir.',
        },
        {
          formula: 'Non-defining: ... noun, + who/which + clause, ...',
          explanation: 'Ek bilgi verir, virgülle ayrılır, "that" KULLANILAMAZ.',
        },
        {
          formula: 'Whose + noun: possession/sahiplik',
          explanation: '"Whose" sahiplik bildiren ilgi zamiridir, kişi ve nesne için kullanılır.',
        },
        {
          formula: 'Where: yer bildiren ilgi zarfı',
          explanation: '"Where" mekan bildiren isimlerden sonra kullanılır (= in which).',
        },
        {
          formula: 'Preposition + whom/which',
          explanation: 'Edatla birlikte "whom" (kişi) veya "which" (nesne) kullanılır.',
        },
      ],
      examples: [
        { english: 'The project, which was completed ahead of schedule, received praise.', turkish: 'Zamanından önce tamamlanan proje övgü aldı.' },
        { english: 'The researchers, whose findings were published, are working on a follow-up.', turkish: 'Bulguları yayımlanan araştırmacılar bir takip çalışması yapıyor.' },
        { english: 'This is the hospital where my mother works.', turkish: 'Annemin çalıştığı hastane burası.' },
        { english: 'The students, most of whom passed the exam, were congratulated.', turkish: 'Çoğu sınavı geçen öğrenciler tebrik edildi.' },
      ],
      ydsPatterns: [
        'Non-defining clause\'larda "that" yerine "which" kullanılmalıdır — bu YDS\'nin favori tuzağıdır.',
        '"Whose" hem kişiler hem nesneler için kullanılabilir: "the company whose profits..."',
        '"Most of whom/which", "some of whom/which" yapıları sıkça sorulur.',
        'Virgüllü yapılarda "that" seçeneği her zaman yanlıştır.',
      ],
      commonMistakes: [
        'Non-defining clause\'da "that" kullanmak (YANLIŞ).',
        '"Whose" yerine "who\'s" yazmak.',
        '"Where" yerine "which" kullanmak (yer bildiren isimlerden sonra).',
        '"Whom" yerine "who" kullanmak (özellikle edattan sonra).',
      ],
      quickTip: 'Virgülle ayrılmış bir yan cümle görürseniz "that" seçeneğini hemen eleyin — non-defining clause\'da "that" kullanılmaz.',
    },
    relatedQuestionIds: ['g002', 'g011', 'g018', 'g028', 'g042', 'g060', 'g076'],
    order: 2,
  },
  {
    id: 'inversion',
    titleTr: 'Devrik Cümle',
    description: 'Negative adverbials ile subject-verb inversion',
    theme: 'sentence_structure',
    difficulty: 'advanced',
    icon: 'ArrowDownUp',
    color: '#EF4444',
    content: {
      introduction:
        'Devrik cümle (Inversion), normal özne-yüklem sırasının tersine çevrildiği yapıdır. YDS\'de en çok sorulan konulardan biridir. Özellikle olumsuz zarf öbekleri cümle başına geldiğinde devrik yapı zorunludur.',
      rules: [
        {
          formula: 'Not until + clause + auxiliary + S + V',
          explanation: '"Not until" ile başlayan cümlelerde ana cümlede devrik yapı kullanılır.',
        },
        {
          formula: 'Hardly/Scarcely + had + S + V3 + when/before + clause',
          explanation: '"Hardly" ve "Scarcely" past perfect ile kullanılır, "when" ile devam eder.',
        },
        {
          formula: 'No sooner + had + S + V3 + than + clause',
          explanation: '"No sooner...than" çifti past perfect gerektirir.',
        },
        {
          formula: 'Never/Seldom/Rarely + auxiliary + S + V',
          explanation: 'Olumsuz anlam taşıyan zarflar devrik yapı gerektirir.',
        },
        {
          formula: 'Only + when/after/by + ... + auxiliary + S + V',
          explanation: '"Only" ile başlayan zaman ifadelerinde ana cümle devrik olur.',
        },
        {
          formula: 'So/Such + adjective/noun + auxiliary + S + that...',
          explanation: '"So" ve "Such" vurgu için cümle başına geldiğinde devrik yapı kullanılır.',
        },
      ],
      examples: [
        { english: 'Not until the results were announced did they realize the extent of the damage.', turkish: 'Sonuçlar açıklanana kadar hasarın boyutunu fark etmediler.' },
        { english: 'Hardly had he begun the lecture when the fire alarm went off.', turkish: 'Derse başlar başlamaz yangın alarmı çaldı.' },
        { english: 'Never before has there been such a devastating earthquake.', turkish: 'Daha önce hiç bu kadar yıkıcı bir deprem olmamıştı.' },
        { english: 'Only by investing in education can a nation hope to achieve sustainable development.', turkish: 'Ancak eğitime yatırım yaparak bir ulus sürdürülebilir kalkınma umut edebilir.' },
        { english: 'So impressed was she by the performance that she stood up and applauded.', turkish: 'Performanstan o kadar etkilendi ki ayağa kalkıp alkışladı.' },
      ],
      ydsPatterns: [
        'YDS\'de devrik cümle soruları genellikle boşluğa yardımcı fiil + özne sırası ister.',
        '"Under no circumstances", "On no account", "In no way", "At no time", "Nowhere" — hepsi devrik yapı gerektirir.',
        '"Little did he know..." yapısı çok sık sorulur.',
        '"Not only...but also" yapısında "not only" ile başlayan kısım devrik olur.',
        'Cümle başında "So", "Such", "Only" gördüğünüzde devrik yapı arayın.',
      ],
      commonMistakes: [
        'Devrik yapıda normal özne-yüklem sırası kullanmak.',
        '"Hardly...than" yerine "Hardly...when" olmalı; "No sooner...when" yerine "No sooner...than" olmalı.',
        '"Not only" ile başlayan cümlede "but also" kısmını da devrik yapmak (sadece ilk kısım devrik olur).',
        '"Only" ile başlamayan "only" cümlelerinde gereksiz devrik yapı kullanmak.',
      ],
      quickTip: 'Cümle başında olumsuz veya kısıtlayıcı bir zarf görürseniz, yardımcı fiil + özne sırası arayın.',
    },
    relatedQuestionIds: ['g003', 'g010', 'g013', 'g020', 'g023', 'g026', 'g033', 'g039', 'g049', 'g052', 'g056', 'g062', 'g069', 'g072', 'g075'],
    order: 3,
  },
  {
    id: 'subjunctive',
    titleTr: 'Dilek Kipi (Subjunctive)',
    description: 'Demand verbs, it is essential that... yapıları',
    theme: 'verb_forms',
    difficulty: 'advanced',
    icon: 'MessageSquare',
    color: '#F59E0B',
    content: {
      introduction:
        'Dilek kipi (Subjunctive Mood), İngilizce\'de resmi dilde kullanılan ve fiilin yalın halini (base form) gerektiren yapıdır. "Suggest", "demand", "insist", "require" gibi fiillerden ve "it is essential/imperative that" gibi yapılardan sonra kullanılır.',
      rules: [
        {
          formula: 'S + suggest/demand/insist/require + that + S + V1 (base form)',
          explanation: 'Talep, öneri ve ısrar bildiren fiillerden sonra "that" cümlecisinde fiilin yalın hali kullanılır.',
        },
        {
          formula: 'It is essential/imperative/important + that + S + V1',
          explanation: 'Gereklilik bildiren sıfatlardan sonra aynı yapı kullanılır.',
        },
        {
          formula: 'Passive subjunctive: that + S + be + V3',
          explanation: 'Edilgen yapıda "be" + past participle kullanılır, özneye göre değişmez.',
        },
      ],
      examples: [
        { english: 'It is imperative that every student submit the assignment by Friday.', turkish: 'Her öğrencinin ödevi Cuma\'ya kadar teslim etmesi zorunludur.' },
        { english: 'The manager insisted that the report be completed before the end of the day.', turkish: 'Müdür raporun gün sonuna kadar tamamlanmasında ısrar etti.' },
        { english: 'The professor suggested that the student change his thesis topic.', turkish: 'Profesör öğrencinin tez konusunu değiştirmesini önerdi.' },
        { english: 'It is essential that the medication be stored at the correct temperature.', turkish: 'İlacın doğru sıcaklıkta saklanması zorunludur.' },
      ],
      ydsPatterns: [
        'YDS\'de subjunctive genellikle "submits" vs "submit" karşılaştırması olarak sorulur.',
        '"It is imperative/essential/vital/crucial that..." yapısı çok sık çıkar.',
        'Passive subjunctive\'de "is completed" değil "be completed" doğrudur.',
        'Suggest, recommend, demand, require, insist, propose — bu fiilleri ezberleyin.',
      ],
      commonMistakes: [
        '"submits" kullanmak (3. tekil -s eki EKLENMEZ).',
        '"should submit" yazmak (İngiliz İngilizcesi\'nde kabul edilir ama YDS\'de genellikle yalın hal beklenir).',
        'Past tense kullanmak: "suggested that he changed..." YANLIŞ.',
        'Passive\'de "is" kullanmak: "be completed" olmalı, "is completed" değil.',
      ],
      quickTip: 'Suggest, demand, insist, require gibi fiillerden sonra gelen "that" cümlecisinde fiil daima yalın haldedir — özneye göre değişmez.',
    },
    relatedQuestionIds: ['g004', 'g007', 'g017', 'g027', 'g047', 'g073'],
    order: 4,
  },
  {
    id: 'tense_sequencing',
    titleTr: 'Zaman Uyumu',
    description: 'Tense consistency, time expressions ve future perfect',
    theme: 'verb_forms',
    difficulty: 'intermediate',
    icon: 'Clock',
    color: '#06B6D4',
    content: {
      introduction:
        'Zaman uyumu (Tense Sequencing), cümledeki fiillerin birbirleriyle ve zaman ifadeleriyle tutarlı olmasını sağlayan kuraldır. Özellikle "by the time", "since", "for" gibi zaman ifadeleri belirli zamanları gerektirir.',
      rules: [
        {
          formula: 'By the time + Past Simple, Past Perfect (had + V3)',
          explanation: 'Geçmişte bir eylem tamamlandığında diğerinin zaten olmuş olduğunu ifade eder.',
        },
        {
          formula: 'By + future time, Future Perfect (will have + V3)',
          explanation: 'Gelecekte belirli bir zamana kadar tamamlanmış olacak eylemleri ifade eder.',
        },
        {
          formula: 'Since + specific time point, Present/Past Perfect',
          explanation: '"Since" belirli bir zaman noktasıyla kullanılır (for ise süre ile).',
        },
        {
          formula: 'Main clause (past) → Subordinate clause (past)',
          explanation: 'Ana cümle geçmiş zamandaysa, yan cümle de genellikle geçmiş zaman olur.',
        },
      ],
      examples: [
        { english: 'By the time the rescue team arrived, the survivors had been waiting for three days.', turkish: 'Kurtarma ekibi vardığında, hayatta kalanlar üç gündür bekliyordu.' },
        { english: 'By this time next year, the team will have completed the new bridge.', turkish: 'Gelecek yılın bu zamanında ekip yeni köprüyü tamamlamış olacak.' },
        { english: 'She has been working here since she graduated from university.', turkish: 'Üniversiteden mezun olduğundan beri burada çalışıyor.' },
        { english: 'The proposal was rejected on the grounds that it was too expensive.', turkish: 'Teklif çok pahalı olduğu gerekçesiyle reddedildi.' },
      ],
      ydsPatterns: [
        '"By the time" + Past Simple → Past Perfect yapısı çok sık sorulur.',
        '"By + gelecek zaman" → Future Perfect kullanımını bekleyin.',
        '"Since" vs "for" ayrımı sıklıkla test edilir.',
        'Ana cümle "past" ise yan cümlede "present" kullanmak genellikle yanlıştır.',
      ],
      commonMistakes: [
        '"Since" ile süre kullanmak: "since three years" YANLIŞ → "for three years" olmalı.',
        '"By the time" ile Present Perfect kullanmak (Past Perfect olmalı).',
        'Future Perfect yerine Simple Future kullanmak: "will complete" yerine "will have completed".',
        'Zaman uyumsuzluğu: past tense ana cümle + present tense yan cümle.',
      ],
      quickTip: '"By the time" gördüğünüzde Perfect tense arayın — geçmişte Past Perfect, gelecekte Future Perfect.',
    },
    relatedQuestionIds: ['g005', 'g025', 'g050', 'g066'],
    order: 5,
  },
  {
    id: 'agreement',
    titleTr: 'Özne-Yüklem Uyumu',
    description: 'Subject-verb agreement, intervening phrases',
    theme: 'sentence_structure',
    difficulty: 'beginner',
    icon: 'CheckCheck',
    color: '#22C55E',
    content: {
      introduction:
        'Özne-yüklem uyumu (Subject-Verb Agreement), cümledeki fiilin özneyle sayı (tekil/çoğul) bakımından uyumlu olmasını gerektirir. YDS\'de özellikle araya giren ifadelerle (intervening phrases) bu uyumun bozulmaya çalışıldığı sorular sıkça çıkar.',
      rules: [
        {
          formula: 'The number of + plural noun + singular verb',
          explanation: '"The number of" (sayı) tekil fiil alır.',
        },
        {
          formula: 'A number of + plural noun + plural verb',
          explanation: '"A number of" (birçok) çoğul fiil alır.',
        },
        {
          formula: 'S + along with/as well as/together with + noun + singular verb',
          explanation: 'Bu ifadeler özneyi değiştirmez, fiil asıl özneye göre çekimlenir.',
        },
        {
          formula: 'Neither A nor B + verb agrees with B',
          explanation: '"Neither...nor" yapısında fiil en yakın özneye uyar.',
        },
      ],
      examples: [
        { english: 'The number of students has increased dramatically.', turkish: 'Öğrenci sayısı dramatik şekilde arttı.' },
        { english: 'Neither the teacher nor the students were aware of the change.', turkish: 'Ne öğretmen ne de öğrenciler değişiklikten haberdardı.' },
        { english: 'The athlete, along with her teammates, is training for the championship.', turkish: 'Sporcu, takım arkadaşlarıyla birlikte, şampiyona için antrenman yapıyor.' },
        { english: 'The teacher, as well as the students, is excited about the field trip.', turkish: 'Öğretmen, öğrenciler gibi, gezi hakkında heyecanlı.' },
      ],
      ydsPatterns: [
        '"The number of" vs "A number of" ayrımı YDS\'nin favori sorularından biridir.',
        'Araya giren "along with", "as well as", "together with" ifadeleri tuzak olarak kullanılır.',
        '"Neither...nor" ve "Either...or" yapılarında en yakın özne kuralı sorulur.',
        'Uzun araya giren ifadeler özneyi gizlemek için kullanılır — asıl özneyi bulun.',
      ],
      commonMistakes: [
        '"The number of students have..." YANLIŞ → "has" olmalı.',
        '"As well as" ifadesini "and" gibi düşünmek — özneyi değiştirmez.',
        '"Neither...nor" yapısında fiilin her zaman çoğul olacağını sanmak.',
        'Araya giren uzun ifadeler yüzünden yanlış özneyle eşleştirmek.',
      ],
      quickTip: 'Araya giren "along with", "as well as", "together with" ifadelerini paranteze alın — fiil asıl özneye göre çekimlenir.',
    },
    relatedQuestionIds: ['g008', 'g009', 'g021', 'g029'],
    order: 6,
  },
  {
    id: 'participial_phrases',
    titleTr: 'Ortaç Yapıları',
    description: 'Present/past participle, reduced relative clauses',
    theme: 'clauses',
    difficulty: 'intermediate',
    icon: 'Layers',
    color: '#EC4899',
    content: {
      introduction:
        'Ortaç yapıları (Participial Phrases), cümleyi kısaltmak ve daha akademik hale getirmek için kullanılır. Present participle (-ing) ve past participle (-ed/V3) formlarıyla oluşturulur. Genellikle ilgi cümleciklerinin kısaltılmış halidir.',
      rules: [
        {
          formula: 'Past Participle (V3): passive anlam',
          explanation: '"...which was built in 1920" → "...built in 1920" — edilgen anlam taşır.',
        },
        {
          formula: 'Present Participle (-ing): active anlam',
          explanation: '"...who is working..." → "...working..." — etken anlam taşır.',
        },
        {
          formula: 'Having + V3: tamamlanmış eylem',
          explanation: 'Ana eylemden önce tamamlanmış bir eylemi ifade eder.',
        },
      ],
      examples: [
        { english: 'The painting, believed to be a forgery, was removed from the exhibition.', turkish: 'Sahte olduğuna inanılan tablo sergiden kaldırıldı.' },
        { english: 'The documentary, filmed over a period of five years, won several awards.', turkish: 'Beş yıl boyunca çekilen belgesel birçok ödül kazandı.' },
        { english: 'The building constructed in 1920 is now a national heritage site.', turkish: '1920\'de inşa edilen bina artık ulusal miras alanı.' },
        { english: 'The decision made by the board yesterday will affect all departments.', turkish: 'Yönetim kurulunun dün aldığı karar tüm departmanları etkileyecek.' },
      ],
      ydsPatterns: [
        'YDS\'de "believed", "built", "constructed", "filmed" gibi past participle\'lar kısaltılmış relative clause olarak sorulur.',
        'Boşlukta "-ing" mi "-ed/V3" mi seçimi yapmanız istenir — anlam active mi passive mi kontrol edin.',
        '"Having + V3" yapısı tamamlanmışlık vurgusu yapar.',
        'Virgüller arasındaki ortaç yapıları non-defining relative clause\'un kısaltmasıdır.',
      ],
      commonMistakes: [
        'Passive anlam gereken yerde "-ing" kullanmak.',
        'Active anlam gereken yerde "V3" kullanmak.',
        '"Having believing" gibi yanlış formlar — "having believed" olmalı.',
        'Ortaç yapısının öznesinin ana cümlenin öznesiyle aynı olması gerektiğini unutmak.',
      ],
      quickTip: 'Nesne bir eylemi "yapan" ise -ing, eylemin "yapıldığı" nesne ise V3 (past participle) kullanın.',
    },
    relatedQuestionIds: ['g034', 'g055', 'g064', 'g070'],
    order: 7,
  },
  {
    id: 'gerunds_infinitives',
    titleTr: 'İsim Fiil ve Mastar',
    description: 'Gerund (-ing) vs infinitive (to + V1) kullanımları',
    theme: 'verb_forms',
    difficulty: 'intermediate',
    icon: 'ToggleLeft',
    color: '#14B8A6',
    content: {
      introduction:
        'İsim fiiller (Gerunds, -ing) ve mastarlar (Infinitives, to + V1), İngilizce\'de fiillerin isim işlevinde kullanıldığı yapılardır. Bazı fiiller sadece gerund, bazıları sadece infinitive, bazıları ise her ikisini de alır. YDS\'de bu ayrım sıklıkla test edilir.',
      rules: [
        {
          formula: 'Gerund alan fiiller: avoid, deny, enjoy, finish, mind, suggest, admit, consider, risk...',
          explanation: 'Bu fiillerden sonra -ing formu gelir.',
        },
        {
          formula: 'Infinitive alan fiiller: decide, hope, want, promise, refuse, agree, threaten, pretend, remind...',
          explanation: 'Bu fiillerden sonra to + V1 gelir.',
        },
        {
          formula: 'Preposition + Gerund: look forward to, be used to, apologize for, complain about...',
          explanation: 'Edatlardan sonra her zaman gerund (-ing) gelir.',
        },
        {
          formula: 'have no choice but to + V1',
          explanation: '"But" edatından sonra to-infinitive gelir (istisna).',
        },
        {
          formula: 'can\'t help + -ing: engelleyememe',
          explanation: '"Can\'t help" yapısından sonra gerund gelir.',
        },
      ],
      examples: [
        { english: 'He denied breaking the window during the argument.', turkish: 'Tartışma sırasında camı kırdığını inkar etti.' },
        { english: 'The students are looking forward to attending the lecture.', turkish: 'Öğrenciler derse katılmayı dört gözle bekliyor.' },
        { english: 'She is used to waking up early in the morning.', turkish: 'Sabah erken kalkmaya alışkın.' },
        { english: 'The factory workers threatened to go on strike.', turkish: 'Fabrika işçileri greve gitmekle tehdit etti.' },
        { english: 'She couldn\'t help laughing when she heard the excuse.', turkish: 'Bahaneyi duyunca gülmekten kendini alamadı.' },
      ],
      ydsPatterns: [
        '"Look forward to + -ing" yapısı çok sık sorulur — "to" edatı olduğu için infinitive sanılır ama gerund alır.',
        '"Be used to + -ing" (alışkın olmak) vs "used to + V1" (eskiden yapmak) ayrımı önemlidir.',
        '"Deny", "avoid", "admit" + -ing yapıları sıkça test edilir.',
        '"Remind someone to do" vs "regret doing" — fiil listesini iyi bilin.',
        'Edat + gerund kuralı: "apologize for arriving", "insist on going" gibi.',
      ],
      commonMistakes: [
        '"Look forward to attend..." YANLIŞ → "to attending" olmalı (to burada edat).',
        '"Be used to wake up..." YANLIŞ → "to waking up" olmalı.',
        '"Deny to break..." YANLIŞ → "deny breaking" olmalı.',
        '"Avoid to use..." YANLIŞ → "avoid using" olmalı.',
      ],
      quickTip: '"To" bir edat mı (look forward to, be used to) yoksa mastar işareti mi? Edat ise -ing gelir, mastar işareti ise V1 gelir.',
    },
    relatedQuestionIds: ['g014', 'g024', 'g031', 'g035', 'g044', 'g045', 'g051', 'g061', 'g063', 'g067', 'g074', 'g077', 'g079', 'g080'],
    order: 8,
  },
  {
    id: 'passive_voice',
    titleTr: 'Edilgen Çatı',
    description: 'Passive voice, passive infinitive, passive gerund',
    theme: 'verb_forms',
    difficulty: 'intermediate',
    icon: 'RefreshCw',
    color: '#6366F1',
    content: {
      introduction:
        'Edilgen çatı (Passive Voice), eylemi yapanın değil, eylemin yapıldığı nesnenin vurgulandığı yapıdır. YDS\'de özellikle passive infinitive (to be done), passive gerund (being done) ve "make" fiilinin passive formu sıklıkla sorulur.',
      rules: [
        {
          formula: 'be + V3 (past participle)',
          explanation: 'Temel edilgen yapı: am/is/are/was/were + V3.',
        },
        {
          formula: 'Passive Infinitive: to be + V3',
          explanation: '"The report is expected to be completed" — edilgen mastar.',
        },
        {
          formula: 'Passive Gerund: being + V3',
          explanation: '"They complained about being given too much homework" — edilgen isim fiil.',
        },
        {
          formula: 'make → be made to + V1',
          explanation: 'Active: "made him do" → Passive: "was made to do" (to eklenir!).',
        },
      ],
      examples: [
        { english: 'The children were made to finish their homework.', turkish: 'Çocuklara ödevlerini bitirmeleri söylendi.' },
        { english: 'The students complained about being given too much homework.', turkish: 'Öğrenciler çok fazla ödev verilmesinden şikayet etti.' },
        { english: 'The report is expected to be completed by this week.', turkish: 'Raporun bu hafta sonuna kadar tamamlanması bekleniyor.' },
        { english: 'The machine needs to be repaired before it can be used.', turkish: 'Makine kullanılmadan önce tamir edilmesi gerekiyor.' },
      ],
      ydsPatterns: [
        '"Were made to + V1" yapısı — active\'de "to" yoktur ama passive\'de "to" eklenir.',
        '"Need + to be V3" veya "need + V-ing" (aynı anlam) yapısı sorulur.',
        '"Is expected/believed/reported to + V1/be V3" yapıları akademik metinlerde yaygındır.',
        'Passive gerund edatlardan sonra gelir: "about being given", "of being chosen".',
      ],
      commonMistakes: [
        '"Were made finish..." YANLIŞ → "were made TO finish" (passive\'de "to" gerekli).',
        '"Need to repair" (active) ile "need to be repaired" (passive) karıştırmak.',
        'Passive gerund yerine active gerund kullanmak: "about giving" vs "about being given".',
        '"Is expected completing" YANLIŞ → "is expected to be completed" olmalı.',
      ],
      quickTip: '"Make" fiilinin passive halinde "to" eklenir: "He was made TO do it" — diğer causative\'lerde bu kural yoktur.',
    },
    relatedQuestionIds: ['g015', 'g037', 'g040', 'g053'],
    order: 9,
  },
  {
    id: 'causatives',
    titleTr: 'Ettirgen Yapı',
    description: 'Have/get/make/let + object + verb forms',
    theme: 'special_structures',
    difficulty: 'intermediate',
    icon: 'Settings',
    color: '#F97316',
    content: {
      introduction:
        'Ettirgen yapılar (Causatives), başkasına bir iş yaptırmayı ifade eder. "Have", "get", "make" ve "let" fiilleri farklı yapılarla kullanılır. YDS\'de özellikle "have someone do" ve "have something done" ayrımı sorulur.',
      rules: [
        {
          formula: 'have + someone + V1 (base form)',
          explanation: 'Birine bir iş yaptırmak (active causative).',
        },
        {
          formula: 'have + something + V3',
          explanation: 'Bir işi birine yaptırmak (passive causative) — kim yaptığı önemli değil.',
        },
        {
          formula: 'get + someone + to + V1',
          explanation: '"Get" ile birini ikna ederek yaptırmak — "to" gerektirir.',
        },
        {
          formula: 'make + someone + V1 (base form)',
          explanation: 'Zorla yaptırmak — "to" KULLANILMAZ (active\'de).',
        },
        {
          formula: 'let + someone + V1 (base form)',
          explanation: 'İzin vermek — "to" kullanılmaz.',
        },
      ],
      examples: [
        { english: 'The teacher had the students revise their essays twice.', turkish: 'Öğretmen öğrencilere makalelerini iki kez gözden geçirtti.' },
        { english: 'I had my car repaired last week.', turkish: 'Geçen hafta arabamı tamir ettirdim.' },
        { english: 'She got her brother to help with the project.', turkish: 'Kardeşini projeye yardım etmeye ikna etti.' },
        { english: 'The boss made everyone work overtime.', turkish: 'Patron herkesi fazla mesai yaptırdı.' },
      ],
      ydsPatterns: [
        '"Have + someone + V1" vs "have + something + V3" ayrımı sıklıkla sorulur.',
        '"Get" ile "have" arasındaki yapısal fark: get + to V1, have + V1.',
        'Passive\'de "make" → "be made TO + V1" olur (active\'de "to" yok, passive\'de var).',
        '"Let" + V1 yapısı: "let" passive yapılmaz, yerine "allow + to V1" kullanılır.',
      ],
      commonMistakes: [
        '"Have someone to revise..." YANLIŞ → "have someone revise" ("to" gereksiz).',
        '"Get someone revise..." YANLIŞ → "get someone to revise" ("to" gerekli).',
        '"Make someone to do..." YANLIŞ → "make someone do" (active\'de "to" yok).',
        '"Have" ile active mi passive mi olduğunu karıştırmak — object kişi ise V1, nesne ise V3.',
      ],
      quickTip: 'Have + KİŞİ + V1 (yaptırmak), Have + NESNE + V3 (yaptırtmak). Get farklı: get + kişi + TO V1.',
    },
    relatedQuestionIds: ['g057'],
    order: 10,
  },
  {
    id: 'connectors',
    titleTr: 'Bağlaçlar',
    description: 'Despite, although, however, no sooner...than',
    theme: 'sentence_structure',
    difficulty: 'intermediate',
    icon: 'ArrowRightLeft',
    color: '#84CC16',
    content: {
      introduction:
        'Bağlaçlar (Connectors/Conjunctions), cümleler veya cümlecikler arasında anlam ilişkisi kuran sözcüklerdir. YDS\'de zıtlık (contrast), neden-sonuç (cause-effect) ve zaman (time) bağlaçları sıkça sorulur.',
      rules: [
        {
          formula: 'Despite/In spite of + noun/-ing (edat)',
          explanation: '"Despite" bir edattır, cümle değil isim veya gerund alır.',
        },
        {
          formula: 'Although/Even though + clause (bağlaç)',
          explanation: '"Although" bir bağlaçtır, tam cümle alır.',
        },
        {
          formula: 'No sooner + had S V3 + than + clause',
          explanation: '"No sooner...than" sabit bir eşlenik bağlaç çiftidir.',
        },
        {
          formula: 'Scarcely/Hardly + had S V3 + when/before + clause',
          explanation: '"Scarcely/Hardly...when" başka bir eşlenik çifttir (than DEĞİL).',
        },
      ],
      examples: [
        { english: 'Despite having studied medicine for years, she decided to pursue law.', turkish: 'Yıllarca tıp okumasına rağmen hukuk kariyeri seçti.' },
        { english: 'No sooner had the plane landed than the passengers rushed to the exit.', turkish: 'Uçak iner inmez yolcular çıkışa koştu.' },
        { english: 'Scarcely had the ceremony begun when a thunderstorm broke out.', turkish: 'Tören başlar başlamaz fırtına koptu.' },
      ],
      ydsPatterns: [
        '"Despite" vs "Although" ayrımı: despite + -ing/noun, although + clause.',
        '"No sooner...than" ve "Hardly/Scarcely...when" eşlenik çiftleri çok sık sorulur.',
        '"However" cümle başında virgülle kullanılır, "but" iki cümleyi birleştirir.',
        '"In spite of the fact that" = "Although" (uzun form).',
      ],
      commonMistakes: [
        '"Despite she studied..." YANLIŞ → "Despite studying..." veya "Despite the fact that she studied..."',
        '"No sooner...when" YANLIŞ → "No sooner...than" olmalı.',
        '"Hardly...than" YANLIŞ → "Hardly...when" olmalı.',
        '"Although" ve "but" birlikte kullanmak (birini seçin).',
      ],
      quickTip: '"No sooner → than", "Hardly/Scarcely → when" — bu eşlenik çiftleri karıştırmayın.',
    },
    relatedQuestionIds: ['g030', 'g043', 'g048'],
    order: 11,
  },
  {
    id: 'comparatives',
    titleTr: 'Karşılaştırma Yapıları',
    description: 'The more...the better, as...as, comparatives/superlatives',
    theme: 'special_structures',
    difficulty: 'beginner',
    icon: 'Scale',
    color: '#0EA5E9',
    content: {
      introduction:
        'Karşılaştırma yapıları (Comparatives & Superlatives), iki veya daha fazla şeyi kıyaslamak için kullanılır. YDS\'de özellikle "the more...the better" paralel yapısı ve düzensiz karşılaştırma formları sorulur.',
      rules: [
        {
          formula: 'The + comparative, the + comparative',
          explanation: 'Paralel karşılaştırma: "The more you practice, the better you become."',
        },
        {
          formula: 'as + adjective + as (eşitlik)',
          explanation: 'İki şeyin eşit olduğunu ifade eder.',
        },
        {
          formula: 'more/less + adjective + than',
          explanation: 'İki heceli ve daha uzun sıfatlarda "more/less" kullanılır.',
        },
        {
          formula: 'adjective + -er + than (kısa sıfatlar)',
          explanation: 'Tek heceli sıfatlarda -er eki kullanılır.',
        },
      ],
      examples: [
        { english: 'The more you practice, the better you will become at solving problems.', turkish: 'Ne kadar çok pratik yaparsan, problem çözmede o kadar iyi olursun.' },
        { english: 'This book is far more interesting than the previous one.', turkish: 'Bu kitap öncekinden çok daha ilginç.' },
        { english: 'She is as talented as her sister.', turkish: 'Kız kardeşi kadar yetenekli.' },
      ],
      ydsPatterns: [
        '"The more...the + comparative" yapısı YDS\'de sıkça sorulur.',
        '"Far/much/a lot + comparative" pekiştirme yapıları.',
        'Düzensiz formlar: good→better→best, bad→worse→worst, far→further→furthest.',
        '"Rather than" ve "would rather...than" karşılaştırma ifadeleri.',
      ],
      commonMistakes: [
        '"The more...the more good" YANLIŞ → "the better" olmalı.',
        '"More better" YANLIŞ → sadece "better" yeterli.',
        '"As good than" YANLIŞ → "as good as" olmalı.',
        'Kısa sıfatlarda "more" kullanmak: "more big" YANLIŞ → "bigger" olmalı.',
      ],
      quickTip: '"The more...the..." yapısında ikinci kısımda da karşılaştırma sıfatı (comparative) kullanılmalıdır.',
    },
    relatedQuestionIds: ['g058'],
    order: 12,
  },
  {
    id: 'wish_would_rather',
    titleTr: 'Wish & Would Rather',
    description: 'Dilek cümleleri, it\'s time yapıları',
    theme: 'special_structures',
    difficulty: 'intermediate',
    icon: 'Sparkles',
    color: '#D946EF',
    content: {
      introduction:
        'Wish ve Would Rather yapıları, gerçek olmayan dilekleri ve tercihleri ifade etmek için kullanılır. YDS\'de bu yapıların zaman kullanımı sıklıkla test edilir.',
      rules: [
        {
          formula: 'wish + Past Simple (şimdiki zaman dileği)',
          explanation: 'Şu an farklı olmasını istediğimiz durumlar için.',
        },
        {
          formula: 'wish + Past Perfect (geçmiş zaman dileği)',
          explanation: 'Geçmişte farklı olmasını istediğimiz durumlar için.',
        },
        {
          formula: 'would rather + V1 (own preference)',
          explanation: 'Kendi tercihimizi ifade ederken yalın fiil kullanılır.',
        },
        {
          formula: 'would rather + someone + Past Simple (başkası için)',
          explanation: 'Başka birinin farklı davranmasını istediğimizde past simple kullanılır.',
        },
        {
          formula: 'It\'s (high/about) time + Past Simple',
          explanation: 'Bir şeyin yapılması gerektiğini vurgulamak için past simple kullanılır.',
        },
      ],
      examples: [
        { english: 'I wish I had more time to prepare for the presentation.', turkish: 'Keşke sunuma hazırlanmak için daha fazla zamanım olsaydı.' },
        { english: 'She would rather stay at home than go to the party.', turkish: 'Partiye gitmektense evde kalmayı tercih eder.' },
        { english: 'She would rather her children spent more time studying.', turkish: 'Çocuklarının daha fazla zaman çalışarak geçirmesini tercih eder.' },
        { english: 'It\'s high time we found a solution to this problem.', turkish: 'Bu soruna bir çözüm bulmamızın zamanı geldi de geçiyor.' },
      ],
      ydsPatterns: [
        '"Wish + past simple" yapısında "were" tüm özneler için kullanılabilir.',
        '"Would rather + başka özne + past simple" yapısı YDS\'de sıkça sorulur.',
        '"It\'s high time + past simple" yapısı çok çıkar — "find" değil "found" doğrudur.',
        '"If only" = "I wish" — aynı yapıyı kullanır.',
      ],
      commonMistakes: [
        '"Wish I have..." YANLIŞ → "wish I had" olmalı.',
        '"Would rather to stay" YANLIŞ → "would rather stay" (to kullanılmaz).',
        '"Would rather her children spend..." YANLIŞ → "spent" (başka özne = past simple).',
        '"It\'s time we find..." YANLIŞ → "found" olmalı (past simple).',
      ],
      quickTip: '"Would rather" + kendi özne → V1, "would rather" + başka özne → Past Simple.',
    },
    relatedQuestionIds: ['g022', 'g038', 'g041', 'g071'],
    order: 13,
  },
  {
    id: 'cleft_sentences',
    titleTr: 'Vurgulu Cümleler',
    description: 'It is/was...that/who, What...is/was yapıları',
    theme: 'special_structures',
    difficulty: 'advanced',
    icon: 'Focus',
    color: '#7C3AED',
    content: {
      introduction:
        'Vurgulu cümleler (Cleft Sentences), cümlenin belirli bir öğesini öne çıkarmak için kullanılan yapılardır. "It is/was...that/who" ve "What...is/was" en yaygın formlarıdır. YDS\'de özellikle "It was not until...that" yapısı sıkça sorulur.',
      rules: [
        {
          formula: 'It is/was + vurgulanan öğe + that/who + geri kalan',
          explanation: 'Cümlenin herhangi bir öğesini vurgulamak için kullanılır.',
        },
        {
          formula: 'It was not until + time/event + that + clause',
          explanation: '"...kadar olmadı" anlamında zaman vurgusu yapar.',
        },
        {
          formula: 'What + S + V + is/was + vurgulanan öğe',
          explanation: '"Yapılan şey..." anlamında eylemi vurgular.',
        },
      ],
      examples: [
        { english: 'It was not until the 20th century that women gained the right to vote.', turkish: '20. yüzyıla kadar kadınlar oy hakkı kazanmadı.' },
        { english: 'It was John who solved the problem, not Mary.', turkish: 'Problemi çözen John\'du, Mary değil.' },
        { english: 'What we need is a comprehensive plan.', turkish: 'İhtiyacımız olan kapsamlı bir plan.' },
      ],
      ydsPatterns: [
        '"It was not until...that" yapısı YDS\'de çok sık sorulur — "that" bağlacı gereklidir.',
        '"Such was...that" yapısı hem devrik hem vurgulu cümle özelliği taşır.',
        '"What" ile başlayan vurgulu cümleler paragraf sorularında karşınıza çıkabilir.',
        '"It is + kişi + who", "It is + nesne/zaman + that" ayrımı yapılır.',
      ],
      commonMistakes: [
        '"It was not until...when" YANLIŞ → "that" kullanılmalı.',
        '"It was not until...which" YANLIŞ → "that" olmalı.',
        'Vurgulu cümle yapısını devrik cümle ile karıştırmak.',
        '"What" ile başlayan cümlede çoğul fiil kullanmak — genellikle tekil olur.',
      ],
      quickTip: '"It was not until...that" kalıbında boşluk "that" için ayrılmıştır — "when" veya "which" yanlış olur.',
    },
    relatedQuestionIds: ['g019', 'g065'],
    order: 14,
  },
  {
    id: 'modals',
    titleTr: 'Kiplik Fiiller',
    description: 'Can, could, may, might, must, should, would yapıları',
    theme: 'verb_forms',
    difficulty: 'intermediate',
    icon: 'Key',
    color: '#475569',
    content: {
      introduction:
        'Kiplik fiiller (Modal Verbs), olasılık, zorunluluk, yetenek, izin ve tahmin gibi anlamları ifade eden yardımcı fiillerdir. YDS\'de özellikle geçmiş modal yapıları (must have done, could have done) ve resmi/akademik kullanımları sorulur.',
      rules: [
        {
          formula: 'must + V1: zorunluluk / kesin çıkarım',
          explanation: '"Must" güçlü zorunluluk veya kesin tahmin bildirir.',
        },
        {
          formula: 'must have + V3: geçmişe dair kesin çıkarım',
          explanation: '"Kesinlikle yapmış olmalı" anlamında kullanılır.',
        },
        {
          formula: 'could have + V3: geçmişte yapılabilirdi ama yapılmadı',
          explanation: 'Kaçırılmış fırsat veya olasılık bildirir.',
        },
        {
          formula: 'should have + V3: yapılmalıydı ama yapılmadı',
          explanation: 'Pişmanlık veya eleştiri ifade eder.',
        },
        {
          formula: 'Were/Should + S + V (inverted modal conditionals)',
          explanation: 'Resmi/akademik dilde devrik koşul yapıları.',
        },
      ],
      examples: [
        { english: 'Were the government to implement stricter regulations, pollution would decrease.', turkish: 'Hükümet daha sıkı düzenlemeler uygulasaydı, kirlilik azalırdı.' },
        { english: 'Should you encounter any difficulties, do not hesitate to contact us.', turkish: 'Herhangi bir zorlukla karşılaşırsanız, bizimle iletişime geçmekten çekinmeyin.' },
        { english: 'He must have forgotten about the meeting.', turkish: 'Toplantıyı unutmuş olmalı.' },
        { english: 'She could have won the competition if she had tried harder.', turkish: 'Daha çok çabalasaydı yarışmayı kazanabilirdi.' },
      ],
      ydsPatterns: [
        '"Were + S + to V1" resmi 2. tip koşul devrik yapısıdır — YDS\'de sık çıkar.',
        '"Should + S + V1" resmi 1. tip koşul devrik yapısıdır.',
        '"Only by + -ing + can/could + S + V1" devrik yapısında modal kullanımı.',
        'Geçmiş modal yapıları (must have V3, could have V3) paragraf sorularında çıkar.',
      ],
      commonMistakes: [
        '"Must" ile "have to" anlam farkı: "must" kişisel zorunluluk, "have to" dışsal zorunluluk.',
        '"Should + S + V1" yapısını "should" + cümle ile karıştırmak.',
        'Geçmiş modallarda "must had done" YANLIŞ → "must have done" olmalı.',
        '"Can" geçmiş zamanda kullanılamaz → "could" veya "was able to" kullanılır.',
      ],
      quickTip: 'Devrik koşul cümlelerinde "Were" = 2. tip, "Had" = 3. tip, "Should" = 1. tip koşul anlamına gelir.',
    },
    relatedQuestionIds: ['g036'],
    order: 15,
  },
];

export const grammarThemeLabels: Record<string, string> = {
  all: 'Tümü',
  sentence_structure: 'Cümle Yapısı',
  verb_forms: 'Fiil Biçimleri',
  clauses: 'Cümlecikler',
  special_structures: 'Özel Yapılar',
};

export const grammarDifficultyLabels: Record<string, string> = {
  all: 'Tümü',
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};
