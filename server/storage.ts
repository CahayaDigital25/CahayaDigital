import { 
  users, type User, type InsertUser,
  articles, type Article, type InsertArticle,
  settings, type Settings, type InsertSettings,
  subscribers, type Subscriber, type InsertSubscriber
} from "@shared/schema";
import { db, pool } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Article operations
  getArticles(limit?: number, offset?: number): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticlesByCategory(category: string, limit?: number, offset?: number): Promise<Article[]>;
  getFeaturedArticles(limit?: number): Promise<Article[]>;
  getBreakingNews(limit?: number): Promise<Article[]>;
  getEditorsPicks(limit?: number): Promise<Article[]>;
  getPopularArticles(limit?: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  incrementArticleViews(id: number): Promise<void>;
  
  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Subscriber operations
  addSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscribers(): Promise<Subscriber[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private settingsRecord: Settings;
  private subscribers: Map<number, Subscriber>;
  private userCurrentId: number;
  private articleCurrentId: number;
  private subscriberCurrentId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.subscribers = new Map();
    this.userCurrentId = 1;
    this.articleCurrentId = 1;
    this.subscriberCurrentId = 1;
    
    // Add admin user
    this.createUser({
      username: "Onomah1337*$",
      password: "Onomah1337*$",
      fullName: "Administrator",
      email: "admin@cahayadigital25.com",
      role: "admin",
      isActive: true
    });
    
    // Initialize default settings
    this.settingsRecord = {
      id: 1,
      siteName: "CahayaDigital25",
      logoText: "CD",
      primaryColor: "#e53e3e",
      secondaryColor: "#333333",
      accentColor: "#f6ad55"
    };
    
    // Initialize sample articles
    this.seedArticles();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName ?? null,
      email: insertUser.email ?? null,
      role: insertUser.role ?? "editor",
      isActive: insertUser.isActive ?? true,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Article operations
  async getArticles(limit = 100, offset = 0): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticlesByCategory(category: string, limit = 100, offset = 0): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.category === category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);
  }
  
  async getFeaturedArticles(limit = 3): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isFeatured)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async getBreakingNews(limit = 1): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isBreaking)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async getEditorsPicks(limit = 1): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isEditorsPick)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async getPopularArticles(limit = 5): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleCurrentId++;
    const now = new Date();
    const article: Article = { 
      id,
      title: insertArticle.title,
      content: insertArticle.content,
      summary: insertArticle.summary,
      category: insertArticle.category,
      imageUrl: insertArticle.imageUrl ?? null,
      author: insertArticle.author ?? null,
      authorImage: insertArticle.authorImage ?? null,
      isFeatured: insertArticle.isFeatured ?? false,
      isBreaking: insertArticle.isBreaking ?? false,
      isEditorsPick: insertArticle.isEditorsPick ?? false,
      publishedAt: now,
      views: 0
    };
    
    this.articles.set(id, article);
    return article;
  }
  
  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...articleUpdate };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }
  
  async incrementArticleViews(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.articles.set(id, article);
    }
  }
  
  // Settings operations
  async getSettings(): Promise<Settings> {
    return this.settingsRecord;
  }
  
  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    this.settingsRecord = { ...this.settingsRecord, ...settingsUpdate };
    return this.settingsRecord;
  }
  
  // Subscriber operations
  async addSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    // Check if email already exists
    const existingSubscriber = Array.from(this.subscribers.values()).find(
      sub => sub.email === insertSubscriber.email
    );
    
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.subscriberCurrentId++;
    const now = new Date();
    const subscriber: Subscriber = { 
      ...insertSubscriber, 
      id, 
      subscribedAt: now
    };
    
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  
  async getSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
  
  // Seed sample data
  private seedArticles() {
    const sampleArticles: InsertArticle[] = [
      {
        title: "Kebijakan Ekonomi Digital Terbaru Diresmikan oleh Pemerintah",
        content: `<p>Pemerintah Indonesia telah meresmikan kebijakan ekonomi digital terbaru yang bertujuan untuk mendorong pertumbuhan sektor teknologi dan inovasi di tanah air. Kebijakan ini mencakup berbagai insentif fiskal bagi startup dan perusahaan teknologi, serta menyederhanakan proses perizinan.</p><p>Menteri Koordinator Bidang Perekonomian menyatakan bahwa kebijakan ini diharapkan dapat mempercepat transformasi digital Indonesia dan mendorong pertumbuhan ekonomi berbasis teknologi yang inklusif.</p><p>Beberapa poin utama dari kebijakan tersebut meliputi:</p><ul><li>Insentif pajak untuk investasi di bidang riset dan pengembangan teknologi</li><li>Kemudahan perizinan bagi startup teknologi</li><li>Program pendanaan untuk pengembangan infrastruktur digital di daerah tertinggal</li><li>Regulasi yang mendukung ekonomi berbagi (sharing economy)</li></ul><p>Para pelaku industri menyambut positif kebijakan ini dan berharap implementasinya dapat dilakukan secara konsisten untuk memberikan kepastian usaha.</p>`,
        summary: "Pemerintah telah mengumumkan serangkaian kebijakan baru yang bertujuan untuk mendorong perkembangan ekonomi digital di Indonesia.",
        category: "ekonomi",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        author: "Budi Santoso",
        authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
        isFeatured: true,
        isBreaking: true,
        isEditorsPick: false
      },
      {
        title: "5 Terobosan Teknologi yang Akan Mengubah Masa Depan",
        content: `<p>Perkembangan teknologi terus bergerak dengan cepat dan beberapa inovasi terbaru diprediksi akan mengubah cara kita hidup di masa depan. Berikut adalah 5 terobosan teknologi yang perlu diperhatikan:</p><h3>1. Komputasi Kuantum</h3><p>Komputer kuantum menjanjikan kemampuan komputasi yang jauh melampaui komputer konvensional. Beberapa perusahaan teknologi besar telah mencapai "supremasi kuantum" dan terus mengembangkan teknologi ini untuk aplikasi praktis.</p><h3>2. Kecerdasan Buatan Generatif</h3><p>AI yang dapat menghasilkan konten kreatif seperti teks, gambar, musik, dan kode program terus berkembang pesat, membuka kemungkinan baru dalam berbagai industri.</p><h3>3. Bioteknologi CRISPR</h3><p>Teknologi pengeditan gen CRISPR membuka jalan bagi pengobatan penyakit genetik dan peningkatan ketahanan pangan melalui modifikasi genetik yang lebih presisi.</p><h3>4. Internet of Things (IoT) dengan 5G</h3><p>Kombinasi IoT dengan jaringan 5G akan memungkinkan lebih banyak perangkat terhubung dengan latensi rendah, mendukung smart city dan otomatisasi industri.</p><h3>5. Energi Terbarukan dengan Penyimpanan Baterai Canggih</h3><p>Kemajuan dalam teknologi penyimpanan energi membuat sumber energi terbarukan semakin layak secara ekonomi dan mendukung transisi energi global.</p>`,
        summary: "Inovasi dan perkembangan teknologi terkini yang diprediksi akan membawa perubahan besar.",
        category: "teknologi",
        imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        author: "Dian Kusuma",
        authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "Startup Lokal Berhasil Menggalang Dana Rp 200 Miliar",
        content: `<p>Sebuah startup teknologi finansial (fintech) asal Indonesia baru saja mengumumkan keberhasilannya menggalang dana seri B senilai Rp 200 miliar (sekitar US$ 14 juta) dari beberapa investor global terkemuka.</p><p>Pendanaan ini dipimpin oleh firma ventura capital asal Singapura dengan partisipasi dari beberapa investor lain dari Asia, Amerika Serikat, dan Eropa. Dana tersebut akan digunakan untuk memperluas layanan dan jangkauan geografis perusahaan.</p><p>CEO startup tersebut menyatakan bahwa pendanaan ini merupakan bukti kepercayaan investor terhadap potensi pasar fintech Indonesia dan kemampuan tim dalam mengeksekusi visi perusahaan.</p><p>"Kami berencana menggunakan dana ini untuk mengembangkan teknologi kami, memperluas jangkauan layanan ke lebih banyak kota di Indonesia, dan memulai ekspansi ke beberapa negara Asia Tenggara lainnya dalam 12-18 bulan ke depan," ujarnya.</p><p>Perusahaan ini memiliki lebih dari 2 juta pengguna aktif dan telah memproses transaksi senilai lebih dari Rp 1 triliun selama tahun lalu. Pencapaian ini menunjukkan pertumbuhan signifikan ekosistem startup di Indonesia yang terus menarik perhatian investor global.</p>`,
        summary: "Pencapaian besar untuk ekosistem startup lokal dengan pendanaan seri B yang signifikan.",
        category: "ekonomi",
        imageUrl: "https://images.unsplash.com/photo-1483389127117-b6a2102724ae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        author: "Rina Wijaya",
        authorImage: "https://randomuser.me/api/portraits/women/68.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "Pemerintah dan DPR Sepakat Sahkan Undang-Undang Baru",
        content: `<p>Pemerintah dan DPR RI telah mencapai kesepakatan untuk mengesahkan undang-undang baru yang mengatur tentang perlindungan data pribadi warga negara. Undang-undang ini disahkan setelah melalui proses pembahasan yang panjang dan melibatkan berbagai pemangku kepentingan.</p><p>Menteri Komunikasi dan Informatika menyatakan bahwa undang-undang ini merupakan langkah penting dalam melindungi privasi warga negara di era digital dan memberikan kerangka hukum yang jelas bagi perusahaan yang mengelola data pribadi.</p><p>Beberapa aturan penting dalam undang-undang tersebut meliputi:</p><ul><li>Kewajiban meminta persetujuan eksplisit sebelum mengumpulkan dan menggunakan data pribadi</li><li>Hak warga negara untuk mengakses, menghapus, dan memperbarui data pribadi mereka</li><li>Sanksi tegas bagi pihak yang melanggar ketentuan perlindungan data</li><li>Pembentukan badan pengawas independen untuk memastikan implementasi undang-undang</li></ul><p>Para aktivis digital menyambut positif pengesahan undang-undang ini, namun tetap menekankan pentingnya implementasi yang konsisten dan pengawasan yang ketat untuk memastikan efektivitasnya.</p>`,
        summary: "Undang-undang baru telah disahkan setelah melewati beberapa kali diskusi di DPR.",
        category: "politik",
        imageUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        author: "Hendra Pratama",
        authorImage: "https://randomuser.me/api/portraits/men/42.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "Smart City: Masa Depan Perkotaan di Indonesia",
        content: `<p>Konsep Smart City atau Kota Cerdas mulai diterapkan di beberapa kota besar di Indonesia untuk meningkatkan efisiensi layanan publik dan kualitas hidup masyarakat perkotaan. Dengan mengintegrasikan teknologi Internet of Things (IoT) dan kecerdasan buatan (AI), pemerintah daerah berupaya mengatasi berbagai tantangan perkotaan seperti kemacetan, pengelolaan limbah, dan efisiensi energi.</p><p>Jakarta, Bandung, dan Surabaya menjadi pionir dalam implementasi konsep Smart City di Indonesia. Di Jakarta, sistem manajemen lalu lintas cerdas telah membantu mengurangi kemacetan hingga 20% di beberapa ruas jalan utama. Sementara itu, Bandung telah mengembangkan aplikasi pelaporan masyarakat yang memudahkan warga melaporkan masalah infrastruktur dan mendapatkan respons cepat dari pemerintah kota.</p><p>Beberapa komponen utama Smart City yang dikembangkan di Indonesia meliputi:</p><ul><li>Sistem transportasi cerdas untuk mengurangi kemacetan</li><li>Pengelolaan energi yang efisien untuk bangunan dan penerangan jalan</li><li>Sistem pemantauan lingkungan untuk kualitas udara dan air</li><li>Platform partisipasi publik untuk meningkatkan keterlibatan warga</li><li>Sistem keamanan terintegrasi dengan CCTV dan analitik video</li></ul><p>Para ahli menyatakan bahwa pengembangan Smart City di Indonesia masih menghadapi tantangan seperti keterbatasan infrastruktur digital, kesenjangan digital, dan isu keamanan siber. Namun, dengan dukungan pemerintah pusat dan kolaborasi dengan sektor swasta, implementasi Smart City diharapkan dapat terus berkembang di masa depan.</p>`,
        summary: "Konsep Smart City mulai diterapkan di beberapa kota besar di Indonesia dengan teknologi IoT dan AI.",
        category: "teknologi",
        imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        author: "Andi Firmansyah",
        authorImage: "https://randomuser.me/api/portraits/men/75.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "IHSG Mencatatkan Rekor Tertinggi Sepanjang Masa",
        content: `<p>Indeks Harga Saham Gabungan (IHSG) mencatatkan level tertinggi sepanjang sejarah pasar modal Indonesia pada perdagangan hari ini. IHSG ditutup di level 7.250, naik 2,3% dari penutupan sebelumnya, dan melampaui rekor tertinggi sebelumnya yang tercapai pada awal tahun lalu.</p><p>Menurut para analis, penguatan IHSG didorong oleh beberapa faktor positif, termasuk pertumbuhan ekonomi yang lebih baik dari perkiraan, kebijakan moneter yang akomodatif, dan meningkatnya kepercayaan investor terhadap prospek ekonomi Indonesia.</p><p>"Ini merupakan cerminan dari fundamental ekonomi Indonesia yang kuat dan kepercayaan investor pada arah kebijakan pemerintah," kata seorang ekonom dari sebuah perusahaan sekuritas nasional.</p><p>Sektor yang mencatatkan kenaikan signifikan antara lain:</p><ul><li>Sektor keuangan: naik 3,5%</li><li>Sektor properti: naik 2,8%</li><li>Sektor konsumer: naik 2,6%</li><li>Sektor teknologi: naik 2,1%</li></ul><p>Para analis memperkirakan IHSG masih berpotensi untuk terus menguat dalam jangka menengah, didukung oleh pemulihan ekonomi pasca-pandemi dan arus masuk modal asing yang diperkirakan akan terus berlanjut.</p>`,
        summary: "Indeks Harga Saham Gabungan mencatat level tertinggi sepanjang sejarah pasar modal Indonesia.",
        category: "ekonomi",
        imageUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        author: "Maya Indira",
        authorImage: "https://randomuser.me/api/portraits/women/55.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "Tim Nasional Raih Medali Emas di Kejuaraan Internasional",
        content: `<p>Tim nasional Indonesia berhasil meraih medali emas dalam kejuaraan bulu tangkis internasional yang digelar di Bangkok, Thailand. Prestasi ini menambah koleksi medali Indonesia di kancah olahraga internasional dan kembali mengharumkan nama bangsa.</p><p>Kemenangan tersebut diraih setelah mengalahkan tim tuan rumah Thailand dengan skor telak 3-0 di partai final. Para pemain menunjukkan performa terbaik mereka dan mendominasi pertandingan dari awal hingga akhir.</p><p>Pelatih tim nasional menyatakan kepuasannya atas pencapaian tersebut. "Anak-anak telah bekerja keras selama persiapan dan mereka pantas mendapatkan kemenangan ini. Ini adalah hasil dari latihan intensif dan semangat yang tinggi," ujarnya.</p><p>Beberapa faktor yang berkontribusi pada keberhasilan tim nasional antara lain:</p><ul><li>Program pembinaan atlet yang komprehensif</li><li>Dukungan penuh dari pemerintah dan sponsor</li><li>Strategi permainan yang terus berkembang</li><li>Kemampuan mental atlet yang tangguh</li></ul><p>Kemenangan ini diharapkan dapat menjadi motivasi bagi generasi muda untuk terus berprestasi di bidang olahraga dan mempersiapkan tim untuk menghadapi kompetisi yang lebih besar ke depannya.</p>`,
        summary: "Tim nasional Indonesia berhasil mengharumkan nama bangsa dengan merebut medali emas.",
        category: "olahraga",
        imageUrl: "https://images.unsplash.com/photo-1551854386-b42759a33807?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        author: "Agus Setiawan",
        authorImage: "https://randomuser.me/api/portraits/men/23.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "Sistem Pendidikan Nasional Diperbarui dengan Kurikulum Baru",
        content: `<p>Kementerian Pendidikan dan Kebudayaan resmi mengumumkan pembaruan kurikulum untuk semua jenjang pendidikan di Indonesia. Kurikulum baru ini dirancang untuk menjawab tantangan pendidikan di era digital dan mempersiapkan siswa menghadapi dunia kerja yang terus berubah.</p><p>Menteri Pendidikan menyatakan bahwa kurikulum baru ini berfokus pada pengembangan keterampilan berpikir kritis, kreativitas, komunikasi, dan kolaborasi. "Kita tidak hanya ingin siswa menghafal pelajaran, tetapi juga memahami dan dapat mengaplikasikannya dalam kehidupan nyata," jelasnya.</p><p>Beberapa perubahan utama dalam kurikulum baru meliputi:</p><ul><li>Pembelajaran berbasis proyek dan pemecahan masalah</li><li>Integrasi teknologi digital dalam proses pembelajaran</li><li>Penguatan pendidikan karakter dan kewarganegaraan</li><li>Fleksibilitas dalam penyusunan jadwal dan konten pelajaran</li><li>Sistem penilaian yang lebih komprehensif</li></ul><p>Kurikulum baru ini akan diterapkan secara bertahap mulai tahun ajaran depan, dengan periode transisi untuk memastikan guru dan sekolah siap mengimplementasikannya. Kementerian juga akan menyediakan pelatihan dan dukungan bagi para guru untuk memastikan keberhasilan implementasi.</p><p>Para pengamat pendidikan menyambut positif pembaruan ini, namun juga mengingatkan pentingnya mempertimbangkan kesenjangan infrastruktur dan sumber daya antar daerah untuk memastikan pemerataan kualitas pendidikan di seluruh Indonesia.</p>`,
        summary: "Kementerian Pendidikan mengumumkan pembaruan kurikulum untuk semua jenjang pendidikan.",
        category: "pendidikan",
        imageUrl: "https://images.unsplash.com/photo-1586892478377-002b42a2b39b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        author: "Siti Rahayu",
        authorImage: "https://randomuser.me/api/portraits/women/28.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: false
      },
      {
        title: "Indonesia Targetkan 50% Energi Terbarukan pada 2030",
        content: `<p>Pemerintah Indonesia berkomitmen untuk meningkatkan penggunaan energi terbarukan hingga 50% dari total energi nasional pada tahun 2030. Program ambisius ini merupakan bagian dari strategi transisi energi nasional untuk mengurangi ketergantungan pada bahan bakar fosil dan mencapai target penurunan emisi karbon.</p><p>Menteri Energi dan Sumber Daya Mineral menjelaskan bahwa pencapaian target ini akan didukung oleh investasi besar-besaran pada pembangkit listrik tenaga surya, angin, panas bumi, dan sumber energi terbarukan lainnya. "Indonesia memiliki potensi energi terbarukan yang sangat besar, dan kita perlu memanfaatkannya secara optimal," ujarnya.</p><p>Pemerintah telah menyiapkan beberapa kebijakan pendukung, termasuk:</p><ul><li>Insentif fiskal untuk investasi di bidang energi terbarukan</li><li>Penyederhanaan perizinan untuk proyek energi bersih</li><li>Kerjasama dengan lembaga internasional untuk pendanaan dan transfer teknologi</li><li>Program riset dan pengembangan untuk inovasi energi terbarukan</li></ul><p>Para ahli lingkungan menyambut positif target ini sebagai langkah penting dalam menjawab krisis iklim global, namun juga mengingatkan tentang berbagai tantangan yang perlu diatasi, termasuk hambatan infrastruktur, teknologi, dan pendanaan.</p><p>"Transisi menuju energi terbarukan membutuhkan perubahan fundamental dalam sistem energi kita, dan ini tidak hanya tentang teknologi tetapi juga tentang politik, ekonomi, dan sosial," kata seorang peneliti dari lembaga kajian energi terkemuka.</p><p>Beberapa proyek besar yang sudah berjalan termasuk pembangkit listrik tenaga surya di Kupang dengan kapasitas 5 MW, pembangkit listrik tenaga panas bumi di Patuha dengan kapasitas 55 MW, dan beberapa proyek pembangkit listrik tenaga air skala kecil di berbagai wilayah.</p>`,
        summary: "Pemerintah Indonesia berkomitmen untuk meningkatkan penggunaan energi terbarukan hingga 50% dari total energi nasional pada tahun 2030.",
        category: "gaya_hidup",
        imageUrl: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        author: "Dewi Lestari",
        authorImage: "https://randomuser.me/api/portraits/women/28.jpg",
        isFeatured: false,
        isBreaking: false,
        isEditorsPick: true
      }
    ];
    
    // Add sample articles to storage
    sampleArticles.forEach(article => {
      this.createArticle(article);
    });
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }
  
  // Article operations
  async getArticles(limit = 100, offset = 0): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }
  
  async getArticlesByCategory(category: string, limit = 100, offset = 0): Promise<Article[]> {
    try {
      // Using raw SQL to get articles by category
      const sql = `SELECT * FROM articles WHERE category = $1 ORDER BY published_at DESC LIMIT $2 OFFSET $3`;
      const result = await pool.query(sql, [category, limit, offset]);
      return result.rows as Article[];
    } catch (error) {
      console.error('Error in getArticlesByCategory:', error);
      return [];
    }
  }
  
  async getFeaturedArticles(limit = 3): Promise<Article[]> {
    try {
      // Log the query for debugging
      console.log('Executing featured articles query');
      // Using raw SQL for featured articles
      const sql = `SELECT * FROM articles WHERE is_featured = true ORDER BY published_at DESC LIMIT $1`;
      console.log('SQL Query:', sql, 'Limit:', limit);
      const result = await pool.query(sql, [limit]);
      console.log('Featured articles result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getFeaturedArticles:', error);
      return [];  // Return empty array instead of throwing error
    }
  }
  
  async getBreakingNews(limit = 1): Promise<Article[]> {
    try {
      // Log query for debugging
      console.log('Executing breaking news query');
      // Using raw SQL for breaking news
      const sql = `SELECT * FROM articles WHERE is_breaking = true ORDER BY published_at DESC LIMIT $1`;
      console.log('SQL Query:', sql, 'Limit:', limit);
      const result = await pool.query(sql, [limit]);
      console.log('Breaking news result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getBreakingNews:', error);
      return [];  // Return empty array instead of throwing error
    }
  }
  
  async getEditorsPicks(limit = 1): Promise<Article[]> {
    try {
      // Log query for debugging
      console.log('Executing editors pick query');
      // Using raw SQL for editors picks
      const sql = `SELECT * FROM articles WHERE is_editors_pick = true ORDER BY published_at DESC LIMIT $1`;
      console.log('SQL Query:', sql, 'Limit:', limit);
      const result = await pool.query(sql, [limit]);
      console.log('Editors pick result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getEditorsPicks:', error);
      return [];  // Return empty array instead of throwing error
    }
  }
  
  async getPopularArticles(limit = 5): Promise<Article[]> {
    try {
      // Log query for debugging
      console.log('Executing popular articles query');
      // Using raw SQL for popular articles
      const sql = `SELECT * FROM articles ORDER BY views DESC LIMIT $1`;
      console.log('SQL Query:', sql, 'Limit:', limit);
      const result = await pool.query(sql, [limit]);
      console.log('Popular articles result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getPopularArticles:', error);
      return [];  // Return empty array instead of throwing error
    }
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }
  
  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set(articleUpdate)
      .where(eq(articles.id, id))
      .returning();
    return article;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning({ id: articles.id });
    return result.length > 0;
  }
  
  async incrementArticleViews(id: number): Promise<void> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    
    if (article) {
      await db
        .update(articles)
        .set({
          views: (article.views || 0) + 1
        })
        .where(eq(articles.id, id));
    }
  }
  
  // Settings operations
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings);
    if (!setting) {
      // If no settings exist, create default settings
      const [newSettings] = await db.insert(settings).values({
        siteName: "CahayaDigital25",
        logoText: "CD",
        primaryColor: "#e53e3e",
        secondaryColor: "#333333",
        accentColor: "#f6ad55"
      }).returning();
      return newSettings;
    }
    return setting;
  }
  
  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    const [setting] = await db.select().from(settings);
    
    if (!setting) {
      // If no settings exist, create with the provided updates
      const [newSettings] = await db.insert(settings).values({
        siteName: settingsUpdate.siteName || "CahayaDigital25",
        logoText: settingsUpdate.logoText || "CD",
        primaryColor: settingsUpdate.primaryColor || "#e53e3e",
        secondaryColor: settingsUpdate.secondaryColor || "#333333",
        accentColor: settingsUpdate.accentColor || "#f6ad55"
      }).returning();
      return newSettings;
    }
    
    // Update existing settings
    const [updatedSettings] = await db
      .update(settings)
      .set(settingsUpdate)
      .where(eq(settings.id, setting.id))
      .returning();
    return updatedSettings;
  }
  
  // Subscriber operations
  async addSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    try {
      const [subscriber] = await db.insert(subscribers).values(insertSubscriber).returning();
      return subscriber;
    } catch (error) {
      // If email already exists, return existing subscriber
      const [subscriber] = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, insertSubscriber.email));
      return subscriber;
    }
  }
  
  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  // Initialize admin user if it doesn't exist
  async initialize() {
    const adminUser = await this.getUserByUsername("Onomah1337*$");
    
    if (!adminUser) {
      await this.createUser({
        username: "Onomah1337*$",
        password: "Onomah1337*$",
        fullName: "Administrator",
        email: "admin@cahayadigital25.com",
        role: "admin",
        isActive: true
      });
    }

    // Seed articles and settings if needed
    await this.seedInitialData();
  }

  // Seed initial data if needed
  private async seedInitialData() {
    // Check if there are any articles
    const articleCount = await db.select().from(articles);
    
    if (articleCount.length === 0) {
      // Seed sample articles
      const sampleArticles: InsertArticle[] = [
        {
          title: "Kebijakan Ekonomi Digital Terbaru Diresmikan oleh Pemerintah",
          content: `<p>Pemerintah Indonesia telah meresmikan kebijakan ekonomi digital terbaru yang bertujuan untuk mendorong pertumbuhan sektor teknologi dan inovasi di tanah air. Kebijakan ini mencakup berbagai insentif fiskal bagi startup dan perusahaan teknologi, serta menyederhanakan proses perizinan.</p><p>Menteri Koordinator Bidang Perekonomian menyatakan bahwa kebijakan ini diharapkan dapat mempercepat transformasi digital Indonesia dan mendorong pertumbuhan ekonomi berbasis teknologi yang inklusif.</p><p>Beberapa poin utama dari kebijakan tersebut meliputi:</p><ul><li>Insentif pajak untuk investasi di bidang riset dan pengembangan teknologi</li><li>Kemudahan perizinan bagi startup teknologi</li><li>Program pendanaan untuk pengembangan infrastruktur digital di daerah tertinggal</li><li>Regulasi yang mendukung ekonomi berbagi (sharing economy)</li></ul><p>Para pelaku industri menyambut positif kebijakan ini dan berharap implementasinya dapat dilakukan secara konsisten untuk memberikan kepastian usaha.</p>`,
          summary: "Pemerintah telah mengumumkan serangkaian kebijakan baru yang bertujuan untuk mendorong perkembangan ekonomi digital di Indonesia.",
          category: "ekonomi",
          imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          author: "Budi Santoso",
          authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
          isFeatured: true,
          isBreaking: true,
          isEditorsPick: false
        },
        {
          title: "5 Terobosan Teknologi yang Akan Mengubah Masa Depan",
          content: `<p>Perkembangan teknologi terus bergerak dengan cepat dan beberapa inovasi terbaru diprediksi akan mengubah cara kita hidup di masa depan. Berikut adalah 5 terobosan teknologi yang perlu diperhatikan:</p><h3>1. Komputasi Kuantum</h3><p>Komputer kuantum menjanjikan kemampuan komputasi yang jauh melampaui komputer konvensional. Beberapa perusahaan teknologi besar telah mencapai "supremasi kuantum" dan terus mengembangkan teknologi ini untuk aplikasi praktis.</p><h3>2. Kecerdasan Buatan Generatif</h3><p>AI yang dapat menghasilkan konten kreatif seperti teks, gambar, musik, dan kode program terus berkembang pesat, membuka kemungkinan baru dalam berbagai industri.</p><h3>3. Bioteknologi CRISPR</h3><p>Teknologi pengeditan gen CRISPR membuka jalan bagi pengobatan penyakit genetik dan peningkatan ketahanan pangan melalui modifikasi genetik yang lebih presisi.</p><h3>4. Internet of Things (IoT) dengan 5G</h3><p>Kombinasi IoT dengan jaringan 5G akan memungkinkan lebih banyak perangkat terhubung dengan latensi rendah, mendukung smart city dan otomatisasi industri.</p><h3>5. Energi Terbarukan dengan Penyimpanan Baterai Canggih</h3><p>Kemajuan dalam teknologi penyimpanan energi membuat sumber energi terbarukan semakin layak secara ekonomi dan mendukung transisi energi global.</p>`,
          summary: "Inovasi dan perkembangan teknologi terkini yang diprediksi akan membawa perubahan besar.",
          category: "teknologi",
          imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
          author: "Dian Kusuma",
          authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
          isFeatured: false,
          isBreaking: false,
          isEditorsPick: true
        }
      ];
      
      for (const article of sampleArticles) {
        await this.createArticle(article);
      }
    }
    
    // Initialize settings if needed
    await this.getSettings();
  }
}

// Export both pool and storage for use in routes
export { pool };

// Initialize the storage instance
export const storage = new DatabaseStorage();

// Initialize storage
(async () => {
  await storage.initialize();
})().catch(console.error);
