import { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Download, 
  Loader2, 
  FolderOpen, 
  Plus, 
  Tag, 
  Calendar,
  AlertCircle,
  FileImage,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const AdminMedia = () => {
  const { userInfo } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  // Form States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Logo');

  // Deletion Toggles
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const categories = ['Logo', 'Thank You Card', 'Banner', 'Promotion', 'Other'];
  const filterTabs = ['All', 'Logo', 'Thank You Card', 'Banner', 'Promotion', 'Other'];

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`${API_URL}/api/media`, {
          headers: {
            'Authorization': `Bearer ${userInfo?.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMediaItems(data);
        } else {
          toast.error('Failed to load media assets');
        }
      } catch (error) {
        console.error('Error fetching media:', error);
        toast.error('Failed to load media assets');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [userInfo]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image assets are supported currently.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Pre-fill name if empty
      if (!assetName) {
        setAssetName(file.name.split('.')[0]);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an asset image file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', assetName);
      formData.append('category', assetCategory);

      const res = await fetch(`${API_URL}/api/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: formData
      });

      if (res.ok) {
        const newAsset = await res.json();
        setMediaItems([newAsset, ...mediaItems]);
        toast.success('Asset uploaded successfully!');
        
        // Reset Form
        setSelectedFile(null);
        setPreviewUrl('');
        setAssetName('');
        setAssetCategory('Logo');
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to upload brand asset.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Connection error. Failed to upload asset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      if (res.ok) {
        setMediaItems(mediaItems.filter(item => item._id !== id));
        toast.success('Asset deleted successfully!');
        setConfirmDeleteId(null);
      } else {
        toast.error('Failed to delete asset.');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      toast.error('Connection error. Failed to delete asset.');
    }
  };

  const handleDownload = async (item) => {
    try {
      toast.loading('Preparing download...', { id: 'download-toast' });
      const res = await fetch(item.url);
      if (!res.ok) throw new Error('File download failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${item.name.replace(/\s+/g, '_')}_${item.category.replace(/\s+/g, '_')}.${item.url.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Asset downloaded successfully!', { id: 'download-toast' });
    } catch (error) {
      console.error('Download Error:', error);
      toast.error('Failed to download asset. Try opening link in new tab.', { id: 'download-toast' });
    }
  };

  const filteredMedia = activeTab === 'All' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeTab);

  if (loading) return (
    <div className="p-12 text-center">
      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-secondary/60 font-serif italic">Loading media assets registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary">Media Assets Manager</h1>
          <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">Upload and manage brand visuals, custom logos, and promotional designs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload Brand Asset Block */}
        <form onSubmit={handleUploadSubmit} className="lg:col-span-4 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primaryContainer/10 flex items-center justify-center text-primary">
              <Upload size={16} />
            </div>
            <h3 className="font-serif text-lg text-primary font-bold">Upload Brand Visual</h3>
          </div>
          
          <div className="space-y-4">
            {/* File Drop / Input */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block ml-1">Asset Image File</label>
              <div className="border-2 border-dashed border-champagne rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-primary transition-all relative cursor-pointer overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {previewUrl ? (
                  <div className="text-center space-y-3">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-24 h-24 object-contain mx-auto rounded-lg shadow-sm border border-champagne"
                    />
                    <span className="text-[10px] text-primary/70 font-semibold truncate block max-w-[200px]">{selectedFile?.name}</span>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                    <FileImage size={28} className="text-primary/30 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-primary/50 block font-sans">Click or Drag & Drop</span>
                    <span className="text-[9px] text-secondary/40 block">PNG, JPG, WEBP, or AVIF</span>
                  </div>
                )}
              </div>
            </div>

            {/* Asset Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block ml-1">Asset Display Name</label>
              <input
                type="text"
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-sans text-xs text-primary font-bold shadow-sm"
                placeholder="e.g. Zaloura Main Logo Black"
                required
              />
            </div>

            {/* Asset Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block ml-1">Asset Category</label>
              <select
                value={assetCategory}
                onChange={e => setAssetCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-sans text-xs text-primary font-bold shadow-sm cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Upload Brand Asset
            </button>
          </div>
        </form>

        {/* Gallery Grid Block */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Category Filtering Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
            <Filter size={14} className="text-secondary/40 mr-2" />
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-gray-100 text-secondary hover:bg-gray-50'
                }`}
              >
                {tab === 'All' ? 'All Assets' : `${tab}s`}
              </button>
            ))}
          </div>

          {filteredMedia.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-16 text-center space-y-4">
              <FolderOpen size={48} className="text-champagne/40 mx-auto" />
              <h3 className="font-serif text-xl text-primary font-bold">No registered brand assets</h3>
              <p className="text-xs text-secondary/40 max-w-sm mx-auto">Upload logos, customized thank-you card designs, or catalog banners on the left panel to populate your media assets catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMedia.map(item => (
                <div key={item._id} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                  
                  {/* Category Badge */}
                  <span className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider border shadow-sm ${
                    item.category === 'Logo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    item.category === 'Thank You Card' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    item.category === 'Banner' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    item.category === 'Promotion' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {item.category}
                  </span>

                  {/* Asset Preview Frame */}
                  <div 
                    onClick={() => setPreviewAsset(item)}
                    className="h-44 bg-gray-50 border-b border-gray-50 flex items-center justify-center p-6 relative overflow-hidden group cursor-pointer"
                  >
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewAsset(item); }}
                        className="w-10 h-10 rounded-full bg-white text-primary hover:bg-primary hover:text-white flex items-center justify-center shadow-md transition-all scale-90 group-hover:scale-100"
                        title="Preview Asset"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                        className="w-10 h-10 rounded-full bg-white text-primary hover:bg-primary hover:text-white flex items-center justify-center shadow-md transition-all scale-90 group-hover:scale-100"
                        title="Download Asset"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item._id); }}
                        className="w-10 h-10 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-md transition-all scale-90 group-hover:scale-100"
                        title="Delete Asset"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div className="space-y-1">
                      <h4 className="font-sans text-xs font-bold text-primary tracking-tight truncate" title={item.name}>{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-secondary/40 font-medium">
                        <Calendar size={10} />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deletion Dialog Overlay */}
                  {confirmDeleteId === item._id && (
                    <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-150">
                      <AlertCircle size={32} className="text-red-500" />
                      <div className="space-y-1">
                        <h5 className="font-sans text-xs font-bold text-primary">Remove Asset?</h5>
                        <p className="text-[10px] text-secondary/50 max-w-[180px] mx-auto">This permanently erases the image from Cloudinary storage.</p>
                      </div>
                      <div className="flex items-center gap-3 w-full max-w-[200px]">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-secondary py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Premium Lightbox Modal Preview */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Close Backdrop */}
          <div className="absolute inset-0" onClick={() => setPreviewAsset(null)}></div>
          
          <div className="bg-white border border-gray-100 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary border border-gray-100 shadow-md flex items-center justify-center transition-all hover:scale-105"
            >
              <X size={18} />
            </button>

            {/* Left Column: Image Frame */}
            <div className="md:w-3/5 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-50 relative min-h-[300px] md:min-h-[450px]">
              <img 
                src={previewAsset.url} 
                alt={previewAsset.name} 
                className="max-w-full max-h-[380px] object-contain shadow-md rounded-2xl bg-white p-3 border border-champagne/30"
              />
            </div>

            {/* Right Column: Meta & Actions */}
            <div className="md:w-2/5 p-8 flex flex-col justify-between space-y-8 bg-white">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider border shadow-sm ${
                    previewAsset.category === 'Logo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    previewAsset.category === 'Thank You Card' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    previewAsset.category === 'Banner' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    previewAsset.category === 'Promotion' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {previewAsset.category}
                  </span>
                  <h3 className="font-serif text-xl text-primary font-bold leading-snug break-words">{previewAsset.name}</h3>
                </div>

                <div className="space-y-3 font-sans text-xs text-secondary/60">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                    <Calendar size={14} className="text-primary/30" />
                    <span>Uploaded on {formatDate(previewAsset.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                    <Tag size={14} className="text-primary/30" />
                    <span className="truncate max-w-[200px]" title={previewAsset.url}>Cloud Link: <a href={previewAsset.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">View Original</a></span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 w-full">
                <button
                  onClick={() => handleDownload(previewAsset)}
                  className="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Download Asset
                </button>
                <button
                  onClick={() => {
                    setConfirmDeleteId(previewAsset._id);
                    setPreviewAsset(null);
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-500 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
