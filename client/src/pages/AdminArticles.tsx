import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Article, InsertArticle, insertArticleSchema, categoryEnum } from '@shared/schema';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { formatDate, categoryLabels } from '@/lib/utils';
import FileUploader from '@/components/FileUploader';

// Create article form schema
const articleSchema = insertArticleSchema.extend({
  title: z.string().min(5, { message: 'Judul minimal 5 karakter' }),
  content: z.string().min(50, { message: 'Konten artikel minimal 50 karakter' }),
  summary: z.string().min(10, { message: 'Ringkasan minimal 10 karakter' }),
  imageUrl: z.string().min(1, { message: 'Gambar artikel harus diisi' }),
  author: z.string().min(3, { message: 'Nama penulis minimal 3 karakter' }),
  authorImage: z.string().optional().nullable(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function AdminArticles() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  // Fetch articles
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  // Create form
  const addForm = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      category: 'politik',
      imageUrl: '',
      author: '',
      authorImage: '',
      isFeatured: false,
      isBreaking: false,
      isEditorsPick: false,
    },
  });

  // Edit form
  const editForm = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      summary: '',
      category: 'politik',
      imageUrl: '',
      author: '',
      authorImage: '',
      isFeatured: false,
      isBreaking: false,
      isEditorsPick: false,
    },
  });

  // Add article mutation
  const addMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      await apiRequest('POST', '/api/articles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Artikel berhasil ditambahkan',
        description: 'Artikel baru telah berhasil dipublikasikan.',
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: 'Gagal menambahkan artikel',
        description: 'Terjadi kesalahan saat menambahkan artikel baru.',
        variant: 'destructive',
      });
    },
  });

  // Edit article mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArticleFormValues }) => {
      await apiRequest('PATCH', `/api/articles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Artikel berhasil diperbarui',
        description: 'Perubahan pada artikel telah disimpan.',
      });
      setIsEditDialogOpen(false);
      setCurrentArticle(null);
    },
    onError: () => {
      toast({
        title: 'Gagal memperbarui artikel',
        description: 'Terjadi kesalahan saat memperbarui artikel.',
        variant: 'destructive',
      });
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Artikel berhasil dihapus',
        description: 'Artikel telah dihapus dari sistem.',
      });
      setIsDeleteAlertOpen(false);
      setCurrentArticle(null);
    },
    onError: () => {
      toast({
        title: 'Gagal menghapus artikel',
        description: 'Terjadi kesalahan saat menghapus artikel.',
        variant: 'destructive',
      });
    },
  });

  // Handle add article submission
  const onAddSubmit = (data: ArticleFormValues) => {
    addMutation.mutate(data);
  };

  // Handle edit article submission
  const onEditSubmit = (data: ArticleFormValues) => {
    if (currentArticle) {
      editMutation.mutate({ id: currentArticle.id, data });
    }
  };

  // Handle delete article
  const handleDelete = () => {
    if (currentArticle) {
      deleteMutation.mutate(currentArticle.id);
    }
  };

  // Handle edit button click
  const handleEditClick = (article: Article) => {
    setCurrentArticle(article);
    editForm.reset({
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.category,
      imageUrl: article.imageUrl,
      author: article.author,
      authorImage: article.authorImage || '',
      isFeatured: article.isFeatured,
      isBreaking: article.isBreaking,
      isEditorsPick: article.isEditorsPick,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (article: Article) => {
    setCurrentArticle(article);
    setIsDeleteAlertOpen(true);
  };

  // Filter articles based on search query
  const filteredArticles = articles
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="pl-64 pt-6 pb-12">
        <div className="container px-6 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Kelola Artikel</h1>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-brand-red hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" /> Tambah Artikel
            </Button>
          </div>

          {/* Search and filters */}
          <div className="bg-white rounded-lg p-4 mb-6 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Cari artikel..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Articles list */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Artikel</CardTitle>
              <CardDescription>
                Kelola semua artikel yang telah dipublikasikan di CahayaDigital25
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : filteredArticles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-4 py-3 font-medium">Judul</th>
                        <th className="px-4 py-3 font-medium">Kategori</th>
                        <th className="px-4 py-3 font-medium">Penulis</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Tanggal</th>
                        <th className="px-4 py-3 font-medium">Views</th>
                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((article) => (
                        <tr key={article.id} className="border-b">
                          <td className="px-4 py-4 font-medium">{article.title}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {categoryLabels[article.category]}
                            </span>
                          </td>
                          <td className="px-4 py-4">{article.author}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {article.isFeatured && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Featured</span>
                              )}
                              {article.isBreaking && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Breaking</span>
                              )}
                              {article.isEditorsPick && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">Editor's Pick</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">{formatDate(article.publishedAt)}</td>
                          <td className="px-4 py-4">{article.views}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(article)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteClick(article)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? 'Tidak ada artikel yang sesuai dengan pencarian' : 'Belum ada artikel yang ditambahkan'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Article Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Artikel Baru</DialogTitle>
                <DialogDescription>
                  Isi form berikut untuk menambahkan artikel baru ke website CahayaDigital25
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-6">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Artikel</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul artikel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={addForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryEnum.enumValues.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {categoryLabels[category]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penulis</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama penulis" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={addForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gambar Artikel</FormLabel>
                          <div className="space-y-2">
                            <FileUploader
                              onUploadSuccess={(fileUrl) => field.onChange(fileUrl)}
                              label="Unggah gambar artikel"
                              buttonText="Unggah"
                            />
                            {field.value && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <img 
                                  src={field.value} 
                                  alt="Preview" 
                                  className="w-full max-w-[200px] h-auto object-cover rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="authorImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gambar Penulis (Opsional)</FormLabel>
                          <div className="space-y-2">
                            <FileUploader
                              onUploadSuccess={(fileUrl) => field.onChange(fileUrl)}
                              label="Unggah gambar penulis"
                              buttonText="Unggah"
                            />
                            {field.value && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <img 
                                  src={field.value} 
                                  alt="Preview" 
                                  className="w-full max-w-[100px] h-auto object-cover rounded-full border"
                                />
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ringkasan Artikel</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ringkasan singkat dari artikel" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konten Artikel</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Isi lengkap artikel dalam format HTML" 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Status Artikel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={addForm.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Featured Article</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="isBreaking"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Breaking News</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="isEditorsPick"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Editor's Pick</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Batal</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      className="bg-brand-red hover:bg-red-700"
                      disabled={addMutation.isPending}
                    >
                      {addMutation.isPending ? 'Menyimpan...' : 'Simpan Artikel'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Article Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Artikel</DialogTitle>
                <DialogDescription>
                  Edit informasi artikel berikut
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Artikel</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan judul artikel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryEnum.enumValues.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {categoryLabels[category]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penulis</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama penulis" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={editForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gambar Artikel</FormLabel>
                          <div className="space-y-2">
                            <FileUploader
                              onUploadSuccess={(fileUrl) => field.onChange(fileUrl)}
                              label="Unggah gambar artikel"
                              buttonText="Unggah"
                            />
                            {field.value && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <img 
                                  src={field.value} 
                                  alt="Preview" 
                                  className="w-full max-w-[200px] h-auto object-cover rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="authorImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gambar Penulis (Opsional)</FormLabel>
                          <div className="space-y-2">
                            <FileUploader
                              onUploadSuccess={(fileUrl) => field.onChange(fileUrl)}
                              label="Unggah gambar penulis"
                              buttonText="Unggah"
                            />
                            {field.value && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <img 
                                  src={field.value} 
                                  alt="Preview" 
                                  className="w-full max-w-[200px] h-auto object-cover rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ringkasan Artikel</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ringkasan singkat dari artikel" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konten Artikel</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Isi lengkap artikel dalam format HTML" 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Status Artikel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={editForm.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Featured Article</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="isBreaking"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Breaking News</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="isEditorsPick"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Editor's Pick</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Batal</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      className="bg-brand-red hover:bg-red-700"
                      disabled={editMutation.isPending}
                    >
                      {editMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
