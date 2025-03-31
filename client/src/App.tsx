import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import NewsCategory from "@/pages/NewsCategory";
import ArticleDetail from "@/pages/ArticleDetail";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminArticles from "@/pages/AdminArticles";
import AdminUsers from "@/pages/AdminUsers";
import AdminSettings from "@/pages/AdminSettings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:category" component={NewsCategory} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/panel/login.php" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/articles" component={AdminArticles} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Konfigurasi untuk domain cahayadigital25.rf.gd
    document.title = "CahayaDigital25";
    
    // Set meta tag untuk domain
    const metaTag = document.createElement('meta');
    metaTag.name = 'domain';
    metaTag.content = 'cahayadigital25.rf.gd';
    document.head.appendChild(metaTag);
    
    // Set favicon untuk domain
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.href = '/favicon.ico';
    document.head.appendChild(faviconLink);
    
    // Tambahkan meta description
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Portal berita terpercaya dan terkini di CahayaDigital25';
    document.head.appendChild(metaDescription);
    
    // Log konfirmasi transfer domain
    console.log('Domain configured: cahayadigital25.rf.gd');
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
