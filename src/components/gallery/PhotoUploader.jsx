import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const PhotoUploader = ({ salonId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [captions, setCaptions] = useState({});

  useEffect(() => {
    if (salonId) {
      loadPhotos();
    }
  }, [salonId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salon_photos')
        .select('*')
        .eq('salon_id', salonId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
      
      // Initialize captions state
      const initialCaptions = {};
      (data || []).forEach(p => {
        initialCaptions[p.id] = p.caption || '';
      });
      setCaptions(initialCaptions);
    } catch (error) {
      console.error('Error loading salon photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (photos.length + files.length > 10) {
      alert('You can only upload up to 10 photos in total.');
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${salonId}/${fileName}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('salon-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('salon-photos')
          .getPublicUrl(filePath);

        // 3. Save to database
        const { error: dbError } = await supabase
          .from('salon_photos')
          .insert({
            salon_id: salonId,
            photo_url: publicUrl,
            caption: '',
            display_order: photos.length
          });

        if (dbError) throw dbError;
      }

      await loadPhotos();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      // 1. Extract path and remove from Supabase Storage
      const pathParts = photo.photo_url.split('/public/salon-photos/');
      if (pathParts.length > 1) {
        const storagePath = decodeURIComponent(pathParts[1]);
        await supabase.storage.from('salon-photos').remove([storagePath]);
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('salon_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // 3. Update state
      setPhotos(photos.filter(p => p.id !== photo.id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  const handleUpdateCaption = async (photoId) => {
    const caption = captions[photoId] || '';
    try {
      const { error } = await supabase
        .from('salon_photos')
        .update({ caption })
        .eq('id', photoId);

      if (error) throw error;
      alert('Caption updated successfully!');
      
      // Update photos state
      setPhotos(photos.map(p => p.id === photoId ? { ...p, caption } : p));
    } catch (error) {
      console.error('Failed to update caption:', error);
      alert('Failed to update caption: ' + error.message);
    }
  };

  return (
    <div className="space-y-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 soft-glow shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <h3 className="font-headline-md text-[20px] text-on-surface font-semibold">Salon Photo Gallery</h3>
          <p className="text-body-sm text-on-surface-variant">Upload up to 10 photos of your salon space, styled work, or service results.</p>
        </div>
        <div className="font-label-lg text-label-lg text-secondary">
          {photos.length} / 10 Photos
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="animate-spin material-symbols-outlined text-primary text-3xl">sync</span>
        </div>
      ) : (
        <>
          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative flex flex-col bg-surface border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                <div className="h-44 relative overflow-hidden bg-surface-container">
                  <img 
                    src={photo.photo_url} 
                    alt="Salon gallery item" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => handleDeletePhoto(photo)}
                    className="absolute top-3 right-3 bg-error-container text-error hover:bg-error hover:text-on-error w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Delete photo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <input 
                    type="text" 
                    placeholder="Add a caption..." 
                    value={captions[photo.id] || ''}
                    onChange={(e) => setCaptions({ ...captions, [photo.id]: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded px-2.5 py-1 text-xs outline-none focus:border-primary"
                  />
                  {captions[photo.id] !== (photo.caption || '') && (
                    <button 
                      onClick={() => handleUpdateCaption(photo.id)}
                      className="w-full py-1 bg-primary-container text-on-primary text-[10px] font-semibold uppercase tracking-wider rounded hover:bg-primary transition-colors"
                    >
                      Save Caption
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Upload Box (if under 10) */}
            {photos.length < 10 && (
              <label className="border-2 border-dashed border-outline-variant/60 hover:border-primary-container rounded-xl flex flex-col items-center justify-center h-64 cursor-pointer p-6 hover:bg-surface-container-low transition-all duration-300">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-primary text-3xl mb-2">sync</span>
                    <span className="font-label-lg text-secondary text-sm">Uploading photo(s)...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-outline text-4xl mb-3 font-light">add_photo_alternate</span>
                    <span className="font-label-lg text-on-surface font-semibold text-center">Upload Photos</span>
                    <span className="text-xs text-on-surface-variant text-center mt-1">Drag and drop or browse files</span>
                  </>
                )}
              </label>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoUploader;
