import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  currentScreen?: string;
}

// Fallback intelligent response generator when Gemini API is unavailable or key not configured
function generateIntelligentFallback(query: string, currentScreen?: string): string {
  const q = query.toLowerCase().trim();

  // Screen Search & Navigation intents
  if (q.includes('teklif') || q.includes('quote') || q.includes('fiyat')) {
    if (q.includes('oluştur') || q.includes('yeni') || q.includes('hazırla')) {
      return `Yeni bir kiralama teklifi hazırlamak için doğrudan **Otomatik Teklif Oluşturucu** sihirbazını başlatabilir veya **Teklif Yönetimi** ekranına geçebilirsiniz.\n\n` +
        `Bu sihirbaz ile araç segmenti, adet, kiralama vadesi (ay) ve yıllık km limitini belirleyerek anında maliyet ve kâr marjı analizi yapabilirsiniz.\n\n` +
        `[ACTION:open_quote:Yeni Teklif Sihirbazını Aç]\n[NAVIGATE:quotations:Teklif Yönetimi Ekranına Git]`;
    }
    return `**Teklif Yönetimi** ekranından tüm aktif, onay bekleyen ve sonuçlanan filo kiralama tekliflerini görüntüleyebilir, PDF teklif mektubu çıktısı alabilir veya teklif revizyonlarını inceleyebilirsiniz.\n\n` +
      `[NAVIGATE:quotations:Teklif Yönetimi Ekranına Git]\n[ACTION:open_quote:Yeni Teklif Oluştur]`;
  }

  if (q.includes('teslimat') || q.includes('şasi') || q.includes('plaka') || q.includes('hazırlık') || q.includes('araç teslim')) {
    return `**Teslimat & Hazırlık** ekranı üzerinden sipariş edilen araçların aşama takibini gerçekleştirebilirsiniz:\n\n` +
      `• Şasi Tahsisi ve Uygunluk Kontrolü\n` +
      `• Plaka & Tescil İşlemleri\n` +
      `• Aksesuar, Cam Filmi ve Kış Lastiği Montajı\n` +
      `• Bayi/Lojistik Transferi\n` +
      `• Müşteri Teslimat & İmzalı Teslim-Tesellüm Tutanağı\n\n` +
      `[NAVIGATE:delivery:Teslimat & Hazırlık Takibine Git]`;
  }

  if (q.includes('kkb') || q.includes('findeks') || q.includes('kredi') || q.includes('istihbarat') || q.includes('limit') || q.includes('mali')) {
    return `**Finansal İstihbarat & KKB** ekranında kurumsal müşterilerin kredi değerliliği analiz edilir:\n\n` +
      `• Findeks Ticari Kredi Skoru (1-1900)\n` +
      `• GİB Onaylı Yıllık Ciro ve Özkaynak Oranları\n` +
      `• Kredi Komitesi Karar Durumu (Onay / Ek Teminat / Red)\n` +
      `• Teminat Koşulları (DBS - Doğrudan Borçlanma Sistemi, Banka Teminat Mektubu)\n\n` +
      `[NAVIGATE:credit:Finansal İstihbarat & KKB Ekranına Git]`;
  }

  if (q.includes('hgs') || q.includes('ogs') || q.includes('ceza') || q.includes('trafik') || q.includes('ön fatura') || q.includes('yansıt')) {
    return `**HGS & Ceza Ön Fatura** ekranında Karayolları (KGM) ve EGM trafik cezaları sisteme aktarılır:\n\n` +
      `• Araç plakası ve geçiş/ceza tarihi o tarihteki aktif sözleşmeyle otomatik eşleştirilir.\n` +
      `• Ceza tutarı ve %25 erken ödeme indirim hakkı hesaplanır.\n` +
      `• Bir sonraki cari dönem kiralama faturasına otomatik ek yansıtma kalemi olarak dahil edilir.\n\n` +
      `[NAVIGATE:prebilling:HGS & Ceza Ön Fatura Ekranına Git]`;
  }

  if (q.includes('görev') || q.includes('iş') || q.includes('task') || q.includes('kuyruk') || q.includes('sla') || q.includes('sorumlu')) {
    if (q.includes('aç') || q.includes('oluştur') || q.includes('yeni') || q.includes('ekle')) {
      return `Satış destek ve filo operasyon ekibine yeni bir operasyonel görev atamak için formu doldurabilirsiniz.\n\n` +
        `[ACTION:open_task:Yeni Görev Oluştur]\n[NAVIGATE:tasks:İş Kuyruğuna Git]`;
    }
    return `**İş Kuyruğu** ekranında acil ve bekleyen tüm operasyonel görevler listelenir:\n\n` +
      `• SLA süresine kalan zaman takibi (Geciken işler kırmızı alarm verir)\n` +
      `• Görev atama, durum güncelleme (Yapılacak, İnceleniyor, Tamamlandı)\n` +
      `• Kontrol listesi (Checklist) ve görev içi not geçmişi\n\n` +
      `[NAVIGATE:tasks:İş Kuyruğu Ekranına Git]\n[ACTION:open_task:Yeni Görev Oluştur]`;
  }

  if (q.includes('sözleşme') || q.includes('kontrat') || q.includes('yenileme') || q.includes('vade') || q.includes('zeyilname') || q.includes('iade')) {
    return `**Sözleşme ve Yenileme** ekranı üzerinden filo sözleşme yaşam döngüsünü yönetebilirsiniz:\n\n` +
      `• Vadesi 30, 60, 90 gün içinde dolacak araçlar için proaktif yenileme teklifleri\n` +
      `• Erken araç iade ve erken fesih tazminat hesaplamaları\n` +
      `• Filoya ek araç dahil etme veya şart değişikliği için zeyilname düzenleme\n\n` +
      `[NAVIGATE:contracts:Sözleşme & Yenileme Ekranına Git]`;
  }

  if (q.includes('evrak') || q.includes('belge') || q.includes('imza') || q.includes('vergi') || q.includes('sicil')) {
    return `**Evrak Kontrolü** ekranında müşterilerin yasal kurumsal belgeleri denetlenir:\n\n` +
      `• İmza Sirküleri geçerlilik süresi ve yetkili imzalar\n` +
      `• Güncel Vergi Levhası ve Ticaret Sicil Gazetesi\n` +
      `• Eksik evrak risk skoru takibi ve müşteri evrak talep bildirimleri\n\n` +
      `[NAVIGATE:documents:Evrak Kontrolü Ekranına Git]`;
  }

  if (q.includes('itiraz') || q.includes('dispute') || q.includes('hatalı fatura') || q.includes('düzeltme')) {
    return `**Fatura İtirazları** ekranında müşterilerin ilettiği itiraz kayıtları çözümlenir:\n\n` +
      `• HGS mükerrer çekim veya araç teslimi sonrası ceza itirazları\n` +
      `• Kök neden tespiti (Sistem Hatası, Sözleşme Hatası, Müşteri Yanılgısı)\n` +
      `• İtiraz onaylama durumunda iade/düzeltme faturası (Ters Kayıt) tetikleme\n\n` +
      `[NAVIGATE:disputes:Fatura İtirazları Ekranına Git]`;
  }

  if (q.includes('portal') || q.includes('müşteri') || q.includes('b2b') || q.includes('talep')) {
    return `**B2B Müşteri Portalı** kurumsal müşterilerin self-servis taleplerini yönettiği modüldür:\n\n` +
      `• Filo yöneticilerinin ek araç ve geçici ikame talepleri\n` +
      `• Periyodik bakım randevu istekleri ve lastik değişim randevuları\n` +
      `• Adres ve fatura bilgi güncelleme başvuruları\n\n` +
      `[NAVIGATE:customerportal:B2B Müşteri Portalı Ekranına Git]`;
  }

  if (q.includes('otomasyon') || q.includes('kural') || q.includes('tetikleyici') || q.includes('workflow')) {
    return `**Otomasyon Kuralları** ekranında kural bazlı iş akışları tanımlanır:\n\n` +
      `• Belirli tutarın altındaki tekliflerin otomatik onaylanması\n` +
      `• Süresi 2 saati aşan görevlerin takım liderine otomatik eskalasyonu\n` +
      `• KKB skoru 1300'ün altındaki başvuruların doğrudan Kredi Komitesine yönlendirilmesi\n\n` +
      `[NAVIGATE:automation:Otomasyon Kuralları Ekranına Git]`;
  }

  if (q.includes('analitik') || q.includes('grafik') || q.includes('rapor') || q.includes('karlılık') || q.includes('dönüşüm')) {
    return `**Satış Analitiği** ekranında satış operasyonlarının performans göstergeleri incelenir:\n\n` +
      `• Teklif kazanma/kaybetme (Win/Loss) oranları ve kayıp nedenleri dağılımı\n` +
      `• Filo segment bazlı ortalama kâr marjları ve kiralama vadeleri\n` +
      `• Satış temsilcisi dönüşüm performansı ve hedef gerçekleşme\n\n` +
      `[NAVIGATE:analytics:Satış Analitiği Ekranına Git]`;
  }

  if (q.includes('veri') || q.includes('kaynak') || q.includes('sap') || q.includes('salesforce') || q.includes('entegrasyon')) {
    return `**Veri Kaynakları** ekranında dış sistem bağlantıları denetlenir:\n\n` +
      `• SAP ERP (Faturalama & Muhasebe)\n` +
      `• Salesforce CRM (Müşteri & Fırsat Yönetimi)\n` +
      `• GİB (Gelir İdaresi e-Fatura & Mükellef Kontrolü)\n` +
      `• KKB / Findeks (Kredi Notu Sorgulama)\n` +
      `• Turpak Taşıt Tanıma (Yakıt Tüketim Entegrasyonu)\n\n` +
      `[NAVIGATE:datasources:Veri Kaynakları Ekranına Git]`;
  }

  if (q.includes('ayar') || q.includes('profil') || q.includes('parametre') || q.includes('tolerans')) {
    return `**Ayarlar** ekranından genel sistem toleransları, marj hedefleri, SLA süreleri ve e-posta bildirim kuralları yapılandırılabilir.\n\n` +
      `[NAVIGATE:settings:Ayarlar Ekranına Git]`;
  }

  if (q.includes('nerede') || q.includes('bulamadım') || q.includes('nasıl') || q.includes('yardım') || q.includes('merhaba') || q.includes('selam')) {
    return `Merhaba! Ben **SalesOps Akıllı Asistanı**'yım. Size filo kiralama satış operasyonları, iş süreçleri ve sistem ekranları konusunda rehberlik edebilirim.\n\n` +
      `Hızlıca gitmek istediğiniz alanı seçebilir veya doğrudan sorunuzu yazabilirsiniz:\n\n` +
      `[NAVIGATE:overview:Genel Bakışa Git]\n` +
      `[NAVIGATE:quotations:Teklif Yönetimi]\n` +
      `[NAVIGATE:delivery:Teslimat & Hazırlık]\n` +
      `[NAVIGATE:tasks:İş Kuyruğu]\n` +
      `[ACTION:open_quote:Yeni Teklif Oluştur]\n` +
      `[ACTION:open_task:Yeni Görev Aç]`;
  }

  // Default guidance response with context
  return `Aradığınız konuyla ilgili olarak aşağıdaki ekranlardan birine doğrudan geçiş yapabilir veya detaylı bilgi alabilirsiniz:\n\n` +
    `• Teklif hazırlamak ve fiyat revizyonları için **Teklif Yönetimi**\n` +
    `• Açık işleri ve SLA sürelerini görmek için **İş Kuyruğu**\n` +
    `• Şasi tescil ve lojistik hazırlığı için **Teslimat & Hazırlık**\n` +
    `• Findeks ve mali istihbarat için **Finansal İstihbarat & KKB**\n\n` +
    `[NAVIGATE:quotations:Teklif Yönetimine Git]\n` +
    `[NAVIGATE:tasks:İş Kuyruğuna Git]\n` +
    `[NAVIGATE:delivery:Teslimat & Hazırlık Ekranına Git]\n` +
    `[ACTION:open_quote:Yeni Teklif Sihirbazını Aç]`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini API client if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }

  // API Health Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!apiKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat API Endpoint
  app.post('/api/chat', async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
    const { message, history = [], currentScreen = 'overview' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Mesaj metni gereklidir.' });
      return;
    }

    // If Gemini client is configured, call Gemini API
    if (ai) {
      try {
        const systemInstruction = `Sen "SalesOps Intelligence" kurumsal filo kiralama ve satış operasyonları uzman rehber asistanısın.
Kullanıcılar filo kiralama operasyonları, teklif hazırlama, iş kuyruğu, teslimat, finansal istihbarat (KKB/Findeks), fatura itirazları, HGS/ceza ön faturalama, müşteri portali ve otomasyon süreçleri hakkında sana soru sorar veya bulamadıkları ekranları ararlar.

Kullanıcının şu an bulunduğu ekran: "${currentScreen}".

Platformdaki 14 Ekran ve İşlevleri:
1. overview: "Genel Bakış" - Dashboard, operasyonel KPI'lar, bekleyen acil onaylar, aktivite özeti.
2. tasks: "İş Kuyruğu" - Tüm operasyonel görevler, SLA süreleri, filtreleme, önceliklendirme, görev notları ve checklist.
3. quotations: "Teklif Yönetimi" - Araç kiralama teklifleri oluşturma, marj/maliyet analizi, resmi PDF teklif formu görüntüleme/yazdırma.
4. contracts: "Sözleşme ve Yenileme" - Aktif filo sözleşmeleri, vadesi yaklaşan yenilemeler (30-60-90 gün), erken iade ve zeyilname.
5. documents: "Evrak Kontrolü" - Müşteri resmi belgeleri (İmza Sirküleri, Vergi Levhası, Ticaret Sicil Gazetesi), eksik evrak risk analizi.
6. disputes: "Fatura İtirazları" - Müşteri HGS/ceza/hasar itirazları, kök neden analizi, ters kayıt/düzeltme faturası süreçleri.
7. delivery: "Teslimat & Hazırlık" - Şasi tahsis, plaka tescil, aksesuar/kış lastiği montajı, lojistik transfer ve teslim tutanağı.
8. credit: "Finansal İstihbarat & KKB" - Findeks skoru, GİB ciro ve özkaynak bilançosu, kredi komite onayı, önerilen limit ve teminat şartı.
9. prebilling: "HGS & Ceza Ön Fatura" - HGS/OGS geçişleri ve trafik cezalarının sözleşme/plaka eşleştirilmesi, fatura öncesi mutabakat ve yansıtma.
10. customerportal: "B2B Müşteri Portalı" - Kurumsal müşterilerin ek araç, ikame araç ve periyodik bakım başvuruları.
11. automation: "Otomasyon Kuralları" - Kural bazlı iş akışları, otomatik SLA eskalasyonu, KKB risk yönlendirmesi.
12. analytics: "Satış Analitiği" - Teklif dönüşüm oranları (Win/Loss), kayıp nedenleri analizi, filo segment karlılığı.
13. datasources: "Veri Kaynakları" - SAP, Salesforce, GİB, KKB/Findeks, Turpak entegrasyon durumları ve veri tazeliği.
14. settings: "Ayarlar" - Tolerans limitleri, marj hedefleri, SLA parametreleri ve yetki ayarları.

Özel Hızlı İşlemler:
- action:open_quote (Otomatik / Yeni Teklif Oluşturma Sihirbazını Açar)
- action:open_task (Yeni Operasyonel Görev Açma Penceresini Açar)

Cevap Kuralları:
1. Yanıtları her zaman Türkçe, nazik, net ve profesyonel bir üslupla ver.
2. Açıklayıcı ve adım adım rehberlik sun.
3. Kullanıcının doğrudan ekrana veya işleme geçebilmesi için mesajının içerisine veya sonuna mutlaka uygun eylem buton etiketlerini ekle:
   - [NAVIGATE:ekran_id:Buton Metni] (örnek: [NAVIGATE:quotations:Teklif Yönetimine Git], [NAVIGATE:delivery:Teslimat Takibine Git], [NAVIGATE:tasks:İş Kuyruğuna Git], [NAVIGATE:credit:Finansal İstihbarat Ekranına Git], vb.)
   - [ACTION:open_quote:Yeni Teklif Sihirbazını Aç]
   - [ACTION:open_task:Yeni Görev Oluştur]
4. Eğer kullanıcı bir süreç veya prosedür soruyorsa (örneğin "Teslimat süreci nasıl işler?", "KKB limit kuralı nedir?", "Fatura itirazı nasıl çözülür?"), sektörel filo standartlarına uygun adımları maddeler halinde açıkla.`;

        // Format recent conversation context
        const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        // Include last 6 turns from history
        const recentHistory = history.slice(-6);
        for (const h of recentHistory) {
          formattedContents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          });
        }

        // Add current user message
        formattedContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const replyText = geminiResponse.text || generateIntelligentFallback(message, currentScreen);
        res.json({ reply: replyText, source: 'gemini' });
        return;
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to rule engine:', geminiError);
        // Fallback gracefully
        const fallbackText = generateIntelligentFallback(message, currentScreen);
        res.json({ reply: fallbackText, source: 'fallback' });
        return;
      }
    }

    // Default to intelligent rule-based knowledge engine
    const reply = generateIntelligentFallback(message, currentScreen);
    res.json({ reply, source: 'local' });
  });

  // Mount Vite middleware in development, or serve static dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SalesOps server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
