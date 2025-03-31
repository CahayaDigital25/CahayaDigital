import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage, pool } from "./storage";
import { insertArticleSchema, insertSubscriberSchema, insertSettingsSchema, insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure CORS for custom domain
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://cahayadigital25.rf.gd");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    next();
  });
  
  // Set up file upload directory
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Configure multer storage
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      // Create unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  // Create upload middleware
  const upload = multer({ 
    storage,
    limits: { 
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
      // Accept only images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Hanya file gambar yang diperbolehkan') as any);
      }
    }
  });
  
  // Serve static files from public directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  
  // API routes - prefix all routes with /api
  
  // Article routes
  app.get("/api/articles", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const articles = await dbStorage.getArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching articles" });
    }
  });
  
  app.get("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await dbStorage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Increment article views
      await dbStorage.incrementArticleViews(id);
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Error fetching article" });
    }
  });
  
  app.get("/api/articles/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const articles = await dbStorage.getArticlesByCategory(category, limit, offset);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching articles by category" });
    }
  });
  
  app.get("/api/articles/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const articles = await dbStorage.getFeaturedArticles(limit);
      res.json(articles || []);
    } catch (error) {
      console.error('Error in featured articles:', error);
      res.json([]);  // Return empty array instead of error
    }
  });
  
  app.get("/api/articles/breaking", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1;
      const articles = await dbStorage.getBreakingNews(limit);
      res.json(articles || []);
    } catch (error) {
      console.error('Error in breaking news:', error);
      res.json([]);  // Return empty array instead of error
    }
  });
  
  app.get("/api/articles/editors-pick", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1;
      const articles = await dbStorage.getEditorsPicks(limit);
      res.json(articles || []);
    } catch (error) {
      console.error('Error in editors pick:', error);
      res.json([]);  // Return empty array instead of error
    }
  });
  
  app.get("/api/articles/popular", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const articles = await dbStorage.getPopularArticles(limit);
      res.json(articles || []);
    } catch (error) {
      console.error('Error in popular articles:', error);
      res.json([]);  // Return empty array instead of error
    }
  });
  
  app.post("/api/articles", async (req: Request, res: Response) => {
    try {
      const result = insertArticleSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const article = await dbStorage.createArticle(result.data);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ message: "Error creating article" });
    }
  });
  
  app.patch("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await dbStorage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const updatedArticle = await dbStorage.updateArticle(id, req.body);
      res.json(updatedArticle);
    } catch (error) {
      res.status(500).json({ message: "Error updating article" });
    }
  });
  
  app.delete("/api/articles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await dbStorage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      await dbStorage.deleteArticle(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting article" });
    }
  });
  
  // Settings routes
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await dbStorage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });
  
  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      const result = insertSettingsSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedSettings = await dbStorage.updateSettings(result.data);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Error updating settings" });
    }
  });
  
  // Subscriber routes
  app.post("/api/subscribers", async (req: Request, res: Response) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const subscriber = await dbStorage.addSubscriber(result.data);
      res.status(201).json(subscriber);
    } catch (error) {
      res.status(500).json({ message: "Error adding subscriber" });
    }
  });
  
  app.get("/api/subscribers", async (req: Request, res: Response) => {
    try {
      const subscribers = await dbStorage.getSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscribers" });
    }
  });
  
  // User management routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await dbStorage.getUsers();
      // Don't send passwords to client
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await dbStorage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const user = await dbStorage.createUser(result.data);
      // Don't send password to client
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await dbStorage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await dbStorage.updateUser(id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await dbStorage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await dbStorage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // File Upload routes
  app.post("/api/upload", upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file yang diunggah" });
      }
      
      // Return the URL of the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        fileUrl,
        message: "Berhasil mengunggah file"
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Error saat mengunggah file" });
    }
  });
  
  // Authentication
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Check for hardcoded admin credentials
      if (username === "Onomah1337*$" && password === "Onomah1337*$") {
        // Add 1-second delay as requested
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.json({ 
          success: true, 
          message: "Login successful",
          user: {
            id: 1,
            username: "Onomah1337*$",
            role: "admin",
            fullName: "Administrator"
          }
        });
      }
      
      // Check database for other users
      const user = await dbStorage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      
      // Add 1-second delay as requested
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Don't send password to client
      const { password: userPassword, ...safeUser } = user;
      res.json({ 
        success: true, 
        message: "Login successful",
        user: safeUser
      });
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });

  return httpServer;
}
