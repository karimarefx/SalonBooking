import React, { useState } from 'react';

const PhotoGallery = ({ photos = [], defaultImages = [] }) => {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Combine photos from DB and default fallback images
  const allImages = photos.length > 0 
    ? photos.map(p => p.photo_url) 
    : defaultImages;

  if (allImages.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full">
      {/* Grid Layout (Desktop bento/grid) */}
      <div className="hidden md:grid grid-cols-12 gap-gutter h-[450px] md:h-[550px] w-full">
        {allImages.slice(0, 3).map((imgUrl, index) => {
          // Bento styles: first image takes 8 cols, next two take 4 cols each
          const isLarge = index === 0 && allImages.length >= 3;
          const colSpan = isLarge ? 'col-span-8' : allImages.length === 1 ? 'col-span-12' : allImages.length === 2 ? 'col-span-6' : 'col-span-4';
          
          return (
            <div 
              key={index} 
              onClick={() => setLightboxIndex(index)}
              className={`${colSpan} h-full rounded-xl overflow-hidden relative group cursor-pointer border border-outline-variant/20 shadow-sm`}
            >
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={imgUrl} 
                alt={`Sanctuary Gallery ${index + 1}`}
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl font-light">zoom_in</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Layout (Mobile snap-scroll) */}
      <div className="md:hidden relative w-full overflow-hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 px-margin-mobile py-2">
          {allImages.map((imgUrl, index) => (
            <div 
              key={index} 
              onClick={() => setLightboxIndex(index)}
              className="flex-shrink-0 w-[85vw] h-64 rounded-xl overflow-hidden snap-center soft-glow border border-outline-variant/20 relative"
            >
              <img 
                className="w-full h-full object-cover" 
                src={imgUrl} 
                alt={`Sanctuary Gallery ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 right-8 bg-surface-container-lowest/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-secondary flex items-center gap-1 shadow-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-[14px] block">image</span>
          <span>{allImages.length} photos</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex >= 0 && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
          onClick={() => setLightboxIndex(-1)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setLightboxIndex(-1)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Left Arrow */}
          {allImages.length > 1 && (
            <button 
              className="absolute left-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full"
              onClick={handlePrev}
            >
              <span className="material-symbols-outlined text-2xl">chevron_left</span>
            </button>
          )}

          {/* Image */}
          <div className="max-w-[90vw] max-h-[80vh] flex flex-col items-center">
            <img 
              className="max-w-full max-h-[75vh] object-contain rounded-lg" 
              src={allImages[lightboxIndex]} 
              alt={`Gallery Fullscreen ${lightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
            {photos[lightboxIndex]?.caption && (
              <p className="text-white/90 text-sm mt-4 font-medium px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
                {photos[lightboxIndex].caption}
              </p>
            )}
          </div>

          {/* Right Arrow */}
          {allImages.length > 1 && (
            <button 
              className="absolute right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full"
              onClick={handleNext}
            >
              <span className="material-symbols-outlined text-2xl">chevron_right</span>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 text-white/60 text-sm font-semibold">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
