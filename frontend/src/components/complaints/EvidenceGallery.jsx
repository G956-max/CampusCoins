import React, { useState } from 'react';
import { Image, FileText, Video, Download, ExternalLink, Eye, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { cn } from '../../utils/cn';

const EvidenceGallery = ({ evidence = [], className }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-slate-800/80">
        No photo or document evidence attached to this ticket.
      </div>
    );
  }

  const getIcon = (type = '') => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return FileText;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {evidence.map((item, idx) => {
          const isImage = item.file_type?.startsWith('image/') || item.file_url?.startsWith('data:image/');
          const isVideo = item.file_type?.startsWith('video/');
          const Icon = getIcon(item.file_type);

          return (
            <div
              key={item.id || idx}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 group hover:border-slate-700 transition-all"
            >
              {/* Preview Thumbnail */}
              {isImage ? (
                <div
                  onClick={() => setSelectedImage(item.file_url)}
                  className="relative h-32 w-full rounded-lg overflow-hidden bg-slate-950 cursor-pointer group/thumb"
                >
                  <img
                    src={item.file_url}
                    alt="Complaint Evidence"
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="p-2 rounded-full bg-slate-900/80 text-white">
                      <Eye size={18} />
                    </span>
                  </div>
                </div>
              ) : isVideo ? (
                <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Video size={32} className="text-campus-400" />
                  <span className="text-[11px]">Video Evidence</span>
                </div>
              ) : (
                <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FileText size={32} className="text-sky-400" />
                  <span className="text-[11px]">PDF Document</span>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[150px]">
                  {item.file_type || 'Attachment'}
                </span>

                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1 text-campus-400 hover:text-campus-300 font-semibold"
                >
                  <Download size={13} />
                  <span>Open</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Image Preview Modal */}
      <Modal
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        title="Evidence Preview"
        maxWidth="max-w-3xl"
        footer={
          <Button variant="primary" size="sm" onClick={() => setSelectedImage(null)}>
            Close
          </Button>
        }
      >
        {selectedImage && (
          <div className="max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 p-2">
            <img
              src={selectedImage}
              alt="Full preview"
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EvidenceGallery;
